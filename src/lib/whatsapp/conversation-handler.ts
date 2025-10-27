// @ts-nocheck
/**
 * Gestionnaire de conversations WhatsApp
 * Orchestre Whapi + OpenAI + Supabase
 */

import { createServerClient } from '@/lib/supabase/server-client'
import { sendTypingMessage } from './whapi-client'
import { generateAIResponse, analyzeIntent } from '@/lib/ai/openai-client'

export interface IncomingMessage {
  from: string // Numéro du client
  body: string // Contenu du message
  name?: string // Nom du contact
  timestamp: number
}

/**
 * Traiter un message entrant
 */
export async function handleIncomingMessage(message: IncomingMessage) {
  const supabase = createServerClient()

  try {
    console.log('📨 Message reçu de:', message.from, '-', message.body)

    // 1. Obtenir ou créer l'utilisateur
    const user = await getOrCreateUser(message.from, message.name)

    if (!user) {
      console.error('Impossible de créer/récupérer l\'utilisateur')
      return { success: false, error: 'User creation failed' }
    }

    // 2. Obtenir ou créer la conversation
    const conversation = await getOrCreateConversation(user.id)

    if (!conversation) {
      console.error('Impossible de créer/récupérer la conversation')
      return { success: false, error: 'Conversation creation failed' }
    }

    // 3. Sauvegarder le message utilisateur
    await saveMessage(conversation.id, 'user', message.body)

    // 4. Analyser l'intention
    const intentResult = await analyzeIntent(message.body)
    const intent = intentResult.intent || 'other'

    console.log('🎯 Intention détectée:', intent)

    // 5. Vérifier si escalade nécessaire
    if (shouldEscalate(message.body, intent)) {
      await escalateToHuman(conversation.id, user.id, message.body)
      return { success: true, escalated: true }
    }

    // 6. Récupérer l'historique de conversation
    const history = await getConversationHistory(conversation.id)

    // 7. Générer la réponse avec OpenAI
    console.log('💡 Génération de réponse IA...')
    const aiResponse = await generateAIResponse(message.body, {
      customerName: user.name || undefined,
      customerPreferences: user.profile_data?.preferences,
      conversationState: conversation.current_state,
      previousMessages: history,
    })

    console.log('🤖 Réponse IA:', { success: aiResponse.success, hasResponse: !!aiResponse.response })

    if (!aiResponse.success || !aiResponse.response) {
      console.error('❌ Erreur génération réponse IA:', aiResponse.error)
      
      // Utiliser une réponse de secours intelligente basée sur l'intention
      let fallbackMessage = ''
      switch (intent) {
        case 'greeting':
          fallbackMessage = 'Bonjour ! 😊 Je suis Léa, votre assistante virtuelle. Comment puis-je vous aider aujourd\'hui ?'
          break
        case 'product_search':
          fallbackMessage = 'Je serais ravie de vous aider à trouver le produit idéal ! Pouvez-vous me donner plus de détails sur ce que vous recherchez ? 💚'
          break
        case 'question':
          fallbackMessage = 'C\'est une excellente question ! Je vais vérifier les informations pour vous. Un instant s\'il vous plaît... ✨'
          break
        case 'order':
          fallbackMessage = 'Parfait ! Je vais vous aider avec votre commande. Pouvez-vous me préciser les produits qui vous intéressent ? 🛍️'
          break
        default:
          fallbackMessage = 'Merci pour votre message ! Je suis là pour vous aider. Que puis-je faire pour vous ? 😊'
      }
      
      // Sauvegarder et envoyer la réponse de secours
      await saveMessage(conversation.id, 'assistant', fallbackMessage)
      const phoneNumber = message.from.replace('@s.whatsapp.net', '')
      await sendTypingMessage(phoneNumber, fallbackMessage)
      
      console.log('⚠️ Réponse de secours envoyée')
      return { 
        success: true, 
        response: fallbackMessage,
        intent,
        fallback: true,
        error: aiResponse.error 
      }
    }

    // 8. Sauvegarder la réponse de l'assistant
    await saveMessage(conversation.id, 'assistant', aiResponse.response)

    // 9. Envoyer la réponse via WhatsApp
    // Extraire le numéro (enlever @s.whatsapp.net si présent)
    const phoneNumber = message.from.replace('@s.whatsapp.net', '')
    const sendResult = await sendTypingMessage(phoneNumber, aiResponse.response)

    if (!sendResult.success) {
      console.error('❌ Erreur envoi message WhatsApp:', sendResult.error)
      return { success: false, error: 'WhatsApp send failed', details: sendResult.error }
    }

    // 10. Mettre à jour l'état de la conversation
    await updateConversationState(conversation.id, intent)

    console.log('✅ Message traité avec succès')
    return {
      success: true,
      response: aiResponse.response,
      intent,
    }
  } catch (error) {
    console.error('❌ Erreur traitement message:', error)
    return { success: false, error }
  }
}

