'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  UserCheck,
  UsersRound,
  Building2,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Analytics {
  totalUsers: number
  activeUsers: number
  totalChildren: number
  totalOrganizations: number
  totalBlockAttempts: number
  todayBlockAttempts: number
  subscriptions: {
    free: number
    pro: number
    family: number
    org: number
  }
  browsers: {
    chrome: number
    firefox: number
    brave: number
    arc: number
  }
  mrr: number
  revenueThisMonth: number
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    try {
      // Fetch all analytics data
      const { data: users } = await supabase.from('users').select('*')

      const { data: profiles } = await supabase.from('profiles').select('*')

      const { data: attempts } = await supabase.from('access_attempts').select('*')

      const { data: extensions } = await supabase.from('browser_extensions').select('*')

      // Calculate analytics
      const totalUsers = users?.length || 0
      const activeUsers =
        users?.filter((u) => u.subscription_status === 'active' || u.subscription_status === 'trialing')
          .length || 0

      const totalChildren = profiles?.filter((p) => p.type === 'child').length || 0
      const totalOrganizations = profiles?.filter((p) => p.type === 'worker').length || 0

      const totalBlockAttempts = attempts?.length || 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayBlockAttempts =
        attempts?.filter((a) => new Date(a.created_at) >= today).length || 0

      // Subscription breakdown
      const subscriptions = {
        free: users?.filter((u) => u.subscription_plan === 'free').length || 0,
        pro: users?.filter((u) => u.subscription_plan === 'pro').length || 0,
        family: users?.filter((u) => u.subscription_plan === 'family').length || 0,
        org: users?.filter((u) => u.subscription_plan === 'org').length || 0,
      }

      // Browser breakdown
      const browsers = {
        chrome: extensions?.filter((e) => e.browser_type === 'chrome').length || 0,
        firefox: extensions?.filter((e) => e.browser_type === 'firefox').length || 0,
        brave: extensions?.filter((e) => e.browser_type === 'brave').length || 0,
        arc: extensions?.filter((e) => e.browser_type === 'arc').length || 0,
      }

      // Calculate MRR
      const mrr =
        subscriptions.pro * 15 + subscriptions.family * 25 + subscriptions.org * 30

      setAnalytics({
        totalUsers,
        activeUsers,
        totalChildren,
        totalOrganizations,
        totalBlockAttempts,
        todayBlockAttempts,
        subscriptions,
        browsers,
        mrr,
        revenueThisMonth: mrr, // Simplified - in reality you'd calculate based on Stripe data
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function exportToCSV() {
    try {
      const { data: users } = await supabase.from('users').select('*')

      if (!users) return

      // Create CSV content
      const headers = ['ID', 'Email', 'Plan', 'Status', 'Created At', 'Max Browsers', 'Max Profiles']
      const rows = users.map((user) => [
        user.id,
        user.email,
        user.subscription_plan || 'free',
        user.subscription_status || 'inactive',
        new Date(user.created_at).toISOString(),
        user.max_browsers || 1,
        user.max_profiles || 0,
      ])

      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `zeeblocker-analytics-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting to CSV:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load analytics data
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of ZeeBlocker platform analytics</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeUsers} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.mrr}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              MRR (Monthly Recurring Revenue)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Block Attempts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBlockAttempts}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.todayBlockAttempts} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Child Profiles</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalChildren}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalOrganizations} worker profiles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Distribution</CardTitle>
          <CardDescription>Breakdown of users by subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Free</span>
                <Badge variant="secondary">{analytics.subscriptions.free}</Badge>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400"
                  style={{
                    width: `${(analytics.subscriptions.free / analytics.totalUsers) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pro ($15/mo)</span>
                <Badge variant="default">{analytics.subscriptions.pro}</Badge>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${(analytics.subscriptions.pro / analytics.totalUsers) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Family ($25/mo)</span>
                <Badge variant="default">{analytics.subscriptions.family}</Badge>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${(analytics.subscriptions.family / analytics.totalUsers) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Organization ($30/mo)</span>
                <Badge variant="default">{analytics.subscriptions.org}</Badge>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${(analytics.subscriptions.org / analytics.totalUsers) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Browser Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Browser Usage</CardTitle>
          <CardDescription>Distribution of connected browser extensions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{analytics.browsers.chrome}</div>
              <p className="text-sm text-muted-foreground">Chrome</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{analytics.browsers.firefox}</div>
              <p className="text-sm text-muted-foreground">Firefox</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{analytics.browsers.brave}</div>
              <p className="text-sm text-muted-foreground">Brave</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{analytics.browsers.arc}</div>
              <p className="text-sm text-muted-foreground">Arc</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

