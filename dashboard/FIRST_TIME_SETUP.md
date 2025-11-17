# 🚀 First Time Setup - ZeeBlocker Dashboard

If you're seeing this guide, you need to configure your environment variables before the app can run.

## ⚡ Quick Setup (5 minutes)

### Step 1: Create Environment File

In the `dashboard` folder, create a `.env.local` file:

```bash
cd dashboard
cp .env.example .env.local
```

### Step 2: Add Minimum Required Variables

Open `.env.local` and add these **required** values:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Get Your Supabase Credentials

1. **Create a Supabase account:** https://supabase.com
2. **Create a new project** (takes ~2 minutes)
3. Go to **Settings** → **API**: https://supabase.com/dashboard/project/_/settings/api
4. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Set Up Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `dashboard/lib/supabase/schema.sql`
4. Paste and click **Run**

### Step 5: Restart the Server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

✅ **Done!** Your app should now work at http://localhost:3000

---

## 🎯 What Works Without Full Configuration

With just Supabase configured, you can:
- ✅ Run the app
- ✅ View the landing page
- ✅ Sign up / Sign in
- ✅ Access the dashboard
- ✅ Create profiles
- ✅ Manage blocklists
- ✅ View timeline

**Without Stripe configured:**
- ❌ Can't process payments (users will be on free plan)
- ✅ Everything else works

**Without Resend configured:**
- ❌ Can't send emails
- ✅ Everything else works

---

## 📚 Optional Services (Add Later)

### Stripe (For Payments)

Only needed if you want to charge users:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_FAMILY_PRICE_ID=price_xxx
STRIPE_ORG_PRICE_ID=price_xxx
```

**How to get:** https://dashboard.stripe.com/apikeys

### Resend (For Emails)

Only needed if you want to send email notifications:

```env
RESEND_API_KEY=re_your-key
EMAIL_FROM=ZeeBlocker <noreply@yourdomain.com>
```

**How to get:** https://resend.com/api-keys  
**For testing:** Use `onboarding@resend.dev` as the sender

---

## 🆘 Still Having Issues?

### Error: "Supabase is not configured"
- ✅ Make sure `.env.local` exists in the `dashboard` folder
- ✅ Check that all three Supabase keys are set
- ✅ Restart the dev server after adding keys

### Error: "Missing required environment variable"
- ✅ Copy `.env.example` to `.env.local`
- ✅ Don't use `.env` - it must be `.env.local`
- ✅ Make sure there are no typos in variable names

### Database Connection Errors
- ✅ Verify your Supabase project is active
- ✅ Check that you ran the schema.sql file
- ✅ Make sure you copied the correct keys

### App Won't Start
- ✅ Make sure you're in the `dashboard` folder
- ✅ Run `npm install` first
- ✅ Check Node.js version (needs 18+)

---

## 📖 Complete Documentation

Once you have the basics working, check out:

- **`SETUP_GUIDE.md`** - Complete setup with all services
- **`ENV_SETUP_GUIDE.md`** - Detailed environment variable guide
- **`QUICK_START.md`** - Developer quick start
- **`DEPLOYMENT_GUIDE.md`** - Deploy to production

---

## ✅ Checklist

- [ ] Created `.env.local` file
- [ ] Added Supabase URL and keys
- [ ] Created Supabase project
- [ ] Ran schema.sql in Supabase
- [ ] Restarted dev server
- [ ] App loads successfully
- [ ] Can sign up and log in

**When all boxes are checked, you're ready to develop!** 🎉

---

## 💡 Pro Tips

1. **Use test mode** for Stripe during development
2. **Use `onboarding@resend.dev`** as email sender for testing
3. **Check the browser console** for detailed error messages
4. **Look at terminal output** for configuration status

---

**Need more help?** Open an issue or check the full documentation in the repo.

