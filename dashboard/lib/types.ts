export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin'
  stripe_customer_id: string | null
  subscription_status: 'free' | 'trialing' | 'active' | 'canceled' | 'past_due' | 'unpaid'
  subscription_plan: 'free' | 'pro' | 'family' | 'org'
  subscription_id: string | null
  max_browsers: number
  max_profiles: number
  trial_ends_at: string | null
  subscription_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  name: string
  email: string | null
  profile_type: 'child' | 'worker'
  notify_on_block: boolean
  created_at: string
  updated_at: string
}

export interface APIKey {
  id: string
  user_id: string
  api_key: string
  name: string | null
  is_active: boolean
  last_used_at: string | null
  created_at: string
}

export interface BrowserExtension {
  id: string
  user_id: string
  profile_id: string | null
  api_key_id: string
  browser_type: 'chrome' | 'firefox' | 'brave' | 'arc' | 'edge' | 'unknown'
  browser_version: string | null
  platform: string | null
  last_sync_at: string | null
  is_active: boolean
  created_at: string
}

export interface Blocklist {
  id: string
  user_id: string
  profile_id: string | null
  site_url: string
  category: 'distraction' | 'adult' | 'custom'
  is_active: boolean
  created_at: string
}

export interface BlockAttempt {
  id: string
  user_id: string
  profile_id: string | null
  extension_id: string | null
  site_url: string
  blocked_at: string
  notified: boolean
}

export interface Notification {
  id: string
  user_id: string
  profile_id: string | null
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  link: string | null
  created_at: string
}

export interface DashboardStats {
  totalBlocks: number
  blocksToday: number
  blocksThisWeek: number
  activeProfiles: number
  linkedBrowsers: number
  unreadNotifications: number
}

