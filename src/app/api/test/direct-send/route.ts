import { NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/whapi-client'

export async function POST(request: Request) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'phoneNumber et message requis' },
        { status: 400 }
      )
    }

    console.log('🧪 Test envoi direct:', { phoneNumber, message })

    // Tester l'envoi direct
    const result = await sendWhatsAppMessage({
      to: phoneNumber,
      body: message,
    })

    console.log('📊 Résultat:', result)

    return NextResponse.json({
      success: result.success,
      result: result,
      phoneNumber: phoneNumber,
      message: message,
    })
  } catch (error: any) {
    console.error('❌ Erreur:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
