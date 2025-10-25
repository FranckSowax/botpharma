'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'

interface AnalyticsData {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  avgOrderValue: number
  conversionRate: number
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
  }>
  salesByMonth: Array<{
    month: string
    sales: number
    revenue: number
  }>
  ordersByStatus: {
    pending: number
    completed: number
    cancelled: number
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const supabase = createClient()

  // Charger les analytiques
  const loadAnalytics = async () => {
    setLoading(true)

    try {
      // Date de début selon la période
      let startDate = new Date()
      if (period === '7d') startDate.setDate(startDate.getDate() - 7)
      else if (period === '30d') startDate.setDate(startDate.getDate() - 30)
      else if (period === '90d') startDate.setDate(startDate.getDate() - 90)
      else startDate = new Date(0) // All time

      // Récupérer les commandes
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())

      // Récupérer les clients
      const { count: customersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')

      // Récupérer les produits
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)

      // Récupérer les conversations
      const { count: conversationsCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })

      // Calculer les statistiques
      const totalOrders = orders?.length || 0
      const completedOrders = orders?.filter(o => o.status === 'completed') || []
      const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
      const conversionRate = conversationsCount ? (totalOrders / conversationsCount) * 100 : 0

      // Commandes par statut
      const ordersByStatus = {
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        completed: completedOrders.length,
        cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
      }

      // Ventes par mois (12 derniers mois)
      const salesByMonth = []
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const monthOrders = orders?.filter(o => {
          const orderDate = new Date(o.created_at)
          return orderDate >= monthStart && orderDate <= monthEnd && o.status === 'completed'
        }) || []

        salesByMonth.push({
          month: date.toLocaleDateString('fr-FR', { month: 'short' }),
          sales: monthOrders.length,
          revenue: monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        })
      }

      setAnalytics({
        totalOrders,
        totalRevenue,
        totalCustomers: customersCount || 0,
        totalProducts: productsCount || 0,
        avgOrderValue,
        conversionRate,
        topProducts: [], // À implémenter avec order_items
        salesByMonth,
        ordersByStatus,
      })
    } catch (error) {
      console.error('Erreur chargement analytiques:', error)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadAnalytics()
  }, [period])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">Chargement des analytiques...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Analytiques & Rapports</h2>
              <p className="text-sm text-gray-500 mt-1">
                Vue d'ensemble des performances
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('7d')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  period === '7d'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                7 jours
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  period === '30d'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                30 jours
              </button>
              <button
                onClick={() => setPeriod('90d')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  period === '90d'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                90 jours
              </button>
              <button
                onClick={() => setPeriod('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  period === 'all'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tout
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Revenu Total</h3>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.totalRevenue.toLocaleString()} FCFA
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {analytics.totalOrders} commandes
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Panier Moyen</h3>
                <span className="text-2xl">🛒</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(analytics.avgOrderValue).toLocaleString()} FCFA
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Par commande
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Taux de Conversion</h3>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {analytics.conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Conversations → Commandes
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Clients</h3>
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {analytics.totalCustomers}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Clients enregistrés
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Ventes par Mois */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Ventes par Mois</h3>
              <div className="space-y-3">
                {analytics.salesByMonth.map((month, index) => {
                  const maxRevenue = Math.max(...analytics.salesByMonth.map(m => m.revenue))
                  const width = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{month.month}</span>
                        <span className="text-sm text-gray-500">
                          {month.revenue.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{month.sales} commandes</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Commandes par Statut */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Commandes par Statut</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">En attente</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">
                      {analytics.ordersByStatus.pending}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${(analytics.ordersByStatus.pending / analytics.totalOrders) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Complétées</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {analytics.ordersByStatus.completed}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(analytics.ordersByStatus.completed / analytics.totalOrders) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Annulées</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">
                      {analytics.ordersByStatus.cancelled}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(analytics.ordersByStatus.cancelled / analytics.totalOrders) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Produits Actifs</h3>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalProducts}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Produits disponibles à la vente</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Taux de Succès</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalOrders > 0
                      ? ((analytics.ordersByStatus.completed / analytics.totalOrders) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Commandes complétées avec succès</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Commandes/Client</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalCustomers > 0
                      ? (analytics.totalOrders / analytics.totalCustomers).toFixed(1)
                      : 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Moyenne par client</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
