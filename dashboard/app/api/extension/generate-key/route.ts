import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '@/lib/config'
import { randomBytes } from 'crypto'

const supabaseAdmin = createAdminClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data with subscription info
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check how many browsers are already connected
    const { count, error: countError } = await supabaseAdmin
      .from('browser_extensions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (countError) {
      console.error('Browser count error:', countError)
      return NextResponse.json({ error: 'Failed to check browser count' }, { status: 500 })
    }

    // Check if user has reached their browser limit
    if (count && count >= userData.max_browsers) {
      return NextResponse.json({ 
        error: `Browser limit reached. Your ${userData.subscription_plan} plan allows ${userData.max_browsers} browser(s). Upgrade your plan to connect more browsers.` 
      }, { status: 403 })
    }

    // Deactivate all existing API keys for this user
    const { error: deactivateError } = await supabaseAdmin
      .from('api_keys')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (deactivateError) {
      console.error('Error deactivating old keys:', deactivateError)
      // Continue anyway - not critical
    }

    // Deactivate all existing browsers for this user
    await supabaseAdmin
      .from('browser_extensions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)

    // Generate a unique API key
    const apiKey = `zbk_${randomBytes(32).toString('hex')}`

    // Store API key in database
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id: user.id,
        api_key: apiKey,
        name: `Browser Extension ${(count || 0) + 1}`,
        is_active: true,
      })
      .select()
      .single()

    if (keyError) {
      console.error('API key storage error:', keyError)
      return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 })
    }

    // Create initial browser_extensions entry
    const { data: browserData, error: browserError } = await supabaseAdmin
      .from('browser_extensions')
      .insert({
        user_id: user.id,
        api_key_id: keyData.id,
        browser_type: 'unknown',
        is_active: false, // Will be activated on first registration
      })
      .select()
      .single()

    if (browserError) {
      console.error('Browser creation error:', browserError)
      // Rollback API key if browser creation fails
      await supabaseAdmin.from('api_keys').delete().eq('id', keyData.id)
      return NextResponse.json({ error: 'Failed to create browser entry' }, { status: 500 })
    }

    // Track analytics
    await supabaseAdmin.from('analytics').insert({
      user_id: user.id,
      event_type: 'api_key_generated',
      event_data: {
        api_key_id: keyData.id,
        browser_id: browserData.id,
        plan: userData.subscription_plan,
      },
    })

    return NextResponse.json({ 
      apiKey,
      browserId: browserData.id,
      maxBrowsers: userData.max_browsers,
      currentBrowsers: count || 0,
      plan: userData.subscription_plan
    })

  } catch (error) {
    console.error('API key generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

