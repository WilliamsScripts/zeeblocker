import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, APP_CONFIG } from '@/lib/config'

// Use service role for extension authentication
const supabaseAdmin = createClient(
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
    const { email, password, extensionId, browserType } = await request.json()

    if (!email || !password || !extensionId || !browserType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Authenticate user
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const userId = authData.user.id

    // Check if extension is already registered
    const { data: existingExtension } = await supabaseAdmin
      .from('browser_extensions')
      .select('*')
      .eq('extension_id', extensionId)
      .single()

    if (existingExtension) {
      // Update existing extension
      await supabaseAdmin
        .from('browser_extensions')
        .update({
          user_id: userId,
          last_sync_at: new Date().toISOString(),
          is_active: true,
        })
        .eq('extension_id', extensionId)
    } else {
      // Check browser limit
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('max_browsers')
        .eq('id', userId)
        .single()

      const { data: userBrowsers } = await supabaseAdmin
        .from('browser_extensions')
        .select('id')
        .eq('user_id', userId)

      if (userBrowsers && userData && userBrowsers.length >= userData.max_browsers) {
        return NextResponse.json(
          { error: 'Browser limit reached for your plan' },
          { status: 403 }
        )
      }

      // Register new extension
      await supabaseAdmin.from('browser_extensions').insert({
        user_id: userId,
        extension_id: extensionId,
        browser_type: browserType,
        last_sync_at: new Date().toISOString(),
        is_active: true,
      })
    }

    // Return auth token and user data
    return NextResponse.json({
      success: true,
      userId,
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    })
  } catch (error) {
    console.error('Extension auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

