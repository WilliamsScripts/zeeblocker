import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShieldBan, Chrome, Users, Bell, TrendingUp, Crown } from 'lucide-react'
import Link from 'next/link'
import { STRIPE_PLANS } from '@/lib/stripe/config'
import { SyncSubscriptionButton } from '@/components/dashboard/sync-subscription-button'

export const metadata = {
  title: 'Dashboard - ZeeBlocker',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch statistics
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)

  const { data: browsers } = await supabase
    .from('browser_extensions')
    .select('*')
    .eq('user_id', user.id)

  const { data: blockAttempts } = await supabase
    .from('block_attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('blocked_at', { ascending: false })
    .limit(100)

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_read', false)

  // Calculate stats
  const totalProfiles = profiles?.length || 0
  const totalBrowsers = browsers?.length || 0
  const totalBlocks = blockAttempts?.length || 0
  const unreadNotifications = notifications?.length || 0

  // Today's blocks
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const blocksToday = blockAttempts?.filter(
    (attempt) => new Date(attempt.blocked_at) >= today
  ).length || 0

  // This week's blocks
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const blocksThisWeek = blockAttempts?.filter(
    (attempt) => new Date(attempt.blocked_at) >= weekAgo
  ).length || 0

  const currentPlan = STRIPE_PLANS[userData?.subscription_plan || 'free']
  const subscriptionStatus = userData?.subscription_status || 'free'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      {/* Subscription Card */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-purple-600" />
              <div>
                <CardTitle className="text-2xl">{currentPlan.name} Plan</CardTitle>
                <CardDescription>
                  {subscriptionStatus === 'trialing' && 'Free trial active'}
                  {subscriptionStatus === 'active' && 'Subscription active'}
                  {subscriptionStatus === 'free' && 'Free plan'}
                  {subscriptionStatus === 'canceled' && 'Subscription canceled'}
                  {subscriptionStatus === 'past_due' && 'Payment overdue'}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={
                subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
                  ? 'default'
                  : subscriptionStatus === 'free'
                  ? 'secondary'
                  : 'destructive'
              }
              className="text-sm px-4 py-2"
            >
              {subscriptionStatus === 'trialing' ? 'Trial' : subscriptionStatus.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browsers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalBrowsers} / {currentPlan.maxBrowsers}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Profiles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalProfiles} / {currentPlan.maxProfiles}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${currentPlan.price}/mo
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {subscriptionStatus}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {userData?.subscription_plan === 'free' && (
              <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600">
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
            )}
            {userData?.subscription_plan !== 'free' && (
              <>
                <Button asChild variant="outline">
                  <Link href="/dashboard/billing">Manage Billing</Link>
                </Button>
                <SyncSubscriptionButton />
              </>
            )}
            {userData?.subscription_plan === 'free' && userData?.stripe_customer_id && (
              <SyncSubscriptionButton />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
            <ShieldBan className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBlocks}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {blocksToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked Browsers</CardTitle>
            <Chrome className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBrowsers}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              of {currentPlan.maxBrowsers} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profiles</CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProfiles}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {currentPlan.maxProfiles === 0 ? 'Upgrade to add' : `of ${currentPlan.maxProfiles} available`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unreadNotifications}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              unread
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Blocks</CardTitle>
                <CardDescription>Last 5 blocked attempts</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/timeline">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {blockAttempts && blockAttempts.length > 0 ? (
              <div className="space-y-4">
                {blockAttempts.slice(0, 5).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {attempt.site_url}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(attempt.blocked_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="destructive">Blocked</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No blocked attempts yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started quickly</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link href="/dashboard/blocklists">
                <ShieldBan className="w-4 h-4 mr-2" />
                Manage Blocklists
              </Link>
            </Button>
            
            {currentPlan.maxProfiles > 0 && (
              <Button asChild variant="outline" className="w-full justify-start" size="lg">
                <Link href="/dashboard/profiles">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Profiles
                </Link>
              </Button>
            )}
            
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link href="/dashboard/browsers">
                <Chrome className="w-4 h-4 mr-2" />
                Link a Browser
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link href="/dashboard/settings">
                <TrendingUp className="w-4 h-4 mr-2" />
                Configure Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

