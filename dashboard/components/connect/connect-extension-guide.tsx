'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Chrome, Download, Key, Settings, Shield, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import type { User } from '@/lib/types'

interface ConnectExtensionGuideProps {
  userData: User | null
  hasConnectedBrowsers: boolean
}

export function ConnectExtensionGuide({ userData, hasConnectedBrowsers }: ConnectExtensionGuideProps) {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

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
      setCurrentStep(2)
      toast.success('API key generated successfully')
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

  const steps = [
    {
      number: 1,
      title: 'Generate Your API Key',
      icon: Key,
      description: 'Create a unique key to connect your browser',
      completed: currentStep > 1 || hasConnectedBrowsers,
    },
    {
      number: 2,
      title: 'Install the Extension',
      icon: Download,
      description: 'Add ZeeBlocker to your browser',
      completed: currentStep > 2 || hasConnectedBrowsers,
    },
    {
      number: 3,
      title: 'Connect & Sync',
      icon: Settings,
      description: 'Enter your API key in the extension',
      completed: hasConnectedBrowsers,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.number
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-medium mt-2 text-center hidden md:block">
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-4 transition-all ${
                  step.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Generate API Key */}
      <Card className={currentStep === 1 ? 'ring-2 ring-purple-500' : ''}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Key className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <CardTitle>Step 1: Generate Your API Key</CardTitle>
              <CardDescription>
                Your {userData?.subscription_plan || 'free'} plan allows {userData?.max_browsers || 1} browser connection{(userData?.max_browsers || 1) > 1 ? 's' : ''}
              </CardDescription>
            </div>
            {currentStep > 1 && <Badge variant="secondary">✓ Completed</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!apiKey ? (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click the button below to generate a secure API key for your browser extension.
              </p>
              <Button onClick={generateApiKey} disabled={loading} size="lg">
                {loading ? 'Generating...' : 'Generate API Key'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your API Key</label>
                <div className="flex gap-2">
                  <Input
                    value={apiKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyToClipboard} size="icon" variant="outline">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ Keep this key safe! You'll need it in Step 3.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Install Extension */}
      <Card className={currentStep === 2 ? 'ring-2 ring-purple-500' : ''}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle>Step 2: Install the Extension</CardTitle>
              <CardDescription>
                Add ZeeBlocker to your browser
              </CardDescription>
            </div>
            {hasConnectedBrowsers && <Badge variant="secondary">✓ Completed</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chrome/Brave/Arc */}
            <div className="p-4 border rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Chrome className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <h4 className="font-semibold">Chrome / Brave / Arc</h4>
              </div>
              <ol className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>1. Download the extension folder</li>
                <li>2. Go to <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">chrome://extensions</code></li>
                <li>3. Enable "Developer mode"</li>
                <li>4. Click "Load unpacked"</li>
                <li>5. Select the extension folder</li>
              </ol>
            </div>

            {/* Firefox */}
            <div className="p-4 border rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Chrome className="w-6 h-6 text-orange-500" />
                <h4 className="font-semibold">Firefox</h4>
              </div>
              <ol className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>1. Download the extension folder</li>
                <li>2. Go to <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">about:debugging</code></li>
                <li>3. Click "This Firefox"</li>
                <li>4. Click "Load Temporary Add-on"</li>
                <li>5. Select manifest-firefox.json</li>
              </ol>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Tip:</strong> You can also install from Chrome Web Store or Firefox Add-ons (when published).
            </p>
          </div>

          {apiKey && (
            <Button onClick={() => setCurrentStep(3)} size="lg" className="w-full">
              I've Installed the Extension →
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Connect */}
      <Card className={currentStep === 3 ? 'ring-2 ring-purple-500' : ''}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <CardTitle>Step 3: Connect Your Browser</CardTitle>
              <CardDescription>
                Enter your API key in the extension
              </CardDescription>
            </div>
            {hasConnectedBrowsers && <Badge variant="secondary">✓ Completed</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
              <h4 className="font-semibold mb-2">In your browser:</h4>
              <ol className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>1. Click the ZeeBlocker extension icon in your browser toolbar</li>
                <li>2. You'll see a prompt to enter your API key</li>
                <li>3. Paste your API key: <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs">{apiKey || 'zbk_...'}</code></li>
                <li>4. Click "Connect to Dashboard"</li>
                <li>5. Your browser will sync automatically! 🎉</li>
              </ol>
            </div>

            {apiKey && (
              <div className="flex gap-2">
                <Input
                  value={apiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyToClipboard} size="icon" variant="outline">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">✨ What happens after connecting:</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Your blocklists sync automatically from the dashboard</li>
                <li>• Block attempts are logged and visible in the dashboard</li>
                <li>• Settings update across all connected browsers</li>
                <li>• You can manage everything from the dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            If you're having trouble connecting:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 ml-2">
            <li>Make sure you copied the entire API key</li>
            <li>Check that the extension is properly installed</li>
            <li>Try refreshing the extension page</li>
            <li>Make sure you have available browser slots on your plan</li>
          </ul>
          <div className="pt-2">
            <Button asChild variant="outline" size="sm">
              <a href="mailto:support@zeeblocker.com">Contact Support</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

