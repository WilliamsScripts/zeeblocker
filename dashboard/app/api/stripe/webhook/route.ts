import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG, STRIPE_CONFIG } from '@/lib/config'
import Stripe from 'stripe'

// Use service role key for admin operations
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

const webhookSecret = STRIPE_CONFIG.webhookSecret

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const error = err as Error
    console.error(`Webhook signature verification failed:`, error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🎉 Processing checkout completed:', {
    sessionId: session.id,
    metadata: session.metadata
  })

  const userId = session.metadata?.supabase_user_id
  const planId = session.metadata?.plan_id

  if (!userId || !planId) {
    console.error('❌ Missing metadata in checkout session:', { userId, planId })
    return
  }

  const plan = STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS]

  console.log('✅ Updating user:', userId, 'with plan:', planId)

  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'trialing',
      subscription_plan: planId,
      subscription_id: session.subscription as string,
      stripe_customer_id: session.customer as string,
      max_browsers: plan.maxBrowsers,
      max_profiles: plan.maxProfiles,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('❌ Database update error:', error)
  } else {
    console.log('✅ Successfully created subscription')
    
    // Create welcome notification
    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      title: 'Welcome to ' + plan.name + '!',
      message: `Your ${plan.name} subscription is now active. Enjoy your ${plan.maxBrowsers} browser connections!`,
      type: 'success',
    })
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('🔄 Processing subscription update:', {
    subscriptionId: subscription.id,
    status: subscription.status,
    metadata: subscription.metadata
  })

  // Get user ID from metadata or customer
  let userId = subscription.metadata?.supabase_user_id

  if (!userId && subscription.customer) {
    // Fetch customer to get user ID
    const customer = await stripe!.customers.retrieve(subscription.customer as string) as Stripe.Customer
    userId = customer.metadata?.supabase_user_id
  }

  if (!userId) {
    console.error('❌ No user ID found for subscription:', subscription.id)
    return
  }

  // Get plan from metadata or extract from price
  let planId = subscription.metadata?.plan_id
  
  if (!planId && subscription.items.data.length > 0) {
    const priceId = subscription.items.data[0].price.id
    // Find which plan this price belongs to
    planId = Object.entries(STRIPE_PLANS).find(
      ([key, plan]) => plan.priceId === priceId
    )?.[0]
  }

  if (!planId || planId === 'free') {
    console.error('❌ No valid plan ID found for subscription:', subscription.id)
    return
  }

  const plan = STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS]

  interface SubscriptionUpdate {
    subscription_status: string
    subscription_plan: string
    subscription_id: string
    max_browsers: number
    max_profiles: number
    trial_ends_at?: string
    subscription_ends_at?: string
  }

  const updates: SubscriptionUpdate = {
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

  console.log('✅ Updating user:', userId, 'with:', updates)

  const { error } = await supabaseAdmin.from('users').update(updates).eq('id', userId)

  if (error) {
    console.error('❌ Database update error:', error)
      } else {
        console.log('✅ Successfully updated user subscription')
        
        // Create success notification
        await supabaseAdmin.from('notifications').insert({
          user_id: userId,
          title: 'Subscription Updated',
          message: `Your ${plan.name} plan is now ${subscription.status}! Your browser extensions will sync automatically.`,
          type: 'success',
        })

        // Note: Browser extensions will automatically sync the new limits
        // on their next sync cycle (every 5 minutes) - no manual action needed
      }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id

  if (!userId) return

  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'canceled',
      subscription_plan: 'free',
      subscription_id: null,
      max_browsers: 1,
      max_profiles: 0,
    })
    .eq('id', userId)

  // Create notification
  await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    title: 'Subscription Cancelled',
    message:
      'Your subscription has been cancelled. You now have access to the free plan features.',
    type: 'info',
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  const userId = subscription.metadata?.supabase_user_id

  if (!userId) return

  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', userId)

  // Create notification
  await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    title: 'Payment Failed',
    message:
      'Your payment failed. Please update your payment method to continue using premium features.',
    type: 'error',
    link: '/dashboard/billing',
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  const userId = subscription.metadata?.supabase_user_id

  if (!userId) return

  await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'active',
    })
    .eq('id', userId)
}

