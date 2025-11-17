import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '@/lib/config'

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
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const apiKey = authHeader.substring(7) // Remove 'Bearer '
    
    // Validate API key format
    if (!apiKey.startsWith('zbk_')) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 401 })
    }

    // Get browser info from request
    const { browserType, browserVersion, platform } = await request.json()

    // Validate and get API key from database
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('id, user_id, is_active')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json({ 
        error: 'Invalid or inactive API key' 
      }, { status: 401 })
    }

    // Update last_used_at for API key
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id)

    // Find the browser_extensions entry for this API key
    const { data: browserData, error: browserError } = await supabaseAdmin
      .from('browser_extensions')
      .select('*')
      .eq('api_key_id', keyData.id)
      .single()

    if (browserError || !browserData) {
      return NextResponse.json({ 
        error: 'Browser entry not found. Please generate a new API key.' 
      }, { status: 404 })
    }

    // Update browser information and activate
    const { error: updateError } = await supabaseAdmin
      .from('browser_extensions')
      .update({
        browser_type: browserType || 'unknown',
        browser_version: browserVersion,
        platform: platform,
        last_sync_at: new Date().toISOString(),
        is_active: true,
      })
      .eq('id', browserData.id)

    if (updateError) {
      console.error('Browser update error:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update browser information' 
      }, { status: 500 })
    }

    // Create notification for user
    await supabaseAdmin.from('notifications').insert({
      user_id: keyData.user_id,
      title: '🎉 Browser Connected!',
      message: `Your ${browserType} browser has been successfully connected to ZeeBlocker.`,
      type: 'success',
      link: '/dashboard/browsers',
    })

    // Track analytics
    await supabaseAdmin.from('analytics').insert({
      user_id: keyData.user_id,
      event_type: 'browser_registered',
      event_data: {
        browser_id: browserData.id,
        browser_type: browserType,
        platform: platform,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Browser registered successfully',
      browserId: browserData.id,
      userId: keyData.user_id,
    })

  } catch (error) {
    console.error('Browser registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

