'use client'

import { useState } from 'react'

export default function TestWhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('+241')
  const [message, setMessage] = useState('Bonjour, je teste le bot!')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<any>(null)

  // Test d'envoi de message
  const handleSendMessage = async () => {
    setLoading(true)
    setResponse(null)
    
    try {
      const res = await fetch('/api/test/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, message }),
      })
      
      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({ error: 'Erreur lors de l\'envoi', details: error })
    } finally {
      setLoading(false)
    }
  }

  // Test du webhook
  const handleTestWebhook = async () => {
    setLoading(true)
    setWebhookStatus(null)
    
    try {
      const res = await fetch('/api/webhook/whatsapp', {
        method: 'GET',
      })
      
      const data = await res.json()
      setWebhookStatus(data)
    } catch (error) {
      setWebhookStatus({ error: 'Erreur webhook', details: error })
    } finally {
      setLoading(false)
    }
  }

  // Test de la configuration
  const handleTestConfig = async () => {
    setLoading(true)
    setResponse(null)
    
    try {
      const res = await fetch('/api/test/config', {
        method: 'GET',
      })
      
      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({ error: 'Erreur config', details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧪 Test WhatsApp Bot
          </h1>
          <p className="text-gray-600 mb-8">
            Interface de test pour vérifier la configuration et envoyer des messages
          </p>

          {/* Section 1: Test Webhook */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1️⃣ Test du Webhook
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Vérifie que le webhook est actif et répond correctement
            </p>
            <button
              onClick={handleTestWebhook}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Test en cours...' : 'Tester le Webhook'}
            </button>
            
            {webhookStatus && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(webhookStatus, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Section 2: Test Configuration */}
          <div className="mb-8 p-6 bg-purple-50 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              2️⃣ Test de la Configuration
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Vérifie que toutes les variables d&apos;environnement sont configurées
            </p>
            <button
              onClick={handleTestConfig}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Vérification...' : 'Vérifier la Config'}
            </button>
          </div>

          {/* Section 3: Envoi de Message */}
          <div className="mb-8 p-6 bg-green-50 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              3️⃣ Envoyer un Message de Test
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Envoie un message WhatsApp via l&apos;API Whapi
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone (format international)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+241XXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: +241 suivi du numéro (ex: +24177123456)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Votre message de test..."
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={loading || !phoneNumber || !message}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {loading ? '📤 Envoi en cours...' : '📤 Envoyer le Message'}
              </button>
            </div>
          </div>

          {/* Résultat */}
          {response && (
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📊 Résultat
              </h3>
              <div className="bg-white p-4 rounded-lg overflow-auto">
                <pre className="text-sm">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
              
              {response.success && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✅ Message envoyé avec succès !
                  </p>
                </div>
              )}
              
              {response.error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
                  <p className="text-red-800 font-medium">
                    ❌ Erreur: {response.error}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              💡 Instructions
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Étape 1:</strong> Teste d&apos;abord le webhook pour vérifier qu&apos;il est actif</li>
              <li>• <strong>Étape 2:</strong> Vérifie que toutes les variables d&apos;environnement sont configurées</li>
              <li>• <strong>Étape 3:</strong> Envoie un message de test à un numéro WhatsApp</li>
              <li>• <strong>Format du numéro:</strong> +241 suivi du numéro sans espaces (ex: +24177123456)</li>
              <li>• <strong>Note:</strong> Le numéro doit être enregistré dans Whapi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
