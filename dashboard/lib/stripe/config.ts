import Stripe from 'stripe'
import { STRIPE_CONFIG } from '@/lib/config'

// Initialize Stripe only if secret key is available
export const stripe = STRIPE_CONFIG.secretKey
  ? new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  : null

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    maxBrowsers: 1,
    maxProfiles: 0,
    features: [
      '1 linked browser',
      'Basic site blocking',
      'Browser notifications only',
      'Community support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 15,
    priceId: STRIPE_CONFIG.priceIds.pro,
    maxBrowsers: 3,
    maxProfiles: 0,
    features: [
      '3 linked browsers',
      'Advanced site blocking',
      'Email notifications',
      'Focus mode analytics',
      'Priority support',
    ],
  },
  family: {
    name: 'Family',
    price: 25,
    priceId: STRIPE_CONFIG.priceIds.family,
    maxBrowsers: 10,
    maxProfiles: 5,
    features: [
      '10 linked browsers',
      'Up to 5 child profiles',
      'Parental controls',
      'Email & dashboard notifications',
      'Detailed activity reports',
      'Priority support',
    ],
  },
  org: {
    name: 'Organization',
    price: 30,
    priceId: STRIPE_CONFIG.priceIds.org,
    maxBrowsers: 50,
    maxProfiles: 20,
    features: [
      '50 linked browsers',
      'Up to 20 worker profiles',
      'Organization policies',
      'Email & dashboard notifications',
      'Advanced analytics',
      'Disable detection alerts',
      'Priority support',
      'Dedicated account manager',
    ],
  },
} as const

export type PlanType = keyof typeof STRIPE_PLANS

