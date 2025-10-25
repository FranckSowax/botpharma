import { NextResponse } from 'next/server'
import { runAllAutomations } from '@/lib/automation'

/**
 * API Route pour exécuter les automations
 * À appeler via un cron job (ex: Vercel Cron, GitHub Actions, etc.)
 * 
 * Exemple d'utilisation avec Vercel Cron:
 * vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/automation/run",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification (optionnel mais recommandé)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🤖 Exécution des automations via API...')

    // Exécuter toutes les automations
    const result = await runAllAutomations()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Automations executed successfully',
        results: result.results,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Automation execution failed',
          error: result.error,
          results: result.results,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Erreur API automation:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: String(error),
      },
      { status: 500 }
    )
  }
}

// Permettre aussi les requêtes POST
export async function POST(request: Request) {
  return GET(request)
}
