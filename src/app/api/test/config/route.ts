import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Vérifier toutes les variables d'environnement nécessaires
    const config = {
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
          process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'Non configuré',
      },
      openai: {
        apiKey: !!process.env.OPENAI_API_KEY,
        keyPreview: process.env.OPENAI_API_KEY ? 
          process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'Non configuré',
      },
      whapi: {
        token: !!process.env.WHAPI_TOKEN,
        apiUrl: process.env.WHAPI_API_URL || 'https://gate.whapi.cloud',
        tokenPreview: process.env.WHAPI_TOKEN ? 
          process.env.WHAPI_TOKEN.substring(0, 10) + '...' : 'Non configuré',
      },
      environment: process.env.NODE_ENV || 'development',
    }

    // Vérifier si toutes les configurations essentielles sont présentes
    const allConfigured = 
      config.supabase.url &&
      config.supabase.anonKey &&
      config.openai.apiKey &&
      config.whapi.token

    return NextResponse.json({
      success: true,
      allConfigured,
      config,
      message: allConfigured 
        ? '✅ Toutes les variables d\'environnement sont configurées' 
        : '⚠️ Certaines variables d\'environnement manquent',
      missing: {
        supabaseUrl: !config.supabase.url,
        supabaseAnonKey: !config.supabase.anonKey,
        supabaseServiceRoleKey: !config.supabase.serviceRoleKey,
        openaiApiKey: !config.openai.apiKey,
        whapiToken: !config.whapi.token,
      },
    })
  } catch (error: any) {
    console.error('Erreur test config:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la vérification de la configuration',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
