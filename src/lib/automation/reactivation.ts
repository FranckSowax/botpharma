import { createClient } from '@/lib/supabase/client'

/**
 * Système de réactivation des clients inactifs
 * Détecte et relance automatiquement les clients qui n'ont pas commandé depuis longtemps
 */

export interface ReactivationConfig {
  inactiveDays: number // Nombre de jours d'inactivité
  offerDiscount: number // Pourcentage de réduction offert
  maxCampaigns: number // Nombre max de campagnes par client
}

const DEFAULT_CONFIG: ReactivationConfig = {
  inactiveDays: 30, // 30 jours sans commande
  offerDiscount: 15, // 15% de réduction
  maxCampaigns: 3, // Max 3 relances
}

/**
 * Détecter les clients inactifs
 */
export async function detectInactiveCustomers(
  config: ReactivationConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    const inactiveDate = new Date()
    inactiveDate.setDate(inactiveDate.getDate() - config.inactiveDays)

    // Récupérer tous les clients
    const { data: customers } = await supabase
      .from('users')
      .select('id, name, phone_number')
      .eq('role', 'customer')

    if (!customers) return { success: true, inactive: [] }

    const inactiveCustomers = []

    for (const customer of customers) {
      // Vérifier la dernière commande
      const { data: lastOrder } = await supabase
        .from('orders')
        .select('created_at')
        .eq('user_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Si pas de commande ou commande trop ancienne
      if (!lastOrder || new Date(lastOrder.created_at) < inactiveDate) {
        // Vérifier le nombre de campagnes déjà envoyées
        const { count } = await supabase
          .from('campaign_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', customer.id)
          .eq('type', 'reactivation')

        if ((count || 0) < config.maxCampaigns) {
          inactiveCustomers.push({
            ...customer,
            lastOrderDate: lastOrder?.created_at || null,
            campaignsSent: count || 0,
          })
        }
      }
    }

    return { success: true, inactive: inactiveCustomers }
  } catch (error) {
    console.error('Erreur détection clients inactifs:', error)
    return { success: false, error, inactive: [] }
  }
}

/**
 * Créer une campagne de réactivation
 */
export async function createReactivationCampaign(
  userId: string,
  config: ReactivationConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    // Récupérer les infos du client
    const { data: user } = await supabase
      .from('users')
      .select('name, profile_data')
      .eq('id', userId)
      .single()

    const customerName = user?.name || 'Cher client'
    const preferences = user?.profile_data?.preferences || {}

    // Générer un code promo unique
    const promoCode = `RETOUR${config.offerDiscount}`

    // Créer le coupon
    const validFrom = new Date()
    const validTo = new Date()
    validTo.setDate(validTo.getDate() + 14) // Valide 14 jours

    await supabase.from('loyalty_coupons').insert({
      user_id: userId,
      code: promoCode,
      discount_pct: config.offerDiscount,
      valid_from: validFrom.toISOString().split('T')[0],
      valid_to: validTo.toISOString().split('T')[0],
      used: false,
    })

    // Personnaliser le message selon les préférences
    let productSuggestion = 'nos produits'
    if (preferences.bio) {
      productSuggestion = 'nos produits bio'
    } else if (preferences.vegan) {
      productSuggestion = 'nos produits vegan'
    }

    const message = `Bonjour ${customerName} ! 👋

Ça fait un moment qu'on ne vous a pas vu(e) ! 😊

Nous avons pensé à vous et avons de nouveaux ${productSuggestion} qui pourraient vous intéresser.

🎁 OFFRE SPÉCIALE POUR VOUS :
${config.offerDiscount}% de réduction sur votre prochaine commande !

Code promo : ${promoCode}
Valable jusqu'au ${validTo.toLocaleDateString('fr-FR')}

Que diriez-vous de découvrir nos nouveautés ?

À très bientôt ! 💚`

    // Programmer l'envoi
    const { data: campaign, error } = await supabase
      .from('campaign_messages')
      .insert({
        user_id: userId,
        type: 'reactivation',
        content: message,
        status: 'pending',
        scheduled_for: new Date().toISOString(),
        metadata: {
          promo_code: promoCode,
          discount: config.offerDiscount,
        },
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, campaign, promoCode }
  } catch (error) {
    console.error('Erreur création campagne:', error)
    return { success: false, error }
  }
}

/**
 * Lancer une campagne de réactivation pour tous les clients inactifs
 */
export async function runReactivationCampaign(
  config: ReactivationConfig = DEFAULT_CONFIG
) {
  try {
    // Détecter les clients inactifs
    const { inactive } = await detectInactiveCustomers(config)

    if (inactive.length === 0) {
      return { success: true, count: 0, message: 'No inactive customers found' }
    }

    let created = 0

    for (const customer of inactive) {
      const result = await createReactivationCampaign(customer.id, config)
      if (result.success) created++
    }

    return {
      success: true,
      count: created,
      total: inactive.length,
      message: `${created} campaigns created for ${inactive.length} inactive customers`,
    }
  } catch (error) {
    console.error('Erreur campagne réactivation:', error)
    return { success: false, error }
  }
}

/**
 * Envoyer les messages de réactivation programmés
 */
export async function sendReactivationMessages() {
  const supabase = createClient()

  try {
    const now = new Date().toISOString()

    const { data: messages } = await supabase
      .from('campaign_messages')
      .select('*')
      .eq('type', 'reactivation')
      .eq('status', 'pending')
      .lte('scheduled_for', now)

    if (!messages || messages.length === 0) {
      return { success: true, count: 0 }
    }

    let sent = 0

    for (const message of messages) {
      // Ici, intégration WhatsApp réelle
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
    console.error('Erreur envoi messages:', error)
    return { success: false, error }
  }
}

/**
 * Analyser l'efficacité des campagnes de réactivation
 */
export async function analyzeReactivationEffectiveness() {
  const supabase = createClient()

  try {
    // Récupérer toutes les campagnes envoyées
    const { data: campaigns } = await supabase
      .from('campaign_messages')
      .select('user_id, sent_at, metadata')
      .eq('type', 'reactivation')
      .eq('status', 'sent')

    if (!campaigns || campaigns.length === 0) {
      return { success: true, stats: null }
    }

    let reactivated = 0

    for (const campaign of campaigns) {
      // Vérifier si le client a commandé après la campagne
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', campaign.user_id)
        .gte('created_at', campaign.sent_at)
        .limit(1)

      if (orders && orders.length > 0) {
        reactivated++
      }
    }

    const stats = {
      totalCampaigns: campaigns.length,
      reactivated,
      conversionRate: (reactivated / campaigns.length) * 100,
    }

    return { success: true, stats }
  } catch (error) {
    console.error('Erreur analyse campagnes:', error)
    return { success: false, error }
  }
}
