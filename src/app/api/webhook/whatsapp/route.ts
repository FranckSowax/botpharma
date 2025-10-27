import { NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/lib/whatsapp/conversation-handler.js'

/**
 * Webhook pour recevoir les messages WhatsApp de Whapi
 * 
 * Configuration Whapi:
 * 1. Aller sur https://whapi.cloud/
 * 2. Configurer le webhook URL: https://your-domain.com/api/webhook/whatsapp
 * 3. Activer les événements: messages.upsert
 */

export async function POST(request: Request) {
  try {
    console.log('📥 Webhook appelé')
    
    const body = await request.json()
    console.log('📦 Body reçu:', JSON.stringify(body, null, 2))

    // Vérifier le type d'événement
    const event = body.event || body.type

    // Ignorer les messages sortants (envoyés par nous)
    if (body.messages?.[0]?.from_me || body.message?.from_me) {
      console.log('⏭️  Message sortant ignoré')
      return NextResponse.json({ success: true, message: 'Outgoing message ignored' })
    }

    // Traiter les messages entrants
    // Accepter: event explicite OU présence d'un tableau messages OU objet message
    if (event === 'messages.upsert' || event === 'message' || body.messages || body.message) {
      const message = body.messages?.[0] || body.message

      if (!message) {
        console.log('⚠️  Pas de message dans le payload')
        return NextResponse.json({ success: false, error: 'No message in payload' })
      }

      // Extraire les informations du message
      const incomingMessage = {
        from: message.from || message.chat_id,
        body: message.text?.body || message.body || '',
        name: message.notify_name || message.name,
        timestamp: message.timestamp || Date.now(),
      }

      // Ignorer les messages vides
      if (!incomingMessage.body) {
        console.log('⏭️  Message vide ignoré')
        return NextResponse.json({ success: true, message: 'Empty message ignored' })
      }

      // Traiter le message
      console.log('🔄 Traitement du message...')
      const result = await handleIncomingMessage(incomingMessage)
      console.log('📊 Résultat traitement:', { success: result.success, hasResponse: !!(result as any).response })

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Message processed successfully',
          response: (result as any).response,
          intent: (result as any).intent,
          fallback: (result as any).fallback,
        })
      } else {
        console.error('❌ Échec traitement:', result.error)
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            details: (result as any).details,
          },
          { status: 500 }
        )
      }
    }

    // Autres types d'événements (statuts, etc.)
    console.log('ℹ️  Événement non traité:', event)
    return NextResponse.json({ success: true, message: 'Event received but not processed' })
  } catch (error: any) {
    console.error('❌ Erreur webhook:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      {
        success: false,
        error: error.message || String(error),
        type: error.name,
      },
      { status: 500 }
    )
  }
}

/**
 * Endpoint GET pour vérifier que le webhook est actif
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'WhatsApp Webhook',
    timestamp: new Date().toISOString(),
  })
}
