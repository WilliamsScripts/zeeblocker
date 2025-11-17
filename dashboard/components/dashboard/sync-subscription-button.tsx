'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SyncSubscriptionButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const syncSubscription = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to sync subscription')
        return
      }

      toast.success(data.message)
      router.refresh()
    } catch (error) {
      toast.error('Failed to sync subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={syncSubscription}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Subscription
        </>
      )}
    </Button>
  )
}

