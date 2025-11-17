import { loadStripe, Stripe } from '@stripe/stripe-js'
import { STRIPE_CONFIG } from '@/lib/config'

let stripePromise: Promise<Stripe | null> | null = null

export const getStripe = () => {
  // Return null if Stripe is not configured
  if (!STRIPE_CONFIG.publishableKey) {
    console.warn('⚠️  Stripe not configured')
    return Promise.resolve(null)
  }

  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey)
  }
  return stripePromise
}

