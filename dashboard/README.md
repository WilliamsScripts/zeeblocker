# ZeeBlocker Dashboard

The Next.js SaaS application for ZeeBlocker.

## 🚀 First Time Setup

**Before you can run the app, you need to configure environment variables.**

### Quick Start (3 steps):

1. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add Supabase credentials to `.env.local`:**
   - Create a Supabase project: https://supabase.com
   - Get your URL and keys: https://supabase.com/dashboard/project/_/settings/api
   - Add them to `.env.local`

3. **Run the database schema:**
   - Open Supabase SQL Editor
   - Run the contents of `lib/supabase/schema.sql`

### Start Development Server

```bash
npm install
npm run dev
```

Visit http://localhost:3000

---

## 📖 Documentation

- **`FIRST_TIME_SETUP.md`** - 👈 **Start here!** Detailed first-time setup
- **`SETUP_GUIDE.md`** - Complete setup with all services (Stripe, Resend)
- **`ENV_SETUP_GUIDE.md`** - Environment variables reference
- **`../QUICK_START.md`** - Developer quick start guide
- **`../DEPLOYMENT_GUIDE.md`** - Deploy to production

---

## ⚠️ Common Issues

### "Supabase is not configured" error

**Solution:** Create `.env.local` and add Supabase credentials. See `FIRST_TIME_SETUP.md`.

### "Missing API key" errors

**Solution:** Some services are optional:
- **Supabase** - Required (app won't run without it)
- **Stripe** - Optional (needed for payments)
- **Resend** - Optional (needed for emails)

Add only what you need to `.env.local`.

---

## 🎯 What You Need

### Minimum (Required)
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Full (All Features)
Add Stripe and Resend keys for payments and emails. See `.env.example` for the complete list.

---

## 🆘 Need Help?

1. Read `FIRST_TIME_SETUP.md` for step-by-step instructions
2. Check the browser console for detailed errors
3. Look at the terminal output for configuration status
4. See the main project README in the parent folder

---

## 📁 Project Structure

```
dashboard/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Landing page
│   ├── dashboard/      # User dashboard
│   ├── admin/          # Admin dashboard
│   └── api/            # API routes
├── components/         # React components
├── lib/                # Utilities
│   ├── config.ts       # Environment config
│   ├── supabase/       # Database
│   ├── stripe/         # Payments
│   └── email/          # Emails
└── .env.local          # Your environment variables (create this!)
```

---

**Ready to build something awesome? Let's go! 🚀**
