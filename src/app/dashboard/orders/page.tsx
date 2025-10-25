'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

interface User {
  id: string
  phone_number: string
  name: string | null
}

interface Order {
  id: string
  conversation_id: string | null
  user_id: string | null
  order_link: string | null
  external_order_id: string | null
  total_amount: number | null
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  users: User | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const supabase = createClient()

  // Charger les commandes
  const loadOrders = async () => {
    setLoading(true)
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        users (
          id,
          phone_number,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur chargement commandes:', error)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          loadOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [statusFilter])

  // Mettre à jour le statut
  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      console.error('Erreur mise à jour statut:', error)
      alert('Erreur lors de la mise à jour')
    } else {
      loadOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any })
      }
    }
  }

  // Filtrer les commandes
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.users?.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.external_order_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Calculer les statistiques
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'En attente' },
      completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Complétée' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Annulée' },
    }
    return badges[status as keyof typeof badges] || badges.pending
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
              <h2 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} trouvée{filteredOrders.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Total Commandes</h3>
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">En attente</h3>
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Complétées</h3>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
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

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par ID, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Status Filters */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  En attente
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Complétées
                </button>
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'cancelled'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Annulées
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">Chargement des commandes...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-6xl">🛒</span>
                <p className="mt-4 text-gray-500">Aucune commande trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">ID Commande</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase">Montant</th>
                      <th className="text-center py-4 px-6 text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="text-center py-4 px-6 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => {
                      const badge = getStatusBadge(order.status)
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <span className="text-sm font-mono text-gray-900">
                                #{order.id.slice(0, 8)}
                              </span>
                              {order.external_order_id && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Ext: {order.external_order_id}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.users?.name || 'Client'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.users?.phone_number || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {(order.total_amount || 0).toLocaleString()} FCFA
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {formatDate(order.created_at)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowModal(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Voir détails"
                              >
                                👁️
                              </button>
                              {order.status !== 'completed' && order.status !== 'cancelled' && (
                                <select
                                  value={order.status}
                                  onChange={(e) => updateStatus(order.id, e.target.value)}
                                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                  <option value="pending">En attente</option>
                                  <option value="completed">Complétée</option>
                                  <option value="cancelled">Annulée</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Détails */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Détails de la commande #{selectedOrder.id.slice(0, 8)}
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
              {/* Statut */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Statut</h4>
                <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full ${getStatusBadge(selectedOrder.status).bg} ${getStatusBadge(selectedOrder.status).text}`}>
                  {getStatusBadge(selectedOrder.status).label}
                </span>
              </div>

              {/* Client */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Client</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{selectedOrder.users?.name || 'Client'}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.users?.phone_number || 'N/A'}</p>
                </div>
              </div>

              {/* Lien de commande */}
              {selectedOrder.order_link && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Lien de commande</h4>
                  <a
                    href={selectedOrder.order_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline break-all"
                  >
                    {selectedOrder.order_link}
                  </a>
                </div>
              )}

              {/* ID Externe */}
              {selectedOrder.external_order_id && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">ID Externe</h4>
                  <p className="text-sm text-gray-900 font-mono">{selectedOrder.external_order_id}</p>
                </div>
              )}

              {/* Montant */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Montant total</h4>
                <p className="text-2xl font-bold text-gray-900">
                  {(selectedOrder.total_amount || 0).toLocaleString()} FCFA
                </p>
              </div>

              {/* Conversation liée */}
              {selectedOrder.conversation_id && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Conversation liée</h4>
                  <Link
                    href={`/dashboard/conversations`}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Voir la conversation
                  </Link>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Créée le</h4>
                  <p className="text-sm text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Mise à jour</h4>
                  <p className="text-sm text-gray-900">{formatDate(selectedOrder.updated_at)}</p>
                </div>
              </div>
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
