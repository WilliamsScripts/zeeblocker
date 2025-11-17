import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_CONFIG } from '@/lib/config'

export async function createClient() {
  // Check if Supabase is configured
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error(
      '❌ Supabase is not configured!\n\n' +
      '📝 To fix this:\n' +
      '1. Copy dashboard/.env.example to dashboard/.env.local\n' +
      '2. Add your Supabase URL and keys\n' +
      '3. Get them from: https://supabase.com/dashboard/project/_/settings/api\n\n' +
      'See dashboard/SETUP_GUIDE.md for detailed instructions.'
    )
  }

  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

