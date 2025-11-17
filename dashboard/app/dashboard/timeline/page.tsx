import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldBan, Calendar, User } from 'lucide-react'

export const metadata = {
  title: 'Timeline - ZeeBlocker',
}

export default async function TimelinePage({
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

  // Get block attempts
  const query = supabase
    .from('block_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('blocked_at', { ascending: false })
    .limit(100)

  if (profileId) {
    query.eq('profile_id', profileId)
  }

  const { data: blockAttempts } = await query

  // Get profile data if specified
  let profileData = null
  if (profileId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()
    profileData = data
  }

  // Calculate stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const blocksToday = blockAttempts?.filter(
    (attempt) => new Date(attempt.blocked_at) >= today
  ).length || 0

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const blocksThisWeek = blockAttempts?.filter(
    (attempt) => new Date(attempt.blocked_at) >= weekAgo
  ).length || 0

  const uniqueSites = new Set(blockAttempts?.map(a => a.site_url)).size

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Activity Timeline {profileData ? `- ${profileData.name}` : ''}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View all blocked site access attempts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{blocksToday}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              blocks today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{blocksThisWeek}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              blocks this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Sites</CardTitle>
            <ShieldBan className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueSites}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              different sites blocked
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Block Attempts</CardTitle>
          <CardDescription>
            Recent attempts to access blocked websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {blockAttempts && blockAttempts.length > 0 ? (
            <div className="space-y-4">
              {blockAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <ShieldBan className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {attempt.site_url}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(attempt.blocked_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {attempt.notified && (
                      <Badge variant="default">Notified</Badge>
                    )}
                    <Badge variant="destructive">Blocked</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <ShieldBan className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No blocks yet</p>
              <p>When sites are blocked, they'll appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

