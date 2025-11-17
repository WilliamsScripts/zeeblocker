# ZeeBlocker Dashboard Setup Guide

This guide will walk you through setting up the ZeeBlocker SaaS dashboard from scratch.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account
- A Stripe account
- A Resend account (for email)

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Create Environment File

Copy the example file:

```bash
cp .env.example .env.local
```

### 3. Configure Minimum Variables for Development

For development, you only need Supabase to get started:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **Note:** Without Stripe and Resend configured, the following features will be disabled:
- Payments and subscriptions (Stripe)
- Email notifications (Resend)

### 4. Start Development Server

```bash
npm run dev
```

The app will start at http://localhost:3000

## Full Production Setup

### Step 1: Supabase Setup (Required)

#### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Choose a name and strong password
4. Wait for project to be provisioned (~2 minutes)

#### 1.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `lib/supabase/schema.sql`
4. Paste and click **Run**

#### 1.3 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values to `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### Step 2: Stripe Setup (For Payments)

#### 2.1 Create Stripe Account

1. Go to https://stripe.com
2. Sign up for an account
3. Complete your account setup

#### 2.2 Enable Test Mode

1. In the Stripe Dashboard, toggle **Test Mode** ON (top right)
2. You'll use test keys for development

#### 2.3 Create Products & Prices

Create 3 subscription products:

**Product 1: Pro Plan**
- Name: "ZeeBlocker Pro"
- Price: $15/month
- Billing: Recurring monthly
- Copy the **Price ID** (starts with `price_`) → `STRIPE_PRO_PRICE_ID`

**Product 2: Family Plan**
- Name: "ZeeBlocker Family"
- Price: $25/month
- Billing: Recurring monthly
- Copy the **Price ID** → `STRIPE_FAMILY_PRICE_ID`

**Product 3: Organization Plan**
- Name: "ZeeBlocker Organization"
- Price: $30/month
- Billing: Recurring monthly
- Copy the **Price ID** → `STRIPE_ORG_PRICE_ID`

#### 2.4 Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy these values:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY` (⚠️ Keep this secret!)

#### 2.5 Setup Webhook (Required for subscriptions to work)

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - For local dev: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Step 3: Resend Setup (For Emails)

#### 3.1 Create Resend Account

1. Go to https://resend.com
2. Sign up for an account (free tier: 100 emails/day)

#### 3.2 Get API Key

1. Go to **API Keys**
2. Click **Create API Key**
3. Copy the key → `RESEND_API_KEY`

#### 3.3 Verify Domain (Production)

For production emails from your own domain:

1. Go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown
5. Wait for verification

For testing, use the default sender: `onboarding@resend.dev`

Set in `.env.local`:
```env
EMAIL_FROM=ZeeBlocker <onboarding@resend.dev>
```

## Environment Variables Reference

Here's the complete list of required environment variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (Required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_FAMILY_PRICE_ID=price_...
STRIPE_ORG_PRICE_ID=price_...

# Resend (Required for emails)
RESEND_API_KEY=re_...
EMAIL_FROM=ZeeBlocker <noreply@yourdomain.com>

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@yourdomain.com
```

## Testing Your Setup

### 1. Check Configuration Status

When you run `npm run dev`, you should see:

```
🔧 Environment Configuration:
   Supabase: ✅ Connected
   Stripe: ✅ Connected
   Email: ✅ Connected
   App URL: ✅ http://localhost:3000
```

### 2. Test Authentication

1. Go to http://localhost:3000/signup
2. Create a test account
3. Check Supabase Dashboard → **Authentication** → **Users**
4. You should see your new user

### 3. Test Stripe Integration

1. Log in to your dashboard
2. Go to the Pricing page
3. Click "Choose Plan" on Pro
4. Use Stripe test card: `4242 4242 4242 4242`
5. Any future date and CVC
6. Complete checkout

### 4. Test Email (if configured)

Emails will be sent when:
- A restricted site is accessed (block attempt)
- User signs up (welcome email)

Check your Resend dashboard for sent emails.

## Local Development with Stripe Webhooks

To test Stripe webhooks locally:

### 1. Install Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
# or
# Download from https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe

```bash
stripe login
```

### 3. Forward Webhooks

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook signing secret starting with `whsec_`.
Add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Test a Payment

In another terminal, trigger a test event:

```bash
stripe trigger checkout.session.completed
```

## Common Issues & Solutions

### Issue: "Missing API key" error

**Solution:** Make sure you've created `.env.local` (not `.env`) and added all required variables.

### Issue: Stripe checkout not working

**Solution:**
1. Check that `STRIPE_PRO_PRICE_ID` is set correctly
2. Verify webhook secret is configured
3. Make sure you're using test mode keys in development

### Issue: Emails not sending

**Solution:**
1. Verify `RESEND_API_KEY` is set
2. Check Resend dashboard for errors
3. For testing, use `onboarding@resend.dev` as sender

### Issue: Supabase connection errors

**Solution:**
1. Check that your Supabase project is active
2. Verify URL and keys are correct
3. Make sure you ran the schema.sql file

### Issue: "Service not configured" errors

**Solution:** This is normal in development if you haven't set up all services yet. The app will work without:
- Stripe (no payments)
- Resend (no emails)

But Supabase is always required.

## Production Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for production deployment instructions.

## Next Steps

1. ✅ Set up environment variables
2. ✅ Test authentication
3. ✅ Test payment flow
4. 📖 Read [QUICK_START.md](../QUICK_START.md) for feature overview
5. 🚀 Deploy to production (see DEPLOYMENT_GUIDE.md)

## Need Help?

- Check [ENV_SETUP_GUIDE.md](ENV_SETUP_GUIDE.md) for detailed environment setup
- See [TROUBLESHOOTING.md](../README.md#troubleshooting) in main README
- Open an issue on GitHub

## Development Tips

### View Database

Use Supabase Dashboard → **Table Editor** to view your data in real-time.

### View Logs

- **Supabase Logs:** Dashboard → **Logs**
- **Stripe Logs:** Dashboard → **Events**
- **Resend Logs:** Dashboard → **Logs**

### Reset Database

To reset your database:

```sql
-- Run in Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run schema.sql
```

⚠️ **Warning:** This deletes ALL data!

---

Happy coding! 🚀