/**
 * Obtenir ou créer un utilisateur
 */
async function getOrCreateUser(phoneNumber: string, name?: string): Promise<any> {
  const supabase = createServerClient()

  // Chercher l'utilisateur existant
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('phone_number', phoneNumber)
    .maybeSingle()

  if (existingUser) {
    // Mettre à jour le nom si fourni et différent
    if (name && name !== existingUser.name) {
      await supabase
        .from('users')
        .update({ name })
        .eq('id', existingUser.id)
      
      return { ...existingUser, name }
    }
    return existingUser
  }

  // Créer un nouvel utilisateur
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      phone_number: phoneNumber,
      name: name || null,
      role: 'customer',
      profile_data: {},
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Erreur création utilisateur:', error)
    console.error('Details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    return null
  }

  console.log('👤 Nouvel utilisateur créé:', phoneNumber)
  return newUser
}

/**
 * Obtenir ou créer une conversation
 */
async function getOrCreateConversation(userId: string): Promise<any> {
  const supabase = createServerClient()

  // Chercher une conversation ouverte
  const { data: openConversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'open')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (openConversation) {
    return openConversation
  }

  // Créer une nouvelle conversation
  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      status: 'open',
      current_state: 'greeting',
      conversation_data: {},
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur création conversation:', error)
    return null
  }

  console.log('💬 Nouvelle conversation créée')
  return newConversation
}

/**
 * Sauvegarder un message
 */
async function saveMessage(
  conversationId: string,
  sender: 'user' | 'assistant' | 'human',
  content: string
) {
  const supabase = createServerClient()

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender,
    content,
    metadata: {},
  })

  if (error) {
    console.error('Erreur sauvegarde message:', error)
  }
}

/**
 * Récupérer l'historique de conversation
 */
async function getConversationHistory(conversationId: string) {
  const supabase = createServerClient()

  const { data: messages } = await supabase
    .from('messages')
    .select('sender, content')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true })
    .limit(10) // Derniers 10 messages

  if (!messages) return []

  return messages.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.content,
  })) as any
}

/**
 * Vérifier si escalade nécessaire
 */
function shouldEscalate(message: string, intent: string): boolean {
  const escalationKeywords = [
    'conseiller',
    'humain',
    'personne',
    'parler à quelqu\'un',
    'agent',
    'problème',
    'plainte',
    'réclamation',
  ]

  const lowerMessage = message.toLowerCase()
  return escalationKeywords.some((keyword) => lowerMessage.includes(keyword))
}

/**
 * Escalader vers un conseiller humain
 */
async function escalateToHuman(
  conversationId: string,
  userId: string,
  reason: string
) {
  const supabase = createServerClient()

  // Mettre à jour le statut de la conversation
  await supabase
    .from('conversations')
    .update({
      status: 'escalated',
      current_state: 'human_handoff',
    })
    .eq('id', conversationId)

  // Créer une alerte pour les conseillers
  await supabase.from('advisor_alerts').insert({
    conversation_id: conversationId,
    reason: `Demande client: ${reason.substring(0, 100)}`,
    status: 'pending',
  })

  // Envoyer un message au client
  const { data: user } = await supabase
    .from('users')
    .select('phone_number')
    .eq('id', userId)
    .single()

  if (user) {
    await sendTypingMessage(
      user.phone_number,
      'Je comprends. Je vais vous mettre en relation avec un de nos conseillers. Un instant s\'il vous plaît. 😊'
    )
  }

  console.log('🚨 Conversation escaladée vers conseiller humain')
}

/**
 * Envoyer une réponse de secours
 */
async function sendFallbackResponse(phoneNumber: string) {
  await sendTypingMessage(
    phoneNumber,
    'Je suis désolée, je rencontre un petit problème technique. Un conseiller va vous contacter rapidement. Merci de votre patience ! 🙏'
  )
}

/**
 * Mettre à jour l'état de la conversation
 */
async function updateConversationState(conversationId: string, intent: string) {
  const supabase = createServerClient()

  const stateMap: Record<string, string> = {
    greeting: 'greeting',
    product_search: 'product_search',
    question: 'product_inquiry',
    order: 'order_creation',
    complaint: 'issue_resolution',
    other: 'general_chat',
  }

  const newState = stateMap[intent] || 'general_chat'

  await supabase
    .from('conversations')
    .update({ current_state: newState })
    .eq('id', conversationId)
}
