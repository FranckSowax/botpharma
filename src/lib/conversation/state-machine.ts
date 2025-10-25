export type ConversationState =
  | 'greeting'
  | 'consent'
  | 'menu'
  | 'product_search'
  | 'health_advice'
  | 'promotions'
  | 'qa_flow'
  | 'recommendations'
  | 'human_handoff'
  | 'completed'

export interface ConversationContext {
  userId: string
  conversationId: string
  currentState: ConversationState
  data: {
    consentGiven?: boolean
    selectedOption?: string
    category?: string
    brand?: string
    preferences?: string[]
    answers?: Record<string, string>
    recommendedProducts?: string[]
  }
}

export class ConversationStateMachine {
  private context: ConversationContext

  constructor(context: ConversationContext) {
    this.context = context
  }

  getContext(): ConversationContext {
    return this.context
  }

  transition(
    event: string,
    data?: Record<string, any>
  ): ConversationState {
    const { currentState } = this.context

    // Update context data
    if (data) {
      this.context.data = { ...this.context.data, ...data }
    }

    // State transitions
    switch (currentState) {
      case 'greeting':
        if (event === 'request_consent') {
          return this.setState('consent')
        }
        break

      case 'consent':
        if (event === 'consent_given') {
          this.context.data.consentGiven = true
          return this.setState('menu')
        }
        if (event === 'consent_denied' || event === 'delete_request') {
          return this.setState('completed')
        }
        break

      case 'menu':
        if (event === 'product_search') {
          return this.setState('product_search')
        }
        if (event === 'health_advice') {
          return this.setState('health_advice')
        }
        if (event === 'promotions') {
          return this.setState('promotions')
        }
        if (event === 'human_handoff') {
          return this.setState('human_handoff')
        }
        break

      case 'product_search':
      case 'health_advice':
      case 'promotions':
        if (event === 'start_qa') {
          return this.setState('qa_flow')
        }
        if (event === 'human_handoff') {
          return this.setState('human_handoff')
        }
        break

      case 'qa_flow':
        if (event === 'qa_complete') {
          return this.setState('recommendations')
        }
        if (event === 'human_handoff') {
          return this.setState('human_handoff')
        }
        break

      case 'recommendations':
        if (event === 'back_to_menu') {
          return this.setState('menu')
        }
        if (event === 'complete') {
          return this.setState('completed')
        }
        if (event === 'human_handoff') {
          return this.setState('human_handoff')
        }
        break

      case 'human_handoff':
        if (event === 'resolved') {
          return this.setState('menu')
        }
        break

      default:
        break
    }

    return currentState
  }

  private setState(newState: ConversationState): ConversationState {
    this.context.currentState = newState
    return newState
  }

  shouldEscalateToHuman(message: string, cartValue?: number): boolean {
    const escalationKeywords = [
      'conseiller',
      'humain',
      'personne',
      'aide',
      'problème',
      'urgent',
      'parler',
      'agent',
    ]

    const hasKeyword = escalationKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    )

    const highValue = cartValue && cartValue > 150000

    return hasKeyword || !!highValue
  }

  isDeleteRequest(message: string): boolean {
    return message.toLowerCase().includes('supprimer')
  }
}

export function createStateMachine(
  context: ConversationContext
): ConversationStateMachine {
  return new ConversationStateMachine(context)
}
