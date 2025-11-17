import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Shield, LayoutDashboard, Users, BarChart3, FileText } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!userData?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <nav className="sticky top-0 z-50 bg-red-600 text-white border-b border-red-700 h-16">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-8 h-8" />
            <span className="text-xl font-bold">ZeeBlocker Admin</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm hover:underline bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard →
          </Link>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Overview</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Users</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Analytics</span>
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Reports</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

