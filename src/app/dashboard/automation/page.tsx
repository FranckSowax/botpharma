'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { runAllAutomations, getAutomationStats } from '@/lib/automation'

export default function AutomationPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<any>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const result = await getAutomationStats()
    if (result.success) {
      setStats(result.stats)
    }
    setLoading(false)
  }

  const handleRunAutomations = async () => {
    setRunning(true)
    const result = await runAllAutomations()
    setLastRun(result)
    setRunning(false)
    
    // Recharger les stats
    await loadStats()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Automations Post-Achat</h2>
              <p className="text-sm text-gray-500 mt-1">
                Gestion des campagnes automatiques
              </p>
            </div>

            <button
              onClick={handleRunAutomations}
              disabled={running}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                running
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
              }`}
            >
              {running ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Exécution...
                </span>
              ) : (
                '▶️ Exécuter Maintenant'
              )}
            </button>
          </div>

          {/* Last Run Results */}
          {lastRun && (
            <div className={`mb-8 p-6 rounded-xl border-2 ${
              lastRun.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{lastRun.success ? '✅' : '❌'}</span>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {lastRun.success ? 'Exécution réussie !' : 'Erreur lors de l\'exécution'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {lastRun.success && lastRun.results && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Enquêtes détectées</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {lastRun.results.surveys.detected}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Enquêtes envoyées</p>
                    <p className="text-2xl font-bold text-green-600">
                      {lastRun.results.surveys.sent}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Réactivations créées</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {lastRun.results.reactivation.created}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Messages envoyés</p>
                    <p className="text-2xl font-bold text-green-600">
                      {lastRun.results.reactivation.sent + lastRun.results.usageTips.sent + lastRun.results.loyalty.sent}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Automation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Satisfaction Surveys */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Enquêtes de Satisfaction</h3>
                  <p className="text-sm text-gray-500">Après livraison des commandes</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Délai d'envoi</span>
                  <span className="text-sm font-medium text-gray-900">2 jours après livraison</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Relances max</span>
                  <span className="text-sm font-medium text-gray-900">2 fois</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                    Actif
                  </span>
                </div>
              </div>
            </div>

            {/* Reactivation */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Réactivation Clients</h3>
                  <p className="text-sm text-gray-500">Clients inactifs depuis 30j</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Seuil d'inactivité</span>
                  <span className="text-sm font-medium text-gray-900">30 jours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Réduction offerte</span>
                  <span className="text-sm font-medium text-gray-900">15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taux de conversion</span>
                  <span className="text-sm font-medium text-green-600">
                    {stats?.reactivation?.conversionRate?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Conseils d'Utilisation</h3>
                  <p className="text-sm text-gray-500">Messages post-achat</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Délai d'envoi</span>
                  <span className="text-sm font-medium text-gray-900">3 jours après achat</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total envoyés</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.usageTips?.totalSent || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">En attente</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.usageTips?.pending || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Loyalty */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎁</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Programme de Fidélité</h3>
                  <p className="text-sm text-gray-500">Coupons et récompenses</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Coupons créés</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.loyalty?.totalCoupons || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Coupons utilisés</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.loyalty?.usedCoupons || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taux d'utilisation</span>
                  <span className="text-sm font-medium text-green-600">
                    {stats?.loyalty?.redemptionRate?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">ℹ️ Comment ça marche ?</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📊 Enquêtes de Satisfaction</h4>
                <p className="text-sm text-gray-600">
                  Détecte automatiquement les commandes livrées et envoie une enquête 2 jours après. 
                  Les clients peuvent noter leur expérience de 1 à 5 étoiles.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">🔄 Réactivation</h4>
                <p className="text-sm text-gray-600">
                  Identifie les clients inactifs depuis 30 jours et leur envoie un message personnalisé 
                  avec un code promo de 15% pour les encourager à revenir.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">💡 Conseils d'Utilisation</h4>
                <p className="text-sm text-gray-600">
                  Envoie des conseils pratiques 3 jours après l'achat pour aider les clients à 
                  tirer le meilleur parti de leurs produits.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">🎁 Programme de Fidélité</h4>
                <p className="text-sm text-gray-600">
                  Récompense automatiquement les clients fidèles avec des coupons basés sur leurs 
                  achats (jalons de 5, 10, 20 commandes) et envoie des coupons d'anniversaire.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
