import { createClient } from '@/lib/supabase/client'

/**
 * Système de conseils d'utilisation post-achat
 * Envoie des conseils personnalisés après l'achat de produits
 */

export interface UsageTipsConfig {
  delayDays: number // Délai après l'achat
  maxTipsPerProduct: number // Nombre max de conseils par produit
}

const DEFAULT_CONFIG: UsageTipsConfig = {
  delayDays: 3, // 3 jours après l'achat
  maxTipsPerProduct: 3,
}

// Base de conseils par catégorie de produits
const TIPS_DATABASE: Record<string, string[]> = {
  'Soins du visage': [
    '💡 Conseil : Nettoyez votre visage matin et soir pour une peau éclatante !',
    '💡 Astuce : Appliquez votre crème hydratante sur peau légèrement humide pour une meilleure absorption.',
    '💡 Conseil : N\'oubliez pas la protection solaire, même en hiver ! ☀️',
  ],
  'Soins du corps': [
    '💡 Conseil : Hydratez votre peau juste après la douche pour retenir l\'humidité.',
    '💡 Astuce : Exfoliez votre peau 1-2 fois par semaine pour éliminer les cellules mortes.',
    '💡 Conseil : Buvez beaucoup d\'eau pour une hydratation de l\'intérieur ! 💧',
  ],
  'Soins des cheveux': [
    '💡 Conseil : Massez votre cuir chevelu pour stimuler la circulation sanguine.',
    '💡 Astuce : Utilisez de l\'eau tiède (pas chaude) pour rincer vos cheveux.',
    '💡 Conseil : Laissez vos cheveux sécher naturellement quand c\'est possible.',
  ],
  'Compléments alimentaires': [
    '💡 Conseil : Prenez vos compléments à heure fixe pour ne pas oublier.',
    '💡 Astuce : Certains compléments sont mieux absorbés avec un repas.',
    '💡 Conseil : Soyez régulier(e) pour voir les meilleurs résultats ! 💪',
  ],
  'Hygiène': [
    '💡 Conseil : Conservez vos produits dans un endroit sec et frais.',
    '💡 Astuce : Vérifiez toujours la date de péremption avant utilisation.',
    '💡 Conseil : Fermez bien les contenants pour préserver la qualité.',
  ],
  default: [
    '💡 Conseil : Lisez attentivement la notice d\'utilisation de votre produit.',
    '💡 Astuce : Conservez vos produits à l\'abri de la lumière et de la chaleur.',
    '💡 Conseil : En cas de doute, n\'hésitez pas à nous contacter ! 😊',
  ],
}

/**
 * Obtenir des conseils pour une catégorie de produit
 */
function getTipsForCategory(category: string | null): string[] {
  if (!category) return TIPS_DATABASE.default
  return TIPS_DATABASE[category] || TIPS_DATABASE.default
}

/**
 * Créer un message de conseil personnalisé
 */
function createTipMessage(
  customerName: string | null,
  productName: string,
  category: string | null,
  tipIndex: number
): string {
  const tips = getTipsForCategory(category)
  const tip = tips[tipIndex % tips.length]

  const greeting = customerName ? `Bonjour ${customerName} !` : 'Bonjour !'

  return `${greeting} 👋

Nous espérons que vous appréciez votre ${productName} ! 

${tip}

Vous avez des questions sur l'utilisation de ce produit ? N'hésitez pas à nous écrire !

Bonne journée ! 😊`
}

/**
 * Programmer des conseils d'utilisation pour une commande
 */
