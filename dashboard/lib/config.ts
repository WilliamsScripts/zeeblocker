/**
 * Centralized Environment Configuration
 *
 * All environment variables are parsed and validated here.
 * Use these constants throughout the application instead of process.env directly.
 */

// Environment Detection (needs to be before other configs)
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET, // Optional for local dev
  priceIds: {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    family: process.env.STRIPE_FAMILY_PRICE_ID,
    org: process.env.STRIPE_ORG_PRICE_ID,
  },
} as const;

// Resend (Email) Configuration
export const EMAIL_CONFIG = {
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.EMAIL_FROM || "ZeeBlocker <noreply@zeeblocker.com>",
} as const;

// Application Configuration
export const APP_CONFIG = {
  url: process.env.NEXT_PUBLIC_APP_URL,
  adminEmail: process.env.ADMIN_EMAIL || "admin@zeeblocker.com",
} as const;

// Validate all required variables on module load (in production)
if (IS_PRODUCTION) {
  const missingVars: string[] = [];

  // Check each required variable
  if (!SUPABASE_CONFIG.url) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_CONFIG.anonKey)
    missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!SUPABASE_CONFIG.serviceRoleKey)
    missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!STRIPE_CONFIG.publishableKey)
    missingVars.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  if (!STRIPE_CONFIG.secretKey) missingVars.push("STRIPE_SECRET_KEY");
  if (!STRIPE_CONFIG.priceIds.pro) missingVars.push("STRIPE_PRO_PRICE_ID");
  if (!STRIPE_CONFIG.priceIds.family)
    missingVars.push("STRIPE_FAMILY_PRICE_ID");
  if (!STRIPE_CONFIG.priceIds.org) missingVars.push("STRIPE_ORG_PRICE_ID");
  if (!EMAIL_CONFIG.apiKey) missingVars.push("RESEND_API_KEY");
  if (!APP_CONFIG.url) missingVars.push("NEXT_PUBLIC_APP_URL");

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach((varName) => console.error(`   - ${varName}`));
    throw new Error(
      `Missing ${missingVars.length} required environment variable(s). Check the console for details.`
    );
  }
}

// Log configuration status in development
if (IS_DEVELOPMENT) {
  console.log("🔧 Environment Configuration:");
  console.log(
    `   Supabase: ${SUPABASE_CONFIG.url ? "✅ Connected" : "❌ Missing"}`
  );
  console.log(
    `   Stripe: ${STRIPE_CONFIG.publishableKey ? "✅ Connected" : "❌ Missing"}`
  );
  console.log(
    `   Email: ${
      EMAIL_CONFIG.apiKey
        ? "✅ Connected"
        : "❌ Missing (emails will be skipped)"
    }`
  );
  console.log(
    `   App URL: ${APP_CONFIG.url ? "✅ " + APP_CONFIG.url : "❌ Missing"}`
  );
  console.log("");
  console.log("💡 Tip: Copy env.example to .env.local and add your keys");
  console.log("📖 See ENV_SETUP_GUIDE.md for detailed setup instructions");
}

// Helper to check if service is configured
export const isConfigured = {
  supabase: !!SUPABASE_CONFIG.url && !!SUPABASE_CONFIG.anonKey,
  stripe: !!STRIPE_CONFIG.publishableKey && !!STRIPE_CONFIG.secretKey,
  email: !!EMAIL_CONFIG.apiKey,
} as const;
