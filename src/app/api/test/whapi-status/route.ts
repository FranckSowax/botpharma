import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const WHAPI_TOKEN = process.env.WHAPI_TOKEN || process.env.WHAPI_API_KEY
    const WHAPI_API_URL = process.env.WHAPI_API_URL || process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud'

    if (!WHAPI_TOKEN) {
      return NextResponse.json(
        { error: 'WHAPI_TOKEN non configuré' },
        { status: 500 }
      )
    }

    // Tester la connexion Whapi en récupérant les infos du compte
    const settingsResponse = await fetch(`${WHAPI_API_URL}/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    const settingsData = await settingsResponse.json()

    // Récupérer aussi les infos du canal
    const channelResponse = await fetch(`${WHAPI_API_URL}/channels`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    const channelData = await channelResponse.json()

    const response = settingsResponse
    const data = {
      settings: settingsData,
      channels: channelData,
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de connexion Whapi',
          details: data,
          statusCode: response.status,
          tokenPreview: WHAPI_TOKEN.substring(0, 10) + '...',
          apiUrl: WHAPI_API_URL,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion Whapi réussie',
      data: data,
      tokenPreview: WHAPI_TOKEN.substring(0, 10) + '...',
      apiUrl: WHAPI_API_URL,
    })
  } catch (error: any) {
    console.error('Erreur test whapi-status:', error)
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
