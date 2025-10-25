import axios, { AxiosInstance } from 'axios'

export interface WhapiMessage {
  to: string
  body: string
  media?: {
    url: string
    caption?: string
  }
  buttons?: Array<{
    id: string
    title: string
  }>
}

export interface WhapiWebhookPayload {
  messages: Array<{
    id: string
    from: string
    body: string
    timestamp: number
    type: string
  }>
}

class WhapiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud',
      headers: {
        Authorization: `Bearer ${process.env.WHAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })
  }

  async sendMessage(message: WhapiMessage): Promise<{ messageId: string }> {
    try {
      const response = await this.client.post('/messages/text', {
        to: message.to,
        body: message.body,
      })
      return { messageId: response.data.id }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      throw new Error('Failed to send WhatsApp message')
    }
  }

  async sendMediaMessage(message: WhapiMessage): Promise<{ messageId: string }> {
    if (!message.media) {
      throw new Error('Media URL is required for media messages')
    }

    try {
      const response = await this.client.post('/messages/image', {
        to: message.to,
        media: {
          url: message.media.url,
        },
        caption: message.media.caption || '',
      })
      return { messageId: response.data.id }
    } catch (error) {
      console.error('Error sending WhatsApp media message:', error)
      throw new Error('Failed to send WhatsApp media message')
    }
  }

  async sendButtonMessage(message: WhapiMessage): Promise<{ messageId: string }> {
    if (!message.buttons || message.buttons.length === 0) {
      throw new Error('Buttons are required for button messages')
    }

    try {
      const response = await this.client.post('/messages/interactive', {
        to: message.to,
        type: 'button',
        body: {
          text: message.body,
        },
        action: {
          buttons: message.buttons.map((btn) => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title,
            },
          })),
        },
      })
      return { messageId: response.data.id }
    } catch (error) {
      console.error('Error sending WhatsApp button message:', error)
      throw new Error('Failed to send WhatsApp button message')
    }
  }

  verifyWebhook(signature: string, payload: string): boolean {
    // Webhook verification - can be implemented later if needed
    return true
  }
}

export const whapiClient = new WhapiClient()
