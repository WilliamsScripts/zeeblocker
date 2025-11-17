# Family & Organization Profiles - Complete Guide

## 🎯 Overview

ZeeBlocker supports **multi-profile management** for Family and Organization plans, allowing you to manage blocklists for multiple people from a single account.

---

## 📋 Key Concepts

### 1. One API Key Per Browser (Not Per Profile)

**Important**: Each browser gets **ONE API key**, not one per profile.

```
❌ WRONG: Generate separate API key for each child
✅ CORRECT: One API key per browser, syncs all profiles
```

### 2. Profile Types

| Profile Type | Available On | Use Case |
|-------------|--------------|----------|
| **Personal** | All plans | Your own blocklist |
| **Child** | Family plan | Monitor children's browsing |
| **Worker** | Organization plan | Monitor employee browsing |

---

## 🏠 How Family Profiles Work

### Use Case: Parent with 2 Children

**Setup**:
1. Parent subscribes to **Family Plan** ($25/mo)
2. Parent creates profiles for Emma and Jack
3. Parent configures different blocklists for each child
4. Parent installs extension on each child's computer
5. Parent uses **ONE API key** per browser

**Example Structure**:

```
Parent Account (Family Plan)
│
├─ Browser 1: Emma's Laptop
│  └─ API Key: zbk_abc123
│     ├─ Personal Blocklist (parent's rules)
│     ├─ Emma's Profile Blocklist
│     └─ Jack's Profile Blocklist (also synced)
│
├─ Browser 2: Jack's Desktop
│  └─ API Key: zbk_def456
│     ├─ Personal Blocklist
│     ├─ Emma's Profile Blocklist (also synced)
│     └─ Jack's Profile Blocklist
│
└─ Browser 3: Parent's Computer
   └─ API Key: zbk_ghi789
      ├─ Personal Blocklist only
      ├─ Emma's Profile (monitored)
      └─ Jack's Profile (monitored)
```

### How Blocking Works

**Scenario**: Emma tries to access TikTok

1. Extension checks **all blocklists** synced to that browser
2. Finds TikTok in **Emma's Profile blocklist**
3. Blocks the site
4. Logs the attempt with `profile_id = emma-uuid`
5. Sends notification to parent (if enabled)

```json
{
  "user_id": "parent-uuid",
  "profile_id": "emma-uuid",
  "site_url": "tiktok.com",
  "extension_id": "browser-uuid",
  "blocked_at": "2025-11-17T10:30:00Z",
  "notified": true
}
```

---

## 🏢 How Organization Profiles Work

### Use Case: Company with 5 Employees

**Setup**:
1. Manager subscribes to **Organization Plan** ($30/mo)
2. Manager creates profiles for each employee
3. Manager sets company-wide blocklists
4. Manager monitors which employees accessed blocked sites

**Example Structure**:

```
Company Account (Org Plan)
│
├─ Browser 1: John's Work Laptop
│  └─ API Key: zbk_xyz123
│     ├─ Company Blocklist (applies to all)
│     └─ John's Profile (individual rules)
│
├─ Browser 2: Sarah's Work Laptop
│  └─ API Key: zbk_uvw456
│     ├─ Company Blocklist
│     └─ Sarah's Profile
│
└─ Browser 3: Manager's Computer
   └─ API Key: zbk_rst789
      ├─ Company Blocklist
      └─ All Employee Profiles (for monitoring)
```

### Organization Features

- **Detect Extension Disable**: Get alerts when employees disable the extension
- **Detailed Reports**: See which employees accessed what sites
- **Custom Policies**: Different rules for different departments

---

## 🔄 How Sync Works

### Browser Sync Response

When a browser syncs, it receives **all profiles and blocklists**:

```json
{
  "user": {
    "id": "user-uuid",
    "subscription_plan": "family",
    "subscription_status": "active"
  },
  "blocklists": {
    "personal": [
      "facebook.com",
      "twitter.com"
    ],
    "emma-profile-uuid": [
      "tiktok.com",
      "instagram.com",
      "snapchat.com"
    ],
    "jack-profile-uuid": [
      "youtube.com",
      "reddit.com",
      "gaming-site.com"
    ]
  },
  "profiles": [
    {
      "id": "emma-profile-uuid",
      "name": "Emma",
      "profile_type": "child",
      "notify_on_block": true
    },
    {
      "id": "jack-profile-uuid",
      "name": "Jack",
      "profile_type": "child",
      "notify_on_block": true
    }
  ]
}
```

