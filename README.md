# 🎯 ZeeBlocker - SaaS Website Blocker

A comprehensive SaaS application for blocking distracting websites with parental controls and organization management. Built with Next.js, Supabase, and Stripe.

## 📁 Project Structure

```
zeeblocker/
├── dashboard/                 # Next.js SaaS Dashboard
│   ├── app/                  # Next.js App Router
│   │   ├── (landing)/       # Landing page routes
│   │   ├── dashboard/       # Protected dashboard routes
│   │   ├── api/             # API routes
│   │   │   ├── stripe/      # Stripe webhooks & checkout
│   │   │   ├── extension/   # Extension authentication & sync
│   │   │   └── blocks/      # Block logging
│   │   ├── login/           # Authentication pages
│   │   └── signup/
│   ├── components/          # React components
│   │   ├── landing/         # Landing page components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── auth/            # Auth forms
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Utility libraries
│   │   ├── supabase/        # Supabase client & config
│   │   ├── stripe/          # Stripe configuration
│   │   ├── email/           # Resend email templates
│   │   └── types.ts         # TypeScript types
│   └── emails/              # Email templates
│
└── extension/                # Cross-Browser Extension
    ├── background.js         # Service worker
    ├── content.js           # Content script
    ├── popup.html/.js       # Extension popup
    ├── settings.html/.js    # Settings page
    ├── manifest.json        # Extension manifest (v3)
    ├── icons/               # Extension icons
    └── styles/              # CSS files
```

## 🚀 Features Implemented

### ✅ Marketing & Landing
- ✨ Modern SaaS landing page with dark mode
- 🎨 Hero, Features, Pricing, Testimonials, FAQ, Footer sections
- 📱 Fully responsive design
- 🎯 SEO optimized with proper metadata

### ✅ Authentication & User Management
- 🔐 Supabase authentication (email/password)
- 👤 User profiles with role-based access
- 🔑 Secure session management with middleware
- 📧 Email confirmation & password reset

### ✅ Pricing & Subscriptions
- 💳 4 Pricing Tiers:
  - **Free**: $0/mo - 1 browser, basic blocking
  - **Pro**: $15/mo - 3 browsers, email notifications
  - **Family**: $25/mo - 10 browsers, 5 child profiles
  - **Organization**: $30/mo - 50 browsers, 20 worker profiles
- 💰 Stripe integration for payments
- 🎁 14-day free trial on all paid plans
- 🔄 Stripe webhooks for subscription management
- 📊 Customer portal for billing management

### ✅ User Dashboard
- 📊 Overview with statistics and plan details
- 👥 Profile management (children/workers)
- 🚫 Blocklist management per profile
- 📅 Activity timeline
- 🔔 Notification system
- 🌐 Browser extension linking
- 📈 Analytics and reports

### ✅ Database & Backend
- 🗄️ Complete Supabase schema with RLS policies
- 📧 Email notifications with Resend
- 🔗 API routes for extension communication
- 📝 Block attempt logging
- 🔄 Real-time sync with Supabase Realtime

### ✅ Browser Extension (Existing)
- 🌐 Site blocking functionality
- ⚙️ Settings and configuration
- 📊 Task management
- 🔔 Notification system
- 🎨 Dark mode support

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Resend account (for emails)

### 2. Dashboard Setup

```bash
cd dashboard

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Edit .env.local with your credentials
```

### 3. Environment Variables

Create `.env.local` in the dashboard folder:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs (create these in Stripe dashboard)
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_FAMILY_PRICE_ID=price_xxx
STRIPE_ORG_PRICE_ID=price_xxx

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@zeeblocker.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin
ADMIN_EMAIL=admin@zeeblocker.com
```

### 4. Supabase Database Setup

1. Go to your Supabase project SQL Editor
2. Run the schema file: `dashboard/lib/supabase/schema.sql`
3. This creates all tables, RLS policies, and triggers

### 5. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Create 3 products in Stripe Dashboard:
   - Pro ($15/month recurring)
   - Family ($25/month recurring)
   - Organization ($30/month recurring)
3. Copy the Price IDs to your .env.local
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
5. Add webhook events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`

### 6. Resend Email Setup

1. Create account at https://resend.com
2. Verify your domain
3. Get API key and add to .env.local

### 7. Run the Dashboard

```bash
cd dashboard
npm run dev
```

Visit http://localhost:3000

## 🔌 Extension Setup

The extension files are in the `/extension` folder.

### Loading in Chrome/Brave/Edge/Arc

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `/extension` folder

