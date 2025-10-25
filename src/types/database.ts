export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone_number: string
          name: string | null
          role: 'customer' | 'admin' | 'product_editor' | 'support'
          profile_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone_number: string
          name?: string | null
          role: 'customer' | 'admin' | 'product_editor' | 'support'
          profile_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone_number?: string
          name?: string | null
          role?: 'customer' | 'admin' | 'product_editor' | 'support'
          profile_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          price_cfa: number
          stock_qty: number
          image_url: string | null
          ingredients: string | null
          expiration_date: string | null
          brand: string | null
          barcode: string | null
          tags: string[]
          bio: boolean
          vegan: boolean
          fragrance_free: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          price_cfa: number
          stock_qty?: number
          image_url?: string | null
          ingredients?: string | null
          expiration_date?: string | null
          brand?: string | null
          barcode?: string | null
          tags?: string[]
          bio?: boolean
          vegan?: boolean
          fragrance_free?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          price_cfa?: number
          stock_qty?: number
          image_url?: string | null
          ingredients?: string | null
          expiration_date?: string | null
          brand?: string | null
          barcode?: string | null
          tags?: string[]
          bio?: boolean
          vegan?: boolean
          fragrance_free?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string | null
          started_at: string
          ended_at: string | null
          status: 'open' | 'closed' | 'escalated'
          current_state: string | null
          conversation_data: Json
        }
        Insert: {
          id?: string
          user_id?: string | null
          started_at?: string
          ended_at?: string | null
          status?: 'open' | 'closed' | 'escalated'
          current_state?: string | null
          conversation_data?: Json
        }
        Update: {
          id?: string
          user_id?: string | null
          started_at?: string
          ended_at?: string | null
          status?: 'open' | 'closed' | 'escalated'
          current_state?: string | null
          conversation_data?: Json
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender: 'user' | 'assistant' | 'human'
          content: string
          metadata: Json
          timestamp: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender: 'user' | 'assistant' | 'human'
          content: string
          metadata?: Json
          timestamp?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender?: 'user' | 'assistant' | 'human'
          content?: string
          metadata?: Json
          timestamp?: string
        }
      }
      orders: {
        Row: {
          id: string
          conversation_id: string
          user_id: string | null
          order_link: string
          external_order_id: string | null
          total_amount: number | null
          status: 'pending' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id?: string | null
          order_link: string
          external_order_id?: string | null
          total_amount?: number | null
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string | null
          order_link?: string
          external_order_id?: string | null
          total_amount?: number | null
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      consent_logs: {
        Row: {
          id: string
          user_id: string
          consent_given: boolean
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          consent_given: boolean
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          consent_given?: boolean
          timestamp?: string
        }
      }
      advisor_alerts: {
        Row: {
          id: string
          conversation_id: string
          reason: string
          triggered_at: string
          handled_by: string | null
          handled_at: string | null
          status: 'pending' | 'assigned' | 'resolved'
        }
        Insert: {
          id?: string
          conversation_id: string
          reason: string
          triggered_at?: string
          handled_by?: string | null
          handled_at?: string | null
          status?: 'pending' | 'assigned' | 'resolved'
        }
        Update: {
          id?: string
          conversation_id?: string
          reason?: string
          triggered_at?: string
          handled_by?: string | null
          handled_at?: string | null
          status?: 'pending' | 'assigned' | 'resolved'
        }
      }
      loyalty_coupons: {
        Row: {
          id: string
          user_id: string
          code: string
          discount_pct: number
          valid_from: string
          valid_to: string
          used: boolean
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code: string
          discount_pct: number
          valid_from: string
          valid_to: string
          used?: boolean
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code?: string
          discount_pct?: number
          valid_from?: string
          valid_to?: string
          used?: boolean
          used_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_data: {
        Args: { target_user_id: string }
        Returns: void
      }
      check_user_consent: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      export_user_data: {
        Args: { target_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
