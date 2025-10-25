/**
 * Orchestrateur principal des automations post-achat
 * Centralise et coordonne tous les systèmes d'automation
 */

import {
  detectDeliveredOrders,
  sendScheduledSurveys,
  processSurveyResponse,
} from './satisfaction-survey'

import {
  runReactivationCampaign,
  sendReactivationMessages,
  analyzeReactivationEffectiveness,
} from './reactivation'

import {
  detectRecentOrders,
  sendUsageTips,
  getUsageTipsStats,
} from './usage-tips'

import {
  checkMilestones,
  checkPointsForCoupon,
  checkBirthdays,
  sendLoyaltyMessages,
  getLoyaltyStats,
} from './loyalty'

/**
 * Exécuter toutes les automations
 * À appeler périodiquement (ex: via un cron job)
 */
export async function runAllAutomations() {
  console.log('🤖 Démarrage des automations post-achat...')

  const results = {
    surveys: { detected: 0, sent: 0 },
    reactivation: { created: 0, sent: 0 },
    usageTips: { scheduled: 0, sent: 0 },
    loyalty: { coupons: 0, sent: 0, birthdays: 0 },
    errors: [] as string[],
  }

  try {
    // 1. Enquêtes de satisfaction
    console.log('📊 Traitement des enquêtes de satisfaction...')
    const surveysDetected = await detectDeliveredOrders()
    const surveysSent = await sendScheduledSurveys()
    
    results.surveys.detected = surveysDetected.count || 0
    results.surveys.sent = surveysSent.count || 0

    // 2. Réactivation des clients inactifs
    console.log('🔄 Traitement de la réactivation...')
    const reactivationCampaign = await runReactivationCampaign()
    const reactivationSent = await sendReactivationMessages()
    
    results.reactivation.created = reactivationCampaign.count || 0
    results.reactivation.sent = reactivationSent.count || 0

    // 3. Conseils d'utilisation
    console.log('💡 Traitement des conseils d\'utilisation...')
    const tipsScheduled = await detectRecentOrders()
    const tipsSent = await sendUsageTips()
    
    results.usageTips.scheduled = tipsScheduled.count || 0
    results.usageTips.sent = tipsSent.count || 0

    // 4. Programme de fidélité
    console.log('🎁 Traitement du programme de fidélité...')
    const birthdayCoupons = await checkBirthdays()
    const loyaltySent = await sendLoyaltyMessages()
    
    results.loyalty.birthdays = birthdayCoupons.count || 0
    results.loyalty.sent = loyaltySent.count || 0

    console.log('✅ Automations terminées avec succès !')
    console.log('Résultats:', JSON.stringify(results, null, 2))

    return { success: true, results }
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des automations:', error)
    results.errors.push(String(error))
    return { success: false, results, error }
  }
}

/**
 * Obtenir les statistiques globales des automations
 */
export async function getAutomationStats() {
  try {
    const [usageTipsStats, loyaltyStats, reactivationStats] = await Promise.all([
      getUsageTipsStats(),
      getLoyaltyStats(),
      analyzeReactivationEffectiveness(),
    ])

    return {
      success: true,
      stats: {
        usageTips: usageTipsStats.stats,
        loyalty: loyaltyStats.stats,
        reactivation: reactivationStats.stats,
      },
    }
  } catch (error) {
    console.error('Erreur récupération stats:', error)
    return { success: false, error }
  }
}

// Exporter toutes les fonctions individuelles
export {
  // Satisfaction surveys
  detectDeliveredOrders,
  sendScheduledSurveys,
  processSurveyResponse,
  
  // Reactivation
  runReactivationCampaign,
  sendReactivationMessages,
  analyzeReactivationEffectiveness,
  
  // Usage tips
  detectRecentOrders,
  sendUsageTips,
  getUsageTipsStats,
  
  // Loyalty
  checkMilestones,
  checkPointsForCoupon,
  checkBirthdays,
  sendLoyaltyMessages,
  getLoyaltyStats,
}
