import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddBlocklistItem } from '@/components/dashboard/add-blocklist-item'
import { BlocklistTable } from '@/components/dashboard/blocklist-table'

export const metadata = {
  title: 'Blocklists - ZeeBlocker',
}

export default async function BlocklistsPage({
  searchParams,
}: {
  searchParams: { profile?: string }
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const profileId = searchParams.profile

  // Get blocklists
  const query = supabase
    .from('blocklists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (profileId) {
    query.eq('profile_id', profileId)
  } else {
    query.is('profile_id', null)
  }

  const { data: blocklists } = await query

  // Get profile if specified
  let profileData = null
  if (profileId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()
    profileData = data
  }

  // Get all profiles for dropdown
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)

  const blocklistStats = {
    total: blocklists?.length || 0,
    distraction: blocklists?.filter(b => b.category === 'distraction').length || 0,
    adult: blocklists?.filter(b => b.category === 'adult').length || 0,
    custom: blocklists?.filter(b => b.category === 'custom').length || 0,
    active: blocklists?.filter(b => b.is_active).length || 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Blocklists {profileData ? `- ${profileData.name}` : '(Personal)'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage blocked websites and categories
          </p>
        </div>
        <AddBlocklistItem profileId={profileId || null} profiles={profiles || []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{blocklistStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distractions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{blocklistStats.distraction}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Adult Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{blocklistStats.adult}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{blocklistStats.active}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blocked Sites</CardTitle>
          <CardDescription>
            Sites in this list will be blocked across all linked browsers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlocklistTable blocklists={blocklists || []} />
        </CardContent>
      </Card>
    </div>
  )
}