### Extension Behavior

The extension can:

1. **Block across all profiles**: Check if site is in ANY blocklist
2. **Profile-specific blocking**: Only block for specific profile
3. **Switch profiles**: User selects which profile they're using
4. **Monitor mode**: Track which profile accessed which site

---

## 📊 Dashboard Views

### Parent/Manager Dashboard

```
/dashboard/profiles
├─ Emma's Profile
│  ├─ View blocked sites
│  ├─ Edit blocklist
│  ├─ View activity timeline
│  └─ Email notification settings
│
└─ Jack's Profile
   ├─ View blocked sites
   ├─ Edit blocklist
   ├─ View activity timeline
   └─ Email notification settings
```

### Timeline View

```
/dashboard/timeline?profile=emma-uuid

Recent Activity for Emma:
• 10:30 AM - Attempted to access tiktok.com (BLOCKED)
• 10:25 AM - Attempted to access instagram.com (BLOCKED)
• 10:20 AM - Attempted to access snapchat.com (BLOCKED)
```

---

## 🔐 Security & Privacy

### Who Can See What

**Parent/Manager** (Account Owner):
- ✅ View all profiles
- ✅ View all block attempts
- ✅ Receive notifications for all profiles
- ✅ Edit any blocklist
- ✅ Manage all API keys

**Child/Worker** (Profile Subject):
- ❌ Cannot access dashboard
- ❌ Cannot see their profile
- ❌ Cannot modify blocklists
- ⚠️ Can disable extension (but parent gets notified on Org plan)

### Notifications

When Emma accesses a blocked site:

**Email to Parent** (if enabled):
```
Subject: 🚨 Emma accessed a blocked site

Emma attempted to access tiktok.com at 10:30 AM on Browser 1 (Emma's Laptop).

View full timeline: https://zeeblocker.com/dashboard/timeline?profile=emma-uuid
```

**Dashboard Notification**:
```
🚨 Blocked Site Access Attempt
Emma attempted to access tiktok.com
2 minutes ago
```

---

## 💡 Common Scenarios

### Scenario 1: Different Rules for Each Child

**Goal**: Emma (age 13) and Jack (age 16) have different restrictions.

**Solution**:
1. Create two profiles: Emma and Jack
2. Add age-appropriate blocklists to each profile
3. Install extension on both computers with same API key
4. Extensions sync both profiles but apply relevant rules

### Scenario 2: Temporary Access

**Goal**: Allow Emma to access YouTube for homework, but only today.

**Solution**:
1. Go to Emma's profile blocklist
2. Remove youtube.com temporarily
3. Extension syncs automatically (within 5 minutes)
4. Add it back after homework is done

### Scenario 3: One Child, Multiple Devices

**Goal**: Emma has laptop, tablet, and desktop - all need blocking.

**Solution**:
1. Create one Emma profile
2. Install extension on all 3 devices
3. Generate API key for each device (up to plan limit)
4. All devices sync Emma's blocklist
5. See combined activity from all devices

### Scenario 4: Department-Specific Rules

**Goal**: Sales team can access LinkedIn, but Support team cannot.

**Solution**:
1. Create profiles: Sales Team, Support Team
2. Add LinkedIn to Support Team blocklist only
3. Install extension on respective computers
4. Monitor which team accessed what

---

## 🚀 Auto-Sync on Plan Changes

### When You Upgrade Plan

**Before** (Free Plan):
- 1 browser allowed
- 0 profiles allowed

**After Upgrading to Family**:
- ✅ Browser limit automatically updated to 10
- ✅ Profile limit automatically updated to 5
- ✅ Extensions sync new limits **automatically** (within 5 minutes)
- ✅ No manual "Sync" button needed
- ✅ Notification sent to confirm upgrade

### Behind the Scenes

