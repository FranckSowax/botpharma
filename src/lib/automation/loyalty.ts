import { createClient } from '@/lib/supabase/client'

/**
 * Système de fidélité et coupons automatiques
 * Récompense les clients fidèles avec des coupons et offres spéciales
 */

export interface LoyaltyConfig {
  pointsPerFCFA: number // Points gagnés par FCFA dépensé
  pointsForCoupon: number // Points nécessaires pour un coupon
  couponDiscount: number // % de réduction du coupon
  couponValidityDays: number // Durée de validité du coupon
  birthdayDiscount: number // % de réduction anniversaire
  milestoneRewards: MilestoneReward[]
}

export interface MilestoneReward {
  orderCount: number
  discount: number
  message: string
}

const DEFAULT_CONFIG: LoyaltyConfig = {
  pointsPerFCFA: 1, // 1 point par FCFA
  pointsForCoupon: 10000, // 10 000 points = coupon
  couponDiscount: 20, // 20% de réduction
  couponValidityDays: 30,
  birthdayDiscount: 15,
  milestoneRewards: [
    {
      orderCount: 5,
      discount: 10,
      message: '🎉 Félicitations ! Vous avez atteint 5 commandes !',
    },
    {
      orderCount: 10,
      discount: 15,
      message: '🌟 Incroyable ! 10 commandes ! Vous êtes un client VIP !',
    },
    {
      orderCount: 20,
      discount: 20,
      message: '👑 WOW ! 20 commandes ! Vous êtes notre champion !',
    },
  ],
}

/**
 * Calculer les points de fidélité d'un client
 */
export async function calculateCustomerPoints(
  userId: string,
  config: LoyaltyConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    // Récupérer toutes les commandes complétées
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (!orders || orders.length === 0) {
      return { success: true, points: 0, orders: 0 }
    }

    const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const points = Math.floor(totalSpent * config.pointsPerFCFA)

    return {
      success: true,
      points,
      orders: orders.length,
      totalSpent,
    }
  } catch (error) {
    console.error('Erreur calcul points:', error)
    return { success: false, error }
  }
}

/**
 * Générer un code promo unique
 */
function generatePromoCode(prefix: string = 'FIDELITE'): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}${random}`
}

/**
 * Créer un coupon de fidélité
 */
export async function createLoyaltyCoupon(
  userId: string,
  discount: number,
  reason: string,
  config: LoyaltyConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    const code = generatePromoCode()
    const validFrom = new Date()
    const validTo = new Date()
    validTo.setDate(validTo.getDate() + config.couponValidityDays)

    const { data: coupon, error } = await supabase
      .from('loyalty_coupons')
      .insert({
        user_id: userId,
        code,
        discount_pct: discount,
        valid_from: validFrom.toISOString().split('T')[0],
        valid_to: validTo.toISOString().split('T')[0],
        used: false,
      })
      .select()
      .single()

    if (error) throw error

    // Envoyer un message de notification
    await notifyCustomerOfCoupon(userId, code, discount, reason, validTo)

    return { success: true, coupon, code }
  } catch (error) {
    console.error('Erreur création coupon:', error)
    return { success: false, error }
  }
}

/**
 * Notifier le client de son nouveau coupon
 */
async function notifyCustomerOfCoupon(
  userId: string,
  code: string,
  discount: number,
  reason: string,
  validUntil: Date
) {
  const supabase = createClient()

  const { data: user } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single()

  const customerName = user?.name || 'Cher client'

  const message = `Bonjour ${customerName} ! 🎁

${reason}

En remerciement de votre fidélité, nous vous offrons un coupon de réduction !

🎉 CODE PROMO : ${code}
💚 RÉDUCTION : ${discount}%
📅 VALABLE JUSQU'AU : ${validUntil.toLocaleDateString('fr-FR')}

Utilisez ce code lors de votre prochaine commande !

