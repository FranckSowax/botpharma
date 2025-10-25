import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID requis' },
        { status: 400 }
      )
    }

    const WHAPI_TOKEN = process.env.WHAPI_TOKEN || process.env.WHAPI_API_KEY
    const WHAPI_API_URL = process.env.WHAPI_API_URL || process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud'

    if (!WHAPI_TOKEN) {
      return NextResponse.json(
        { error: 'WHAPI_TOKEN non configuré' },
        { status: 500 }
      )
    }

    // Récupérer le statut du message via Whapi
    const response = await fetch(`${WHAPI_API_URL}/messages/${messageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la récupération du statut',
          details: data,
          statusCode: response.status,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Statut récupéré avec succès',
      data: data,
      messageId: messageId,
    })
  } catch (error: any) {
    console.error('Erreur test message-status:', error)
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
