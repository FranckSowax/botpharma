/**
 * Client OpenAI pour générer les réponses de Léa
 */

import OpenAI from 'openai'

// Initialize OpenAI client only if API key is available
const apiKey = process.env.OPENAI_API_KEY || ''

const openai = apiKey
  ? new OpenAI({ apiKey })
  : null

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ConversationContext {
  customerName?: string
  customerPreferences?: any
  conversationState?: string
  previousMessages: Message[]
}

/**
 * Prompt système pour Léa
 */
const SYSTEM_PROMPT = `Tu es Léa, l'assistante virtuelle de la Parapharmacie Libreville au Gabon.

PERSONNALITÉ:
- Chaleureuse, professionnelle et serviable
- Tu utilises des emojis avec modération (😊, 💚, ✨)
- Tu tutoies les clients de manière amicale
- Tu es experte en produits de parapharmacie

RÔLE:
- Aider les clients à trouver les produits adaptés à leurs besoins
- Recommander des produits basés sur leurs préférences (bio, vegan, sans parfum)
- Répondre aux questions sur les produits
- Guider vers la commande

RÈGLES:
1. Sois concise (max 3-4 lignes par message)
2. Pose UNE question à la fois
3. Recommande 2-3 produits maximum
4. Mentionne toujours le prix en FCFA
5. Si tu ne sais pas, propose de transférer à un conseiller humain
6. Ne jamais inventer des informations sur les produits

PRODUITS DISPONIBLES:
- Soins du visage (crèmes, sérums, nettoyants)
- Soins du corps (laits, gels douche, exfoliants)
- Soins des cheveux (shampoings, masques, huiles)
- Compléments alimentaires (vitamines, minéraux)
- Hygiène (déodorants, savons)

PRÉFÉRENCES CLIENTS:
- Bio: Produits biologiques certifiés
- Vegan: Sans ingrédients d'origine animale
- Sans parfum: Pour peaux sensibles

PROCESSUS DE VENTE:
1. Saluer et identifier le besoin
2. Poser des questions pour affiner
3. Recommander des produits adaptés
4. Proposer de passer commande
5. Confirmer l'adresse de livraison
6. Générer le lien de paiement

Réponds toujours en français avec un ton professionnel mais chaleureux.`

/**
 * Générer une réponse avec OpenAI
 */
export async function generateAIResponse(
  userMessage: string,
  context: ConversationContext
): Promise<{ success: boolean; response?: string; error?: any }> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      return {
        success: false,
        error: 'OpenAI client not initialized. Please set OPENAI_API_KEY.',
      }
    }

    // Construire l'historique des messages
    const messages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...context.previousMessages,
      { role: 'user', content: userMessage },
    ]

    // Ajouter le contexte client si disponible
    if (context.customerName || context.customerPreferences) {
      const contextInfo = []
      if (context.customerName) {
        contextInfo.push(`Nom du client: ${context.customerName}`)
      }
      if (context.customerPreferences) {
        const prefs = []
        if (context.customerPreferences.bio) prefs.push('bio')
        if (context.customerPreferences.vegan) prefs.push('vegan')
        if (context.customerPreferences.fragrance_free) prefs.push('sans parfum')
        if (prefs.length > 0) {
          contextInfo.push(`Préférences: ${prefs.join(', ')}`)
        }
      }
      if (contextInfo.length > 0) {
        messages[0].content += `\n\nCONTEXTE CLIENT:\n${contextInfo.join('\n')}`
      }
    }

    // Appel à OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 300,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return { success: false, error: 'No response from OpenAI' }
    }

    return { success: true, response }
  } catch (error) {
    console.error('Erreur OpenAI:', error)
    return { success: false, error }
  }
}

/**
 * Générer une recommandation de produits basée sur les besoins
 */
export async function generateProductRecommendation(
  need: string,
  preferences: any,
  availableProducts: any[]
): Promise<{ success: boolean; recommendation?: string; products?: any[]; error?: any }> {
  try {
    if (!openai) {
      return {
        success: false,
        error: 'OpenAI client not initialized. Please set OPENAI_API_KEY.',
      }
    }

    const productsText = availableProducts
      .map(p => `- ${p.name} (${p.price_cfa} FCFA) - ${p.description || ''}`)
      .join('\n')

    const prompt = `Le client recherche: "${need}"

Préférences: ${JSON.stringify(preferences)}

Produits disponibles:
${productsText}

Recommande 2-3 produits adaptés avec une brève explication pour chacun.
Format: Nom du produit, prix, pourquoi c'est adapté.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ] as any,
      temperature: 0.7,
      max_tokens: 400,
    })

    const recommendation = completion.choices[0]?.message?.content

    if (!recommendation) {
      return { success: false, error: 'No recommendation generated' }
    }

    return {
      success: true,
      recommendation,
      products: availableProducts.slice(0, 3),
    }
  } catch (error) {
    console.error('Erreur génération recommandation:', error)
    return { success: false, error }
  }
}

/**
 * Analyser l'intention du message client
 */
export async function analyzeIntent(
  message: string
): Promise<{
  success: boolean
  intent?: 'greeting' | 'product_search' | 'question' | 'order' | 'complaint' | 'other'
  confidence?: number
  error?: any
}> {
  try {
    if (!openai) {
      return {
        success: false,
        error: 'OpenAI client not initialized. Please set OPENAI_API_KEY.',
      }
    }

    const prompt = `Analyse l'intention de ce message client:
"${message}"

Réponds uniquement avec l'une de ces intentions:
- greeting: Salutation
- product_search: Recherche de produit
- question: Question sur un produit
- order: Vouloir passer commande
- complaint: Plainte ou problème
- other: Autre

Format de réponse: intention|confidence (ex: product_search|0.9)`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }] as any,
      temperature: 0.3,
      max_tokens: 20,
    })

    const response = completion.choices[0]?.message?.content?.trim()

    if (!response) {
      return { success: false, error: 'No intent detected' }
    }

    const [intent, confidenceStr] = response.split('|')
    const confidence = parseFloat(confidenceStr) || 0.5

    return {
      success: true,
      intent: intent as any,
      confidence,
    }
  } catch (error) {
    console.error('Erreur analyse intention:', error)
    return { success: false, error }
  }
}