1. Stripe sends webhook: `subscription.updated`
2. Dashboard updates database:
   ```sql
   UPDATE users SET
     max_browsers = 10,
     max_profiles = 5,
     subscription_plan = 'family'
   WHERE id = 'user-uuid'
   ```
3. Extensions sync on next cycle (every 5 minutes)
4. Extensions see new limits and features

**No manual action required!**

---

## ❓ FAQ

### Q: Do I need separate API keys for each child?
**A**: No! One API key per **browser**, not per child. The browser syncs all profiles.

### Q: Can my child see the dashboard?
**A**: No. Only the account owner can access the dashboard.

### Q: What if my child uninstalls the extension?
**A**: On Organization plan, you'll get an alert. On Family plan, consider device management policies.

### Q: Can I block different sites on different devices?
**A**: No. Blocklists are tied to profiles, not devices. All devices with same profile get same rules.

### Q: How quickly do blocklist changes sync?
**A**: Extensions sync every 5 minutes automatically. You can also manually trigger sync in extension settings.

### Q: Can I see which device my child used?
**A**: Yes! Each block attempt shows which browser it came from in the timeline.

### Q: What happens when I upgrade from Free to Family?
**A**: Your browser limits update automatically within 5 minutes. No manual sync needed!

### Q: Can profiles have their own API keys?
**A**: No. API keys are for browsers, not profiles. One key syncs all profiles.

---

## 🎯 Best Practices

### For Parents

1. **Create profiles for each child** with their name
2. **Enable email notifications** for important alerts
3. **Review timeline weekly** to see patterns
4. **Use age-appropriate blocklists**
5. **Install on all devices** (up to your plan limit)
6. **Keep API keys secure** - treat like passwords

### For Organizations

1. **Create profiles per employee** or per department
2. **Set company-wide blocklists** on your personal list
3. **Add department-specific rules** on worker profiles
4. **Enable disable-detection alerts** (coming soon)
5. **Review analytics monthly** for productivity insights
6. **Document your policies** so employees know what's blocked

### For Extension Setup

1. **Generate ONE API key per browser**
2. **Label API keys** clearly (e.g., "Emma's Laptop")
3. **Test blocking** after installation
4. **Verify sync** in extension settings
5. **Pin extension** to toolbar so it's visible

---

## 📈 Plan Comparison

| Feature | Free | Pro | Family | Organization |
|---------|------|-----|--------|--------------|
| Browsers | 1 | 3 | 10 | 50 |
| Profiles | 0 | 0 | 5 children | 20 workers |
| Profile Types | - | - | Child | Worker |
| Notifications | Dashboard | Email + Dashboard | Email + Dashboard | Email + Dashboard |
| Disable Detection | No | No | No | Yes |
| Analytics | Basic | Advanced | Advanced | Advanced |

---

## 🔧 Technical Details

### Database Structure

```sql
-- One API key per browser
api_keys (id, user_id, api_key, is_active)

-- One browser extension per API key
browser_extensions (id, user_id, api_key_id, browser_type)

-- Multiple profiles per user
profiles (id, user_id, name, profile_type)

-- Blocklists can be personal or profile-specific
blocklists (id, user_id, profile_id, site_url)

-- Block attempts track which profile
block_attempts (id, user_id, profile_id, extension_id, site_url)
```

### API Flow

```
1. Browser syncs with API key
   GET /api/extension/sync
   Authorization: Bearer zbk_abc123

2. Receives all profiles + blocklists
   {
     blocklists: { personal: [...], profile1: [...] },
     profiles: [...]
   }

3. Browser blocks site
   POST /api/blocks/log
   { siteUrl: "tiktok.com", profileId: "emma-uuid" }

4. Dashboard shows timeline
   SELECT * FROM block_attempts 
   WHERE profile_id = 'emma-uuid'
```

---

## ✅ Summary

- ✅ **One API key per browser**, not per profile
- ✅ Browsers sync **all profiles** automatically
- ✅ Block attempts tracked **per profile**
- ✅ Notifications sent **to account owner**
- ✅ Timeline shows **which profile** accessed what
- ✅ Plan upgrades sync **automatically** (no manual button)
- ✅ Works for **families** and **organizations**

Now you know exactly how profiles work! 🎉

