'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'

interface Customer {
  id: string
  phone_number: string
  name: string | null
  role: string
  profile_data: any
  created_at: string
  updated_at: string
  order_count?: number
  total_spent?: number
  last_order?: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  // Charger les clients
  const loadCustomers = async () => {
    setLoading(true)
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur chargement clients:', error)
      setLoading(false)
      return
    }

    // Enrichir avec les statistiques de commandes
    const enrichedCustomers = await Promise.all(
      (users || []).map(async (user) => {
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('user_id', user.id)
          .eq('status', 'completed')

        const orderCount = orders?.length || 0
        const totalSpent = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
        const lastOrder = orders?.[0]?.created_at || null

        return {
          ...user,
          order_count: orderCount,
          total_spent: totalSpent,
          last_order: lastOrder,
        }
      })
    )

    setCustomers(enrichedCustomers)
    setLoading(false)
  }

  useEffect(() => {
    loadCustomers()

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        () => {
          loadCustomers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Filtrer les clients
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Calculer les statistiques
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.order_count && c.order_count > 0).length,
    new: customers.filter(c => {
      const createdDate = new Date(c.created_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return createdDate > thirtyDaysAgo
    }).length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
  }

  // Formater la date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Jamais'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
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
              <h2 className="text-3xl font-bold text-gray-900">Gestion des Clients</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredCustomers.length} client{filteredCustomers.length > 1 ? 's' : ''} trouvé{filteredCustomers.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Clients Actifs</h3>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Nouveaux (30j)</h3>
                <span className="text-2xl">🆕</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Revenu Total</h3>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRevenue.toLocaleString()} FCFA
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">Chargement des clients...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-6xl">👥</span>
                <p className="mt-4 text-gray-500">Aucun client trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="text-center py-4 px-6 text-xs font-medium text-gray-500 uppercase">Commandes</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase">Total Dépensé</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Dernière Commande</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
                      <th className="text-center py-4 px-6 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {customer.name?.[0] || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {customer.name || 'Client'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {customer.phone_number}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
                            {customer.order_count || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {(customer.total_spent || 0).toLocaleString()} FCFA
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600">
                            {formatDate(customer.last_order)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600">
                            {formatDate(customer.created_at)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setShowModal(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Détails */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Profil Client
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar et Nom */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {selectedCustomer.name?.[0] || '?'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {selectedCustomer.name || 'Client'}
                  </h4>
                  <p className="text-sm text-gray-500">{selectedCustomer.phone_number}</p>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedCustomer.order_count || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Commandes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {(selectedCustomer.total_spent || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">FCFA Dépensés</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-bold text-gray-900">
                    {formatDate(selectedCustomer.last_order)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Dernière Commande</p>
                </div>
              </div>

              {/* Informations */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Informations</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ID Client</span>
                    <span className="text-sm font-mono text-gray-900">
                      {selectedCustomer.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Téléphone</span>
                    <span className="text-sm text-gray-900">
                      {selectedCustomer.phone_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Inscrit le</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(selectedCustomer.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rôle</span>
                    <span className="text-sm text-gray-900 capitalize">
                      {selectedCustomer.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Préférences */}
              {selectedCustomer.profile_data && Object.keys(selectedCustomer.profile_data).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Préférences</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-xs text-gray-700 overflow-auto">
                      {JSON.stringify(selectedCustomer.profile_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
