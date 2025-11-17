'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'

export function AddBlocklistItem({ profileId, profiles }: { profileId: string | null; profiles: Profile[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    siteUrl: '',
    category: 'custom',
    profile: profileId || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Clean URL
      let cleanUrl = formData.siteUrl.trim().toLowerCase()
      cleanUrl = cleanUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')

      const { error } = await supabase.from('blocklists').insert({
        user_id: user.id,
        profile_id: formData.profile || null,
        site_url: cleanUrl,
        category: formData.category,
        is_active: true,
      })

      if (error) {
        throw error
      }

      toast.success('Site added to blocklist')
      setOpen(false)
      setFormData({ siteUrl: '', category: 'custom', profile: profileId || '' })
      router.refresh()
    } catch (error) {
      const err = error as Error
      console.error('Error adding to blocklist:', error)
      toast.error(err.message || 'Failed to add site')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Site
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add to Blocklist</DialogTitle>
            <DialogDescription>
              Enter a website URL to block
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="siteUrl">Website URL *</Label>
              <Input
                id="siteUrl"
                value={formData.siteUrl}
                onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
                placeholder="example.com"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter without http:// or www (e.g., facebook.com)
              </p>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distraction">Distraction</SelectItem>
                  <SelectItem value="adult">Adult Content</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {profiles.length > 0 && (
              <div>
                <Label htmlFor="profile">Profile (optional)</Label>
                <Select
                  value={formData.profile}
                  onValueChange={(value) => setFormData({ ...formData, profile: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Personal (no profile)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Personal (no profile)</SelectItem>
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Blocklist'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

