'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Mail, Bell, BellOff, Settings, Trash2 } from 'lucide-react'
import { Profile } from '@/lib/types'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ProfileCard({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the profile "${profile.name}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('profiles').delete().eq('id', profile.id)

      if (error) {
        throw error
      }

      toast.success('Profile deleted successfully')
      router.refresh()
    } catch (error) {
      const err = error as Error
      console.error('Error deleting profile:', error)
      toast.error(err.message || 'Failed to delete profile')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              <Badge variant={profile.profile_type === 'child' ? 'default' : 'secondary'}>
                {profile.profile_type === 'child' ? 'Child' : 'Worker'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4" />
            <span>{profile.email}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {profile.notify_on_block ? (
            <>
              <Bell className="w-4 h-4 text-green-500" />
              <span>Notifications enabled</span>
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4" />
              <span>Notifications disabled</span>
            </>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dashboard/blocklists?profile=${profile.id}`}>
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

