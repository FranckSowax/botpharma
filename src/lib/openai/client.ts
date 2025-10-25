import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ProductRecommendationRequest {
  userMessage: string
  userProfile?: {
    previousPurchases?: string[]
    preferences?: {
      bio?: boolean
      vegan?: boolean
      fragranceFree?: boolean
      brands?: string[]
    }
  }
  availableProducts: Array<{
    id: string
    name: string
    description: string
    category: string
    brand: string
    price: number
    bio: boolean
    vegan: boolean
    fragrance_free: boolean
  }>
}

export interface ProductRecommendationResponse {
  recommendations: Array<{
    productId: string
    score: number
    reasoning: string
  }>
  conversationResponse: string
}

export async function getProductRecommendations(
  request: ProductRecommendationRequest
): Promise<ProductRecommendationResponse> {
  const systemPrompt = `Tu es Léa, une assistante virtuelle pour une parapharmacie à Libreville, Gabon. 
Tu es chaleureuse, professionnelle et tu parles français. 
Ton rôle est d'aider les clients à trouver les produits qui correspondent à leurs besoins.

Analyse le message du client et recommande les produits les plus appropriés parmi ceux disponibles.
Prends en compte les préférences du client (bio, vegan, sans parfum) et son historique d'achats si disponible.

Réponds au format JSON avec:
{
  "recommendations": [
    {
      "productId": "id-du-produit",
      "score": 0.95,
      "reasoning": "Pourquoi ce produit convient"
    }
  ],
  "conversationResponse": "Ta réponse naturelle au client en français"
}`

  const userPrompt = `Message du client: "${request.userMessage}"

${request.userProfile ? `Profil du client:
- Achats précédents: ${request.userProfile.previousPurchases?.join(', ') || 'Aucun'}
- Préférences: ${JSON.stringify(request.userProfile.preferences || {})}
` : ''}

Produits disponibles:
${request.availableProducts.map((p) => `- ${p.name} (${p.category}, ${p.brand}, ${p.price} FCFA)${p.bio ? ' [BIO]' : ''}${p.vegan ? ' [VEGAN]' : ''}${p.fragrance_free ? ' [SANS PARFUM]' : ''}`).join('\n')}

Recommande les 3 meilleurs produits et réponds au client.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = JSON.parse(
      completion.choices[0].message.content || '{}'
    )
    return response as ProductRecommendationResponse
  } catch (error) {
    console.error('Error getting product recommendations:', error)
    throw new Error('Failed to get product recommendations')
  }
}

export async function analyzeCustomerIntent(
  message: string
): Promise<{
  intent: 'product_search' | 'health_advice' | 'promotions' | 'other'
  entities: {
    category?: string
    brand?: string
    preferences?: string[]
  }
}> {
  const systemPrompt = `Analyse le message d'un client de parapharmacie et identifie son intention.
Réponds au format JSON avec:
{
  "intent": "product_search" | "health_advice" | "promotions" | "other",
  "entities": {
    "category": "catégorie de produit si mentionnée",
    "brand": "marque si mentionnée",
    "preferences": ["bio", "vegan", "sans parfum"] si mentionnées
  }
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 200,
    })

    return JSON.parse(completion.choices[0].message.content || '{}')
  } catch (error) {
    console.error('Error analyzing customer intent:', error)
    return {
      intent: 'other',
      entities: {},
    }
  }
}

export async function generateConversationResponse(
  context: {
    currentState: string
    userMessage: string
    conversationHistory?: Array<{ role: string; content: string }>
  }
): Promise<string> {
  const systemPrompt = `Tu es Léa, une assistante virtuelle chaleureuse pour une parapharmacie à Libreville.
Tu parles français et tu aides les clients avec professionnalisme et empathie.`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(context.conversationHistory || []),
    { role: 'user', content: context.userMessage },
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as any,
      temperature: 0.8,
      max_tokens: 300,
    })

    return completion.choices[0].message.content || ''
  } catch (error) {
    console.error('Error generating conversation response:', error)
    return 'Désolée, je rencontre un problème technique. Un conseiller va vous aider.'
  }
}