export async function scheduleUsageTips(
  orderId: string,
  userId: string,
  config: UsageTipsConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    // Récupérer les infos de la commande et du client
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (!order) {
      return { success: false, message: 'Order not found' }
    }

    const { data: user } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single()

    // Note: Dans une vraie implémentation, vous auriez une table order_items
    // Pour l'instant, on simule avec des conseils génériques
    
    const scheduledFor = new Date()
    scheduledFor.setDate(scheduledFor.getDate() + config.delayDays)

    // Créer un conseil générique
    const message = createTipMessage(
      user?.name || null,
      'produit',
      null,
      0
    )

    const { data: campaign, error } = await supabase
      .from('campaign_messages')
      .insert({
        user_id: userId,
        type: 'usage_tips',
        content: message,
        status: 'pending',
        scheduled_for: scheduledFor.toISOString(),
        metadata: {
          order_id: orderId,
          tip_index: 0,
        },
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, campaign }
  } catch (error) {
    console.error('Erreur programmation conseils:', error)
    return { success: false, error }
  }
}

/**
 * Détecter les commandes récentes et programmer les conseils
 */
export async function detectRecentOrders(
  config: UsageTipsConfig = DEFAULT_CONFIG
) {
  const supabase = createClient()

  try {
    // Récupérer les commandes complétées des derniers jours
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (config.delayDays + 1))

    const endDate = new Date()
    endDate.setDate(endDate.getDate() - config.delayDays)

    const { data: orders } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('status', 'completed')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString())

    if (!orders || orders.length === 0) {
      return { success: true, count: 0 }
    }

    let scheduled = 0

    for (const order of orders) {
      // Vérifier si des conseils ont déjà été programmés
      const { data: existing } = await supabase
        .from('campaign_messages')
        .select('id')
        .eq('type', 'usage_tips')
        .eq('metadata->>order_id', order.id)
        .single()

      if (!existing) {
        const result = await scheduleUsageTips(order.id, order.user_id, config)
        if (result.success) scheduled++
      }
    }

    return { success: true, count: scheduled }
  } catch (error) {
    console.error('Erreur détection commandes:', error)
    return { success: false, error }
  }
}

/**
 * Envoyer les conseils programmés
 */
export async function sendUsageTips() {
  const supabase = createClient()

  try {
    const now = new Date().toISOString()

    const { data: messages } = await supabase
      .from('campaign_messages')
      .select('*')
      .eq('type', 'usage_tips')
      .eq('status', 'pending')
      .lte('scheduled_for', now)

    if (!messages || messages.length === 0) {
      return { success: true, count: 0 }
    }

    let sent = 0

    for (const message of messages) {
      // Intégration WhatsApp réelle ici
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
    console.error('Erreur envoi conseils:', error)
    return { success: false, error }
  }
}

/**
 * Créer un conseil personnalisé basé sur le produit
 */
export async function createProductSpecificTip(
  userId: string,
  productId: string,
  tipIndex: number = 0
) {
  const supabase = createClient()

  try {
    // Récupérer les infos du produit
    const { data: product } = await supabase
      .from('products')
      .select('name, category, description')
      .eq('id', productId)
      .single()

    if (!product) {
      return { success: false, message: 'Product not found' }
    }

    // Récupérer les infos du client
    const { data: user } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single()

    const message = createTipMessage(
      user?.name || null,
      product.name,
      product.category,
      tipIndex
    )

    const { data: campaign, error } = await supabase
      .from('campaign_messages')
      .insert({
        user_id: userId,
        type: 'usage_tips',
        content: message,
        status: 'pending',
        scheduled_for: new Date().toISOString(),
        metadata: {
          product_id: productId,
          tip_index: tipIndex,
        },
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, campaign }
  } catch (error) {
    console.error('Erreur création conseil:', error)
    return { success: false, error }
  }
}

/**
 * Obtenir des statistiques sur les conseils envoyés
 */
export async function getUsageTipsStats() {
  const supabase = createClient()

  try {
    const { count: totalSent } = await supabase
      .from('campaign_messages')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'usage_tips')
      .eq('status', 'sent')

    const { count: pending } = await supabase
      .from('campaign_messages')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'usage_tips')
      .eq('status', 'pending')

    return {
      success: true,
      stats: {
        totalSent: totalSent || 0,
        pending: pending || 0,
      },
    }
  } catch (error) {
    console.error('Erreur stats conseils:', error)
    return { success: false, error }
  }
}
