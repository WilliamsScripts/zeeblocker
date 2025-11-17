import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendBlockAttemptEmail } from '@/lib/email'
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
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7)

    // Validate API key format
    if (!apiKey.startsWith('zbk_')) {
      return NextResponse.json(
        { error: 'Invalid API key format' },
        { status: 401 }
      )
    }

    // Validate and get API key from database
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('id, user_id, is_active')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single()

    if (keyError || !keyData) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      )
    }

    const { siteUrl, profileId } = await request.json()

    if (!siteUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get browser extension data
    const { data: browserData } = await supabaseAdmin
      .from('browser_extensions')
      .select('id')
      .eq('api_key_id', keyData.id)
      .single()

    // Log the block attempt
    const { data: blockAttempt, error: logError } = await supabaseAdmin
      .from('block_attempts')
      .insert({
        user_id: keyData.user_id,
        profile_id: profileId || null,
        extension_id: browserData?.id || null,
        site_url: siteUrl,
        blocked_at: new Date().toISOString(),
        notified: false,
      })
      .select()
      .single()

    if (logError) {
      throw logError
    }

    // Get user and profile data for notifications
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, subscription_plan')
      .eq('id', keyData.user_id)
      .single()

    let shouldNotify = false
    let notificationEmail = userData?.email
    let profileName = 'Unknown'

    if (profileId) {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('name, email, notify_on_block, profile_type')
        .eq('id', profileId)
        .single()

      if (profileData) {
        shouldNotify = profileData.notify_on_block
        notificationEmail = profileData.email || userData?.email
        profileName = profileData.name
      }
    }

    // Send notifications if enabled and on a paid plan
    if (shouldNotify && userData?.subscription_plan !== 'free' && notificationEmail) {
      try {
        await sendBlockAttemptEmail({
          parentEmail: notificationEmail,
          childName: profileName,
          siteUrl,
          blockedAt: new Date().toLocaleString(),
          profileId: profileId || '',
        })

        // Mark as notified
        await supabaseAdmin
          .from('block_attempts')
          .update({ notified: true })
          .eq('id', blockAttempt.id)

        // Create in-dashboard notification
        await supabaseAdmin.from('notifications').insert({
          user_id: keyData.user_id,
          profile_id: profileId || null,
          title: '🚨 Blocked Site Access Attempt',
          message: `${profileName} attempted to access ${siteUrl}`,
          type: 'warning',
          link: `/dashboard/timeline?profile=${profileId || ''}`,
        })
      } catch (emailError) {
        console.error('Failed to send notification:', emailError)
        // Don't fail the request if notification fails
      }
    }

    // Track analytics event
    await supabaseAdmin.from('analytics').insert({
      user_id: keyData.user_id,
      event_type: 'block_attempt',
      event_data: {
        site_url: siteUrl,
        profile_id: profileId,
        browser_id: browserData?.id,
      },
    })

    return NextResponse.json({
      success: true,
      blockId: blockAttempt.id,
    })
  } catch (error) {
    console.error('Block logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log block attempt' },
      { status: 500 }
    )
  }
}

