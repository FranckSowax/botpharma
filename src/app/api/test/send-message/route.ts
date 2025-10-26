import { NextResponse } from 'next/server'
import { normalizeGabonPhoneNumber, toWhatsAppChatId, isValidGabonPhoneNumber } from '@/lib/utils/phone-formatter'

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et message requis' },
        { status: 400 }
      )
    }

    // Vérifier la configuration Whapi (support both WHAPI_TOKEN and WHAPI_API_KEY)
    const WHAPI_TOKEN = process.env.WHAPI_TOKEN || process.env.WHAPI_API_KEY
    const WHAPI_API_URL = process.env.WHAPI_API_URL || process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud'

    if (!WHAPI_TOKEN) {
      return NextResponse.json(
        { error: 'WHAPI_TOKEN ou WHAPI_API_KEY non configuré' },
        { status: 500 }
      )
    }

    // Normaliser le numéro (gère l'ancien et le nouveau format gabonais)
    const normalizedPhone = normalizeGabonPhoneNumber(phoneNumber)
    
    // Vérifier si c'est un numéro gabonais valide
    if (!isValidGabonPhoneNumber(phoneNumber)) {
      console.warn(`Numéro potentiellement invalide: ${phoneNumber} → ${normalizedPhone}`)
    }
    
    // Construire l'ID WhatsApp (format: numéro@s.whatsapp.net)
    const chatId = toWhatsAppChatId(phoneNumber)

    // Envoyer le message via Whapi
    const response = await fetch(`${WHAPI_API_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: chatId,
        body: message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de l\'envoi du message',
          details: data,
          statusCode: response.status,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      data: data,
      phoneNumber: normalizedPhone,
      originalPhoneNumber: phoneNumber,
      chatId: chatId,
    })
  } catch (error: any) {
    console.error('Erreur test send-message:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
