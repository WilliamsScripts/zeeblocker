import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BrowserManager } from '@/components/dashboard/browser-manager'

export const metadata = {
  title: 'Browser Management - ZeeBlocker',
  description: 'Manage your connected browsers and extensions',
}

export default async function BrowsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user subscription info
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get connected browsers with their API keys
  const { data: browsers } = await supabase
    .from('browser_extensions')
    .select(`
      *,
      api_key:api_keys(
        id,
        api_key,
        name,
        is_active,
        last_used_at,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Browser Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Connect and manage your browser extensions
        </p>
      </div>

      <BrowserManager 
        userData={userData}
        browsers={browsers || []}
      />
    </div>
  )
}

