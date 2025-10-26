/**
 * Client Supabase côté serveur avec Service Role Key
 * À utiliser UNIQUEMENT côté serveur pour contourner RLS
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for server client')
}

/**
 * Client Supabase avec Service Role Key
 * ⚠️ ATTENTION: Ce client contourne toutes les politiques RLS
 * À utiliser UNIQUEMENT pour les opérations serveur sécurisées
 */
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