Merci de votre confiance ! 😊`

  await supabase.from('campaign_messages').insert({
    user_id: userId,
    type: 'loyalty',
    content: message,
    status: 'pending',
    scheduled_for: new Date().toISOString(),
    metadata: {
      coupon_code: code,
      discount,
      reason,
    },
  })
}

/**
 * Vérifier et récompenser les jalons (milestones)
 */
export async function checkMilestones(
  userId: string,
  config: LoyaltyConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    // Compter les commandes du client
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (!orderCount) {
      return { success: true, milestone: null }
    }

    // Vérifier si un jalon est atteint
    const milestone = config.milestoneRewards.find(
      (m) => m.orderCount === orderCount
    )

    if (!milestone) {
      return { success: true, milestone: null }
    }

    // Vérifier si le coupon a déjà été créé
    const { data: existingCoupon } = await supabase
      .from('loyalty_coupons')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()) // Dernières 24h
      .limit(1)
      .single()

    if (existingCoupon) {
      return { success: true, milestone: null, message: 'Coupon already created' }
    }

    // Créer le coupon de récompense
    const result = await createLoyaltyCoupon(
      userId,
      milestone.discount,
      milestone.message,
      config
    )

    return { success: true, milestone, coupon: result.coupon }
  } catch (error) {
    console.error('Erreur vérification jalons:', error)
    return { success: false, error }
  }
}

/**
 * Vérifier et créer des coupons basés sur les points
 */
export async function checkPointsForCoupon(
  userId: string,
  config: LoyaltyConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    const { points } = await calculateCustomerPoints(userId, config)

    if (!points || points < config.pointsForCoupon) {
      return {
        success: true,
        eligible: false,
        points: points || 0,
        needed: config.pointsForCoupon - (points || 0),
      }
    }

    // Vérifier si un coupon a déjà été créé récemment
    const { data: recentCoupon } = await supabase
      .from('loyalty_coupons')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 2592000000).toISOString()) // 30 jours
      .limit(1)
      .single()

    if (recentCoupon) {
      return {
        success: true,
        eligible: false,
        message: 'Coupon already created this month',
      }
    }

    // Créer le coupon
    const result = await createLoyaltyCoupon(
      userId,
      config.couponDiscount,
      `🎊 Vous avez accumulé ${points} points de fidélité !`,
      config
    )

    return {
      success: true,
      eligible: true,
      coupon: result.coupon,
      points,
    }
  } catch (error) {
    console.error('Erreur vérification points:', error)
    return { success: false, error }
  }
}

/**
 * Vérifier les anniversaires et envoyer des coupons
 */
export async function checkBirthdays(
  config: LoyaltyConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    const today = new Date()
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // Récupérer les clients dont c'est l'anniversaire
    // Note: Nécessite un champ birthday dans profile_data
    const { data: customers } = await supabase
      .from('users')
      .select('id, name, profile_data')
      .eq('role', 'customer')

    if (!customers) {
      return { success: true, count: 0 }
    }

    let sent = 0

    for (const customer of customers) {
      const birthday = customer.profile_data?.birthday
      if (!birthday) continue

      const birthdayStr = birthday.substring(5) // MM-DD

      if (birthdayStr === todayStr) {
        // Vérifier si un coupon d'anniversaire a déjà été envoyé cette année
        const { data: existingCoupon } = await supabase
          .from('loyalty_coupons')
          .select('id')
          .eq('user_id', customer.id)
          .gte('created_at', new Date(today.getFullYear(), 0, 1).toISOString())
          .limit(1)
          .single()

        if (!existingCoupon) {
          await createLoyaltyCoupon(
            customer.id,
            config.birthdayDiscount,
            `🎂 Joyeux anniversaire ${customer.name || ''} ! 🎉`,
            config
          )
          sent++
        }
      }
    }

    return { success: true, count: sent }
  } catch (error) {
    console.error('Erreur vérification anniversaires:', error)
    return { success: false, error }
  }
}

/**
 * Envoyer les messages de fidélité programmés
 */
export async function sendLoyaltyMessages() {
  const supabase = createClient()

  try {
    const now = new Date().toISOString()

    const { data: messages } = await supabase
      .from('campaign_messages')
      .select('*')
      .eq('type', 'loyalty')
      .eq('status', 'pending')
      .lte('scheduled_for', now)

    if (!messages || messages.length === 0) {
      return { success: true, count: 0 }
    }

    let sent = 0

    for (const message of messages) {
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
    console.error('Erreur envoi messages fidélité:', error)
    return { success: false, error }
  }
}

/**
 * Obtenir les statistiques du programme de fidélité
 */
export async function getLoyaltyStats() {
  const supabase = createClient()

  try {
    const { count: totalCoupons } = await supabase
      .from('loyalty_coupons')
      .select('*', { count: 'exact', head: true })

    const { count: usedCoupons } = await supabase
      .from('loyalty_coupons')
      .select('*', { count: 'exact', head: true })
      .eq('used', true)

    const { count: activeCoupons } = await supabase
      .from('loyalty_coupons')
      .select('*', { count: 'exact', head: true })
      .eq('used', false)
      .gte('valid_to', new Date().toISOString().split('T')[0])

    return {
      success: true,
      stats: {
        totalCoupons: totalCoupons || 0,
        usedCoupons: usedCoupons || 0,
        activeCoupons: activeCoupons || 0,
        redemptionRate: totalCoupons ? ((usedCoupons || 0) / totalCoupons) * 100 : 0,
      },
    }
  } catch (error) {
    console.error('Erreur stats fidélité:', error)
    return { success: false, error }
  }
}
