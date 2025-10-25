'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'

interface User {
  id: string
  phone_number: string
  name: string | null
  role: string
}

interface Message {
  id: string
  conversation_id: string
  sender: 'user' | 'assistant' | 'human'
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  user_id: string | null
  started_at: string
  ended_at: string | null
  status: 'open' | 'closed' | 'escalated'
  current_state: string | null
  users: User | null
  messages: Message[]
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  // Charger les conversations
  const loadConversations = async () => {
    setLoading(true)
    
    let query = supabase
      .from('conversations')
      .select(`
        *,
        users (
          id,
          phone_number,
          name,
          role
        )
      `)
      .order('started_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur chargement conversations:', error)
    } else {
      setConversations(data || [])
    }
    setLoading(false)
  }

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Erreur chargement messages:', error)
      return []
    }
    return data || []
  }

  // Sélectionner une conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    const messages = await loadMessages(conversation.id)
    setSelectedConversation({
      ...conversation,
      messages,
    })
  }

  useEffect(() => {
    loadConversations()

    // Écouter les changements en temps réel
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          loadConversations()
        }
      )
      .subscribe()

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          if (selectedConversation) {
            handleSelectConversation(selectedConversation)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(conversationsChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [statusFilter])

  // Filtrer les conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = 
      conv.users?.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return date.toLocaleDateString('fr-FR')
  }

  // Formater l'heure
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex">
          {/* Liste des conversations */}
          <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Conversations</h2>
              
              {/* Recherche */}
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              />

              {/* Filtres */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setStatusFilter('open')}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === 'open'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ouvertes
                </button>
                <button
                  onClick={() => setStatusFilter('escalated')}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === 'escalated'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Escaladées
                </button>
              </div>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm text-gray-500">Chargement...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-6xl">💬</span>
                  <p className="mt-4 text-gray-500">Aucune conversation</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {conv.users?.name?.[0] || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {conv.users?.name || 'Client'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {conv.users?.phone_number || 'Inconnu'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          conv.status === 'open'
                            ? 'bg-green-50 text-green-700'
                            : conv.status === 'escalated'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {conv.status === 'open' ? 'Ouverte' : conv.status === 'escalated' ? 'Escaladée' : 'Fermée'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(conv.started_at)}</p>
                      {conv.current_state && (
                        <p className="text-xs text-gray-400 mt-1">État: {conv.current_state}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Zone de messages */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Header conversation */}
                <div className="bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {selectedConversation.users?.name?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {selectedConversation.users?.name || 'Client'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.users?.phone_number || 'Numéro inconnu'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedConversation.status === 'open'
                          ? 'bg-green-50 text-green-700'
                          : selectedConversation.status === 'escalated'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {selectedConversation.status === 'open' ? 'Ouverte' : selectedConversation.status === 'escalated' ? 'Escaladée' : 'Fermée'}
                      </span>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        ⋮
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-6xl">💬</span>
                      <p className="mt-4 text-gray-500">Aucun message dans cette conversation</p>
                    </div>
                  ) : (
                    selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                              : message.sender === 'assistant'
                              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium opacity-75">
                              {message.sender === 'user' ? 'Client' : message.sender === 'assistant' ? 'Léa' : 'Conseiller'}
                            </span>
                            <span className="text-xs opacity-50">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input message (désactivé pour l'instant) */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Envoyer un message..."
                      disabled
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                    <button
                      disabled
                      className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      Envoyer
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    💡 L'envoi de messages sera disponible prochainement
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-8xl">💬</span>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    Sélectionnez une conversation
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Choisissez une conversation dans la liste pour voir les messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
