import { createClient } from '@/lib/supabase/client'

/**
 * Système d'enquêtes de satisfaction automatiques
 * Envoie des enquêtes après la livraison des commandes
 */

export interface SurveyConfig {
  delayDays: number // Délai en jours après la livraison
  maxRetries: number // Nombre maximum de relances
  retryDelayDays: number // Délai entre les relances
}

const DEFAULT_CONFIG: SurveyConfig = {
  delayDays: 2, // 2 jours après livraison
  maxRetries: 2,
  retryDelayDays: 3,
}

/**
 * Créer une enquête de satisfaction pour une commande
 */
export async function createSatisfactionSurvey(
  orderId: string,
  userId: string,
  config: SurveyConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    // Vérifier si une enquête existe déjà
    const { data: existing } = await supabase
      .from('satisfaction_surveys')
      .select('id')
      .eq('order_id', orderId)
      .single()

    if (existing) {
      console.log(`Enquête déjà existante pour la commande ${orderId}`)
      return { success: false, message: 'Survey already exists' }
    }

    // Créer l'enquête
    const { data: survey, error } = await supabase
      .from('satisfaction_surveys')
      .insert({
        user_id: userId,
        order_id: orderId,
        rating: null,
        feedback: null,
        submitted_at: null,
      })
      .select()
      .single()

    if (error) throw error

    // Programmer l'envoi du message
    await scheduleSurveyMessage(survey.id, userId, config.delayDays)

    return { success: true, survey }
  } catch (error) {
    console.error('Erreur création enquête:', error)
    return { success: false, error }
  }
}

/**
 * Programmer l'envoi d'un message d'enquête
 */
async function scheduleSurveyMessage(
  surveyId: string,
  userId: string,
  delayDays: number
) {
  const supabase = createClient()

  const scheduledFor = new Date()
  scheduledFor.setDate(scheduledFor.getDate() + delayDays)

  const message = `Bonjour ! 😊

Nous espérons que vous êtes satisfait(e) de votre commande.

Pourriez-vous prendre 2 minutes pour nous donner votre avis ? Cela nous aide énormément à améliorer nos services.

Notez votre expérience de 1 à 5 étoiles :
⭐ 1 - Très insatisfait
⭐⭐ 2 - Insatisfait
⭐⭐⭐ 3 - Neutre
⭐⭐⭐⭐ 4 - Satisfait
⭐⭐⭐⭐⭐ 5 - Très satisfait

Répondez simplement avec un chiffre de 1 à 5.

Merci pour votre confiance ! 🙏`

  await supabase.from('campaign_messages').insert({
    user_id: userId,
    type: 'survey',
    content: message,
    status: 'pending',
    scheduled_for: scheduledFor.toISOString(),
    metadata: { survey_id: surveyId },
  })
}

/**
 * Traiter une réponse d'enquête
 */
export async function processSurveyResponse(
  userId: string,
  rating: number,
  feedback?: string
) {
  const supabase = createClient()

  try {
    // Trouver l'enquête en attente
    const { data: survey } = await supabase
      .from('satisfaction_surveys')
      .select('*')
      .eq('user_id', userId)
      .is('submitted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!survey) {
      return { success: false, message: 'No pending survey found' }
    }

    // Mettre à jour l'enquête
    const { error } = await supabase
      .from('satisfaction_surveys')
      .update({
        rating,
        feedback,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', survey.id)

    if (error) throw error

    // Envoyer un message de remerciement
    await sendThankYouMessage(userId, rating)

    return { success: true, survey }
  } catch (error) {
    console.error('Erreur traitement réponse:', error)
    return { success: false, error }
  }
}

/**
 * Envoyer un message de remerciement après l'enquête
 */
async function sendThankYouMessage(userId: string, rating: number) {
  const supabase = createClient()

  let message = ''

  if (rating >= 4) {
    message = `Merci beaucoup pour votre excellent retour ! ⭐⭐⭐⭐⭐

Nous sommes ravis que vous soyez satisfait(e) ! 

En remerciement, voici un code promo de 10% pour votre prochaine commande : MERCI10

À très bientôt ! 😊`
  } else if (rating === 3) {
    message = `Merci pour votre retour ! 

Nous prenons note de vos commentaires pour nous améliorer.

Si vous avez des suggestions, n'hésitez pas à nous en faire part.

À bientôt ! 😊`
  } else {
    message = `Merci pour votre retour.

Nous sommes désolés que votre expérience n'ait pas été à la hauteur de vos attentes.

Un conseiller va vous contacter rapidement pour comprendre ce qui n'a pas fonctionné et trouver une solution.

Merci de votre patience. 🙏`

    // Créer une alerte pour le conseiller
    await supabase.from('advisor_alerts').insert({
      conversation_id: null,
      reason: `Client insatisfait - Note: ${rating}/5`,
      status: 'pending',
    })
  }

  await supabase.from('campaign_messages').insert({
    user_id: userId,
    type: 'survey',
    content: message,
    status: 'pending',
    scheduled_for: new Date().toISOString(),
    metadata: { is_thank_you: true },
  })
}

/**
 * Détecter les commandes livrées et créer les enquêtes
 */
export async function detectDeliveredOrders() {
  const supabase = createClient()

  try {
    // Récupérer les commandes complétées des 7 derniers jours
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: orders } = await supabase
      .from('orders')
      .select('id, user_id, updated_at')
      .eq('status', 'completed')
      .gte('updated_at', sevenDaysAgo.toISOString())

    if (!orders || orders.length === 0) {
      return { success: true, count: 0 }
    }

    let created = 0

    for (const order of orders) {
      const result = await createSatisfactionSurvey(order.id, order.user_id)
      if (result.success) created++
    }

    return { success: true, count: created }
  } catch (error) {
    console.error('Erreur détection commandes:', error)
    return { success: false, error }
  }
}

/**
 * Envoyer les messages programmés
 */
export async function sendScheduledSurveys() {
  const supabase = createClient()

  try {
    const now = new Date().toISOString()

    // Récupérer les messages à envoyer
    const { data: messages } = await supabase
      .from('campaign_messages')
      .select('*')
      .eq('type', 'survey')
      .eq('status', 'pending')
      .lte('scheduled_for', now)

    if (!messages || messages.length === 0) {
      return { success: true, count: 0 }
    }

    let sent = 0

    for (const message of messages) {
      // Ici, vous intégreriez l'envoi WhatsApp réel
      // Pour l'instant, on marque juste comme envoyé
      
      const { error } = await supabase
        .from('campaign_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', message.id)

      if (!error) sent++
    }

    return { success: true, count: sent }
  } catch (error) {
    console.error('Erreur envoi enquêtes:', error)
    return { success: false, error }
  }
}
