'use client'

import { useEffect } from 'react'
import { Shield, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  const isSupabaseError = error.message.includes('Supabase')
  const isStripeError = error.message.includes('Stripe')
  const isConfigError = isSupabaseError || isStripeError

  if (isConfigError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <CardTitle className="text-2xl">ZeeBlocker Setup Required</CardTitle>
            </div>
            <CardDescription>
              Your application needs to be configured before it can run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                    Configuration Missing
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    {isSupabaseError && 'Supabase environment variables are not configured.'}
                    {isStripeError && 'Stripe environment variables are not configured.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Quick Setup Steps:</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Create environment file</p>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1 inline-block">
                      cp .env.example .env.local
                    </code>
                  </div>
                </div>

                {isSupabaseError && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Get Supabase credentials</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create a project at Supabase and copy your URL and anon key
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <a
                          href="https://supabase.com/dashboard/project/_/settings/api"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Supabase Dashboard
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {isStripeError && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                      {isSupabaseError ? '3' : '2'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Get Stripe credentials</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create a Stripe account and copy your publishable and secret keys
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <a
                          href="https://dashboard.stripe.com/apikeys"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Stripe Dashboard
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                    {isSupabaseError && isStripeError ? '4' : isSupabaseError || isStripeError ? '3' : '2'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Add credentials to .env.local</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Open the file and paste your keys
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
                    {isSupabaseError && isStripeError ? '5' : isSupabaseError || isStripeError ? '4' : '3'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Restart the development server</p>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1 inline-block">
                      npm run dev
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">📖 Need detailed help?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Check out our comprehensive setup guide for step-by-step instructions:
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/SETUP_GUIDE.md">Setup Guide</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/ENV_SETUP_GUIDE.md">Environment Guide</Link>
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                💡 <strong>Tip:</strong> After adding your environment variables, the app will
                automatically detect them and this page won't appear again.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} className="flex-1">
                Check Configuration
              </Button>
              <Button variant="outline" onClick={reset}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Generic error handling
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
            Something went wrong
          </CardTitle>
          <CardDescription>An unexpected error occurred</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {error.message || 'An unknown error occurred'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Try again
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