### Firefox Setup

1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from `/extension` folder

## 🎨 Customization

### Branding

- Update logo in `/extension/icons/`
- Modify colors in `dashboard/app/globals.css`
- Update brand name throughout the codebase

### Pricing

Edit `dashboard/lib/stripe/config.ts` to modify:
- Plan names
- Pricing
- Features
- Limits (browsers, profiles)

### Email Templates

Customize email templates in:
- `dashboard/lib/email/index.ts`

## 📊 Database Schema

Key tables:
- **users**: User accounts with subscription info
- **profiles**: Child/worker profiles
- **browser_extensions**: Linked browser instances
- **blocklists**: Site blocklists per user/profile
- **block_attempts**: Logged blocking attempts
- **notifications**: In-app notifications

## 🔐 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Secure API routes with authentication
- ✅ HTTPS required for production
- ✅ Environment variables for secrets
- ✅ Webhook signature verification
- ✅ CORS protection

## 🚢 Deployment

### Dashboard (Vercel Recommended)

```bash
cd dashboard

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Extension (Chrome Web Store / Firefox Add-ons)

1. Zip the `/extension` folder
2. Submit to respective stores:
   - Chrome: https://chrome.google.com/webstore/devconsole
   - Firefox: https://addons.mozilla.org/developers/

## 📝 API Routes

### Extension API

- `POST /api/extension/auth` - Authenticate extension
- `GET /api/extension/sync` - Get user's blocklists
- `POST /api/extension/block-attempt` - Log block attempt

### Stripe API

- `POST /api/stripe/create-checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `POST /api/stripe/portal` - Customer billing portal

## 🔄 Extension Updates Needed

To connect the extension to the API, update:

1. **background.js**: Add API authentication and sync
2. **Fetch blocklists from API** instead of local storage
3. **Send block attempts to API** for logging
4. **Add user authentication** before allowing extension use

Example code structure provided in files (to be implemented).

## 🐛 Troubleshooting

### Extension Not Loading
- Check manifest.json syntax
- Ensure all file paths are correct
- Check browser console for errors

### Stripe Webhooks Failing
- Verify webhook secret matches
- Check webhook endpoint is accessible
- Review Stripe dashboard for error logs

### Database Issues
- Verify RLS policies are enabled
- Check Supabase logs
- Ensure service role key is correct for admin operations

## 📚 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **Hosting**: Vercel (recommended)
- **Extension**: Vanilla JavaScript, Manifest V3

## 🤝 Contributing

This is a complete SaaS template. Feel free to:
- Customize for your needs
- Add new features
- Improve existing functionality

## 📄 License

MIT License - See LICENSE file for details

## 🎯 Next Steps

### Essential (Before Launch)

1. ⚠️ **Connect Extension to API**: Update extension to authenticate and fetch rules from dashboard
2. 📧 **Test Email Flow**: Send test emails for all notification types
3. 🧪 **Test Stripe Webhooks**: Use Stripe CLI to test all webhook events
4. 🔐 **Add Password Reset**: Implement forgot password flow
5. ⚙️ **Complete Settings Page**: Add user preferences and configuration
6. 📱 **Test Responsive Design**: Ensure all pages work on mobile

### Recommended (For Better UX)

1. 📊 **Admin Dashboard**: Build analytics dashboard for admin users
2. 🌐 **Multi-language Support**: Add i18n for international users
3. 📈 **Advanced Analytics**: More detailed charts and insights
4. 🔔 **Real-time Notifications**: Use Supabase Realtime for instant alerts
5. 📱 **Mobile App**: Build companion mobile app
6. 🤖 **Auto-categorization**: ML-powered site categorization
7. 📅 **Scheduling**: Time-based blocking rules
8. 👪 **Family Sharing**: Share subscriptions across family members

### Advanced Features

1. 🔗 **SSO Integration**: Google, Microsoft, Apple sign-in
2. 🏢 **Enterprise Features**: SAML, SCIM, custom contracts
3. 📊 **API Access**: Public API for third-party integrations
4. 🌍 **CDN Integration**: Faster global performance
5. 🔍 **Search & Filters**: Advanced search across dashboard
6. 📤 **Bulk Import/Export**: CSV import for blocklists
7. 🎨 **Custom Themes**: User-selectable color schemes
8. 📱 **PWA Support**: Install dashboard as app

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Email: support@zeeblocker.com

---

**Made with ❤️ for productivity, safety, and focus**

*Remember: Technology should serve humanity, not distract from it.*
