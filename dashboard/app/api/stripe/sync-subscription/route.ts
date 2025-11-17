import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe/config'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '@/lib/config'

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
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Manual sync requested for user:', user.id)

    // Get user's Stripe customer ID
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_customer_id) {
      return NextResponse.json({ 
        error: 'No Stripe customer found. Please subscribe to a plan first.' 
      }, { status: 404 })
    }

    // Get the latest subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'all',
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      // No active subscription - reset to free
      await supabaseAdmin.from('users').update({
        subscription_status: 'free',
        subscription_plan: 'free',
        subscription_id: null,
        max_browsers: 1,
        max_profiles: 0,
      }).eq('id', user.id)

      return NextResponse.json({ 
        message: 'No active subscription found. Reset to free plan.',
        plan: 'free'
      })
    }

    const subscription = subscriptions.data[0]

    console.log('📦 Found subscription:', {
      id: subscription.id,
      status: subscription.status,
      items: subscription.items.data.map(item => item.price.id)
    })

    // Extract plan from price ID
    const priceId = subscription.items.data[0]?.price.id
    const planEntry = Object.entries(STRIPE_PLANS).find(
      ([key, plan]) => plan.priceId === priceId
    )

    if (!planEntry) {
      console.error('❌ Unknown price ID:', priceId)
      return NextResponse.json({ 
        error: 'Could not determine plan from Stripe subscription' 
      }, { status: 400 })
    }

    const [planId, plan] = planEntry

    interface SubscriptionSyncUpdate {
      subscription_status: string
      subscription_plan: string
      subscription_id: string
      max_browsers: number
      max_profiles: number
      trial_ends_at?: string
      subscription_ends_at?: string
    }

    // Update user with latest subscription data
    const updates: SubscriptionSyncUpdate = {
      subscription_status: subscription.status,
      subscription_plan: planId,
      subscription_id: subscription.id,
      max_browsers: plan.maxBrowsers,
      max_profiles: plan.maxProfiles,
    }

    if (subscription.trial_end) {
      updates.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString()
    }

    if (subscription.current_period_end) {
      updates.subscription_ends_at = new Date(subscription.current_period_end * 1000).toISOString()
    }

    console.log('✅ Updating user with:', updates)

    const { error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      console.error('❌ Database update error:', error)
      throw error
    }

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: 'Subscription Synced',
      message: `Your ${plan.name} plan has been synced successfully!`,
      type: 'success',
    })

    return NextResponse.json({ 
      message: 'Subscription synced successfully',
      plan: planId,
      status: subscription.status,
      maxBrowsers: plan.maxBrowsers,
      maxProfiles: plan.maxProfiles,
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}

