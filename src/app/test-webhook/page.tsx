'use client'

import { useState } from 'react'

export default function TestWebhookPage() {
  const [phoneNumber, setPhoneNumber] = useState('24166871309')
  const [message, setMessage] = useState('Bonjour, je cherche une crème hydratante')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Simuler la réception d'un message WhatsApp
  const handleSimulateMessage = async () => {
    setLoading(true)
    setResponse(null)
    
    try {
      // Créer un payload Whapi simulé
      const whapiPayload = {
        messages: [{
          id: `test_${Date.now()}`,
          type: 'text',
          timestamp: Math.floor(Date.now() / 1000),
          from: `${phoneNumber}@s.whatsapp.net`,
          from_name: 'Test User',
          text: {
            body: message
          },
          chat_id: `${phoneNumber}@s.whatsapp.net`
        }]
      }

      // Envoyer au webhook
      const res = await fetch('/api/webhook/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whapiPayload),
      })
      
      const data = await res.json()
      setResponse({
        success: res.ok,
        status: res.status,
        data: data,
        payload: whapiPayload,
      })
    } catch (error) {
      setResponse({ error: 'Erreur lors de la simulation', details: error })
    } finally {
      setLoading(false)
    }
  }

  // Messages prédéfinis pour tester différents scénarios
  const predefinedMessages = [
    { label: 'Salutation', message: 'Bonjour' },
    { label: 'Recherche produit', message: 'Je cherche une crème hydratante pour peau sèche' },
    { label: 'Question prix', message: 'Quel est le prix de la crème Nivea ?' },
    { label: 'Commande', message: 'Je voudrais commander 2 crèmes hydratantes' },
    { label: 'Plainte', message: 'Le produit que j\'ai reçu est défectueux' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔄 Test du Webhook WhatsApp
          </h1>
          <p className="text-gray-600 mb-8">
            Simule la réception d&apos;un message WhatsApp et teste la réponse automatique
          </p>

          {/* Section 1: Configuration du Message */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1️⃣ Configurer le Message de Test
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone (expéditeur)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="24166871309"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre message de test..."
                />
              </div>

              {/* Messages prédéfinis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Messages prédéfinis
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {predefinedMessages.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setMessage(preset.message)}
                      className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSimulateMessage}
                disabled={loading || !phoneNumber || !message}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {loading ? '🔄 Simulation en cours...' : '🚀 Simuler la Réception du Message'}
              </button>
            </div>
          </div>

          {/* Résultat */}
          {response && (
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📊 Résultat
              </h3>
              
              {response.success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✅ Message traité avec succès !
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Le bot a reçu le message et devrait avoir envoyé une réponse.
                  </p>
                </div>
              )}
              
              {response.error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
                  <p className="text-red-800 font-medium">
                    ❌ Erreur: {response.error}
                  </p>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg overflow-auto">
                <h4 className="font-semibold text-gray-700 mb-2">Réponse du Webhook</h4>
                <pre className="text-sm">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>

              {response.payload && (
                <div className="mt-4 bg-white p-4 rounded-lg overflow-auto">
                  <h4 className="font-semibold text-gray-700 mb-2">Payload Envoyé</h4>
                  <pre className="text-sm text-gray-600">
                    {JSON.stringify(response.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              💡 Comment ça Marche ?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Étape 1:</strong> Configure le numéro et le message à simuler</li>
              <li>• <strong>Étape 2:</strong> Clique sur &quot;Simuler la Réception&quot;</li>
              <li>• <strong>Étape 3:</strong> Le webhook reçoit le message comme si c&apos;était WhatsApp</li>
              <li>• <strong>Étape 4:</strong> Le bot analyse le message avec OpenAI</li>
              <li>• <strong>Étape 5:</strong> Le bot génère et envoie une réponse automatique</li>
              <li>• <strong>Note:</strong> Vérifie les logs de la console pour voir le traitement</li>
            </ul>
          </div>

          {/* Lien vers les logs */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-800">
              <strong>💻 Pour voir les logs en temps réel :</strong>
            </p>
            <p className="text-sm text-indigo-700 mt-1">
              Ouvre la console de ton terminal où Next.js tourne (npm run dev)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
