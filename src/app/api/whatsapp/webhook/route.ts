import { NextRequest, NextResponse } from 'next/server'
import { whapiClient, WhapiWebhookPayload } from '@/lib/whapi/client'
import { createClient } from '@/lib/supabase/server'
import { createStateMachine } from '@/lib/conversation/state-machine'
import { analyzeCustomerIntent, getProductRecommendations } from '@/lib/openai/client'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature') || ''
    const body = await request.text()
    
    if (!whapiClient.verifyWebhook(signature, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload: WhapiWebhookPayload = JSON.parse(body)
    const supabase = createClient()

    // Process each message
    for (const message of payload.messages) {
      await processMessage(message, supabase)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processMessage(
  message: { id: string; from: string; body: string; timestamp: number },
  supabase: any
) {
  const phoneNumber = message.from
  const messageText = message.body

  // Get or create user
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single()

  if (!user) {
    const { data: newUser } = await supabase
      .from('users')
      .insert({
        phone_number: phoneNumber,
        role: 'customer',
      })
      .select()
      .single()
    user = newUser
  }

  // Check for deletion request
  if (messageText.toLowerCase().includes('supprimer')) {
    await handleDeletionRequest(user.id, phoneNumber, supabase)
    return
  }

  // Get or create active conversation
  let { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'open')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (!conversation) {
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        status: 'open',
        current_state: 'greeting',
      })
      .select()
      .single()
    conversation = newConv
  }

  // Save incoming message
  await supabase.from('messages').insert({
    conversation_id: conversation.id,
    sender: 'user',
    content: messageText,
  })

  // Process conversation state
  const stateMachine = createStateMachine({
    userId: user.id,
    conversationId: conversation.id,
    currentState: conversation.current_state,
    data: conversation.conversation_data || {},
  })

  // Check for escalation
  if (stateMachine.shouldEscalateToHuman(messageText)) {
    await handleEscalation(conversation.id, 'User requested human assistance', supabase)
    await whapiClient.sendMessage({
      to: phoneNumber,
      body: "Je vous mets en relation avec un de nos conseillers. Vous serez contacté sous peu. 👨‍⚕️",
    })
    return
  }

  // Handle conversation flow
  await handleConversationFlow(
    stateMachine,
    messageText,
    phoneNumber,
    conversation,
    user,
    supabase
  )
}

async function handleConversationFlow(
  stateMachine: any,
  messageText: string,
  phoneNumber: string,
  conversation: any,
  user: any,
  supabase: any
) {
  const currentState = stateMachine.getContext().currentState

  switch (currentState) {
    case 'greeting':
      await whapiClient.sendMessage({
        to: phoneNumber,
        body: `Bonjour ! 👋 Je suis Léa, votre assistante virtuelle de la parapharmacie.

Avant de commencer, j'ai besoin de votre consentement pour traiter vos données personnelles conformément au RGPD.

Acceptez-vous que nous collections et utilisions vos informations pour vous offrir nos services ? 

Répondez "OUI" pour accepter ou "NON" pour refuser.`,
      })
      stateMachine.transition('request_consent')
      break

    case 'consent':
      if (messageText.toLowerCase().includes('oui')) {
        await supabase.from('consent_logs').insert({
          user_id: user.id,
          consent_given: true,
        })
        stateMachine.transition('consent_given')
        
        await whapiClient.sendButtonMessage({
          to: phoneNumber,
          body: `Merci ! 🙏 Comment puis-je vous aider aujourd'hui ?`,
          buttons: [
            { id: 'product_search', title: '🧴 Chercher un produit' },
            { id: 'health_advice', title: '💊 Conseil santé' },
            { id: 'promotions', title: '🎁 Voir les promos' },
          ],
        })
      } else {
        await whapiClient.sendMessage({
          to: phoneNumber,
          body: "Je comprends. Sans votre consentement, je ne peux malheureusement pas vous assister. Au revoir ! 👋",
        })
        stateMachine.transition('consent_denied')
      }
      break

    case 'menu':
      await handleMenuSelection(messageText, phoneNumber, stateMachine, supabase)
      break

    case 'product_search':
    case 'health_advice':
      await handleProductRecommendation(messageText, phoneNumber, user, conversation, supabase)
      break

    default:
      await whapiClient.sendMessage({
        to: phoneNumber,
        body: "Je n'ai pas bien compris. Pouvez-vous reformuler ?",
      })
  }

  // Update conversation state
  await supabase
    .from('conversations')
    .update({
      current_state: stateMachine.getContext().currentState,
      conversation_data: stateMachine.getContext().data,
    })
    .eq('id', conversation.id)
}

async function handleMenuSelection(
  messageText: string,
  phoneNumber: string,
  stateMachine: any,
  supabase: any
) {
  const intent = await analyzeCustomerIntent(messageText)
  
  if (intent.intent === 'product_search') {
    stateMachine.transition('product_search')
    await whapiClient.sendMessage({
      to: phoneNumber,
      body: "Parfait ! Quel type de produit recherchez-vous ? (Par exemple: crème hydratante, vitamines, produit bio...)",
    })
  } else if (intent.intent === 'health_advice') {
    stateMachine.transition('health_advice')
    await whapiClient.sendMessage({
      to: phoneNumber,
      body: "Je suis là pour vous conseiller ! Décrivez-moi votre besoin en quelques mots.",
    })
  } else if (intent.intent === 'promotions') {
    stateMachine.transition('promotions')
    await whapiClient.sendMessage({
      to: phoneNumber,
      body: "Voici nos promotions du moment ! 🎁",
    })
  }
}

async function handleProductRecommendation(
  messageText: string,
  phoneNumber: string,
  user: any,
  conversation: any,
  supabase: any
) {
  // Get available products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .limit(20)

  if (!products || products.length === 0) {
    await whapiClient.sendMessage({
      to: phoneNumber,
      body: "Désolée, aucun produit n'est disponible pour le moment.",
    })
    return
  }

  // Get AI recommendations
  const recommendations = await getProductRecommendations({
    userMessage: messageText,
    userProfile: user.profile_data,
    availableProducts: products,
  })

  // Send conversation response
  await whapiClient.sendMessage({
    to: phoneNumber,
    body: recommendations.conversationResponse,
  })

  // Send product recommendations
  for (const rec of recommendations.recommendations.slice(0, 3)) {
    const product = products.find((p: any) => p.id === rec.productId)
    if (product) {
      if (product.image_url) {
        await whapiClient.sendMediaMessage({
          to: phoneNumber,
          body: '',
          media: {
            url: product.image_url,
            caption: `${product.name}\n💰 ${product.price_cfa} FCFA\n\n${product.description}\n\n${rec.reasoning}`,
          },
        })
      } else {
        await whapiClient.sendMessage({
          to: phoneNumber,
          body: `${product.name}\n💰 ${product.price_cfa} FCFA\n\n${product.description}\n\n${rec.reasoning}`,
        })
      }

      // Save recommendation
      await supabase.from('recommendations').insert({
        conversation_id: conversation.id,
        product_id: product.id,
        score: rec.score,
      })
    }
  }

  // Send cart link
  const cartLink = `${process.env.ECOMMERCE_CART_BASE_URL}?products=${recommendations.recommendations.map((r: any) => r.productId).join(',')}`
  await whapiClient.sendMessage({
    to: phoneNumber,
    body: `Cliquez ici pour finaliser votre commande : ${cartLink}`,
  })
}

async function handleEscalation(
  conversationId: string,
  reason: string,
  supabase: any
) {
  await supabase.from('advisor_alerts').insert({
    conversation_id: conversationId,
    reason,
    status: 'pending',
  })

  await supabase
    .from('conversations')
    .update({ status: 'escalated' })
    .eq('id', conversationId)
}

async function handleDeletionRequest(
  userId: string,
  phoneNumber: string,
  supabase: any
) {
  // Call RGPD deletion function
  await supabase.rpc('delete_user_data', { target_user_id: userId })

  await whapiClient.sendMessage({
    to: phoneNumber,
    body: "Vos données ont été supprimées conformément au RGPD. Au revoir ! 👋",
  })
}
