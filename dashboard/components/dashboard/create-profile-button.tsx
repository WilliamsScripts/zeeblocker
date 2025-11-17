'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CreateProfileButtonProps {
  maxProfiles: number
  currentCount: number
  planType: string
}

export function CreateProfileButton({ maxProfiles, currentCount, planType }: CreateProfileButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileType: planType === 'family' ? 'child' : 'worker',
    notifyOnBlock: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentCount >= maxProfiles) {
      toast.error('You have reached the maximum number of profiles for your plan')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase.from('profiles').insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email || null,
        profile_type: formData.profileType,
        notify_on_block: formData.notifyOnBlock,
      })

      if (error) {
        throw error
      }

      toast.success('Profile created successfully!')
      setOpen(false)
      setFormData({
        name: '',
        email: '',
        profileType: planType === 'family' ? 'child' : 'worker',
        notifyOnBlock: true,
      })
      router.refresh()
    } catch (error) {
      const err = error as Error
      console.error('Error creating profile:', error)
      toast.error(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Add a {planType === 'family' ? 'child' : 'worker'} profile to manage their browsing and blocklists.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Used for notifications if enabled
              </p>
            </div>

            <div>
              <Label htmlFor="profileType">Type</Label>
              <Select
                value={formData.profileType}
                onValueChange={(value) => setFormData({ ...formData, profileType: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {planType === 'family' && <SelectItem value="child">Child</SelectItem>}
                  {planType === 'org' && <SelectItem value="worker">Worker</SelectItem>}
                  {planType !== 'family' && planType !== 'org' && (
                    <>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Email Notifications</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive alerts when blocked sites are accessed
                </p>
              </div>
              <Switch
                id="notifications"
                checked={formData.notifyOnBlock}
                onCheckedChange={(checked) => setFormData({ ...formData, notifyOnBlock: checked })}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

