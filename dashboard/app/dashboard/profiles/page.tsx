import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, User, Briefcase } from 'lucide-react'
import { CreateProfileButton } from '@/components/dashboard/create-profile-button'
import { ProfileCard } from '@/components/dashboard/profile-card'

export const metadata = {
  title: 'Profiles - ZeeBlocker',
}

export default async function ProfilesPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const canAddProfiles = userData && userData.max_profiles > 0
  const profilesRemaining = userData ? userData.max_profiles - (profiles?.length || 0) : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profiles</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage child or worker profiles and their settings
          </p>
        </div>
        {canAddProfiles && profilesRemaining > 0 && (
          <CreateProfileButton
            maxProfiles={userData.max_profiles}
            currentCount={profiles?.length || 0}
            planType={userData.subscription_plan}
          />
        )}
      </div>

      {!canAddProfiles && (
        <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Upgrade Required</span>
            </CardTitle>
            <CardDescription>
              Your current plan doesn't support profiles. Upgrade to Family or Organization plan to add child or worker profiles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <a href="/pricing">View Plans</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {canAddProfiles && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Profiles</CardTitle>
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profiles?.length || 0}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {profilesRemaining} slots remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Types</CardTitle>
              <Briefcase className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div>
                  <p className="text-2xl font-bold">
                    {profiles?.filter(p => p.profile_type === 'child').length || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Children</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {profiles?.filter(p => p.profile_type === 'worker').length || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Workers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {profiles && profiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}

      {canAddProfiles && (!profiles || profiles.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No profiles yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Create profiles for your children or team members to manage their browsing and blocklists separately.
            </p>
            <CreateProfileButton
              maxProfiles={userData.max_profiles}
              currentCount={0}
              planType={userData.subscription_plan}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

