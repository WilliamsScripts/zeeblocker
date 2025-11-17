'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Chrome, Copy, Check, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface APIKey {
  id: string
  api_key: string
  name: string | null
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

interface Browser {
  id: string
  browser_type: string
  browser_version: string | null
  platform: string | null
  last_sync_at: string | null
  is_active: boolean
  created_at: string
  api_key: APIKey
}

interface UserData {
  subscription_plan: string
  max_browsers: number
}

export function BrowserManager({ userData, browsers }: { userData: UserData | null; browsers: Browser[] }) {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const activeBrowsers = browsers.filter(b => b.is_active)
  const maxBrowsers = userData?.max_browsers || 1

  const generateApiKey = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/extension/generate-key', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to generate API key')
        return
      }

      setApiKey(data.apiKey)
      toast.success('API key generated successfully')
      // Refresh to show new browser entry
      setTimeout(() => router.refresh(), 1000)
    } catch (error) {
      toast.error('Failed to generate API key')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    toast.success('API key copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const removeBrowser = async (browserId: string, apiKeyId: string) => {
    if (!confirm('Are you sure you want to remove this browser? It will stop syncing blocklists.')) {
      return
    }

    try {
      const supabase = createClient()
      
      // Deactivate the browser
      const { error: browserError } = await supabase
        .from('browser_extensions')
        .update({ is_active: false })
        .eq('id', browserId)

      if (browserError) throw browserError

      // Deactivate the API key
      const { error: keyError } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', apiKeyId)

      if (keyError) throw keyError

      toast.success('Browser removed successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to remove browser')
    }
  }

  const maskApiKey = (key: string) => {
    if (!key || key.length < 16) return key
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`
  }

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('API key copied to clipboard')
  }

  const getBrowserIcon = (browserType: string) => {
    return <Chrome className="h-5 w-5" />
  }

  const formatBrowserType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Browser Limit Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Connected Browsers</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {activeBrowsers.length} of {maxBrowsers} browser{maxBrowsers !== 1 ? 's' : ''} connected
            </p>
          </div>
          <Badge variant={activeBrowsers.length >= maxBrowsers ? 'destructive' : 'default'}>
            {userData?.subscription_plan || 'Free'} Plan
          </Badge>
        </div>

        {activeBrowsers.length >= maxBrowsers && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Browser limit reached
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Upgrade your plan to connect more browsers.
              </p>
              <Button asChild size="sm" className="mt-2">
                <a href="/pricing">View Plans</a>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Browser Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Add New Browser</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Generate an API key to connect a new browser extension
            </p>
          </div>

          {!apiKey ? (
            <Button 
              onClick={generateApiKey}
              disabled={loading || activeBrowsers.length >= maxBrowsers}
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate API Key'
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      API Key Generated Successfully!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Copy this key and paste it in your browser extension settings.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    value={apiKey}
                    readOnly
                    className="font-mono text-sm flex-1"
                  />
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📋 Setup Instructions:
                </p>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside ml-2">
                  <li>Install the ZeeBlocker extension in your browser</li>
                  <li>Open the extension popup</li>
                  <li>Paste this API key in the input field</li>
                  <li>Click "Connect to Dashboard"</li>
                  <li>Your browser will sync automatically! 🎉</li>
                </ol>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
                  <strong>⚠️ Important:</strong> Keep this API key safe! Anyone with this key can connect to your account.
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setApiKey('')}
                  variant="outline"
                  size="sm"
                >
                  Generate New Key
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <a href="/connect" target="_blank">
                    📖 View Full Guide
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Connected Browsers List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Connected Browsers</h3>
        
        {activeBrowsers.length === 0 ? (
          <div className="text-center py-12">
            <Chrome className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No browsers connected yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Generate an API key above to get started
            </p>
          </div>
        ) : (
              <div className="space-y-4">
                {activeBrowsers.map((browser) => (
                  <div
                    key={browser.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        {getBrowserIcon(browser.browser_type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {formatBrowserType(browser.browser_type)}
                            </p>
                            <Badge variant={browser.api_key?.is_active ? 'default' : 'secondary'}>
                              {browser.api_key?.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {browser.browser_version && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Version {browser.browser_version}
                              {browser.platform && ` • ${browser.platform}`}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {browser.last_sync_at
                              ? `Last synced ${formatDistanceToNow(new Date(browser.last_sync_at), { addSuffix: true })}`
                              : 'Never synced'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBrowser(browser.id, browser.api_key.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* API Key Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            API Key
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-white dark:bg-gray-900 px-3 py-1 rounded border border-gray-200 dark:border-gray-700">
                              {maskApiKey(browser.api_key.api_key)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyApiKey(browser.api_key.api_key)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {browser.api_key.last_used_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Last used {formatDistanceToNow(new Date(browser.api_key.last_used_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </Card>
    </div>
  )
}

