/**
 * Client Whapi pour envoyer et recevoir des messages WhatsApp
 * Documentation: https://whapi.cloud/
 */

const WHAPI_API_URL = process.env.WHAPI_API_URL || process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud'
// Support both WHAPI_TOKEN and WHAPI_API_KEY for backward compatibility
const WHAPI_TOKEN = process.env.WHAPI_TOKEN || process.env.WHAPI_API_KEY

export interface WhapiMessage {
  from: string // Numéro du client
  body: string // Contenu du message
  timestamp: number
  type: 'text' | 'image' | 'document' | 'audio' | 'video'
  name?: string // Nom du contact
}

export interface WhapiSendMessageParams {
  to: string // Numéro du destinataire
  body: string // Contenu du message
  typing_time?: number // Temps de simulation de frappe (ms)
}

/**
 * Envoyer un message texte via Whapi
 */
export async function sendWhatsAppMessage(params: WhapiSendMessageParams) {
  if (!WHAPI_TOKEN) {
    console.error('❌ WHAPI_TOKEN non configuré')
    return { success: false, error: 'WHAPI_TOKEN not configured' }
  }

  try {
    console.log('📤 Envoi message Whapi:', {
      to: params.to,
      bodyLength: params.body.length,
      url: `${WHAPI_API_URL}/messages/text`,
      hasToken: !!WHAPI_TOKEN,
    })

    const response = await fetch(`${WHAPI_API_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.to,
        body: params.body,
        typing_time: params.typing_time || 0,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Erreur Whapi:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
      })
      return { success: false, error: data }
    }

    console.log('✅ Message envoyé via Whapi:', params.to)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Exception envoi Whapi:', error)
    return { success: false, error }
  }
}

/**
 * Envoyer un message avec simulation de frappe réaliste
 */
export async function sendTypingMessage(to: string, body: string) {
  // Calculer le temps de frappe basé sur la longueur du message
  // ~50 caractères par seconde de frappe
  const typingTime = Math.min((body.length / 50) * 1000, 5000) // Max 5 secondes

  return sendWhatsAppMessage({
    to,
    body,
    typing_time: typingTime,
  })
}

/**
 * Marquer un message comme lu
 */
export async function markMessageAsRead(messageId: string) {
  if (!WHAPI_TOKEN) {
    return { success: false, error: 'WHAPI_TOKEN not configured' }
  }

  try {
    const response = await fetch(`${WHAPI_API_URL}/messages/${messageId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
      },
    })

    const data = await response.json()
    return { success: response.ok, data }
  } catch (error) {
    console.error('Erreur mark as read:', error)
    return { success: false, error }
  }
}

/**
 * Obtenir les informations d'un contact
 */
export async function getContactInfo(phoneNumber: string) {
  if (!WHAPI_TOKEN) {
    return { success: false, error: 'WHAPI_TOKEN not configured' }
  }

  try {
    const response = await fetch(`${WHAPI_API_URL}/contacts/${phoneNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
      },
    })

    const data = await response.json()
    return { success: response.ok, data }
  } catch (error) {
    console.error('Erreur get contact:', error)
    return { success: false, error }
  }
}

/**
 * Vérifier le statut de la connexion Whapi
 */
export async function checkWhapiStatus() {
  if (!WHAPI_TOKEN) {
    return { success: false, error: 'WHAPI_TOKEN not configured' }
  }

  try {
    const response = await fetch(`${WHAPI_API_URL}/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
      },
    })

    const data = await response.json()
    return { success: response.ok, data }
  } catch (error) {
    console.error('Erreur check status:', error)
    return { success: false, error }
  }
}
