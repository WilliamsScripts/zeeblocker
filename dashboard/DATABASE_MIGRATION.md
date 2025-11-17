# Database Migration Guide

## Overview

This guide will help you migrate your ZeeBlocker database to the new schema that includes proper API key management and improved browser extension tracking.

## What's New

### 1. **API Keys Table** (NEW)
- Centralized API key storage for extension authentication
- Tracks when keys were last used
- Supports key activation/deactivation
- Links to browser extensions via foreign key

### 2. **Updated Browser Extensions Table**
- Removed `extension_id` field (no longer needed)
- Added `api_key_id` foreign key to link with API keys
- Added `platform` field for OS tracking
- Changed `browser_type` to allow 'unknown' during initial setup

### 3. **Updated Block Attempts Table**
- `extension_id` now references `browser_extensions.id` (UUID) instead of text

## Migration Steps

### Step 1: Backup Your Data

```sql
-- Create backup tables
CREATE TABLE users_backup AS SELECT * FROM public.users;
CREATE TABLE profiles_backup AS SELECT * FROM public.profiles;
CREATE TABLE browser_extensions_backup AS SELECT * FROM public.browser_extensions;
CREATE TABLE blocklists_backup AS SELECT * FROM public.blocklists;
CREATE TABLE block_attempts_backup AS SELECT * FROM public.block_attempts;
CREATE TABLE notifications_backup AS SELECT * FROM public.notifications;
```

### Step 2: Drop Existing Tables (if starting fresh)

**⚠️ WARNING: This will delete all data. Only do this if you're starting fresh or have backups!**

```sql
DROP TABLE IF EXISTS public.block_attempts CASCADE;
DROP TABLE IF EXISTS public.browser_extensions CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
```

### Step 3: Create New Tables

Run the updated schema from `/Users/williams/Private/chrome-extension/zeeblocker/dashboard/lib/supabase/schema.sql`

Or use these individual commands:

```sql
-- API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(api_key) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);

-- Browser extensions table (updated)
CREATE TABLE IF NOT EXISTS public.browser_extensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  browser_type TEXT DEFAULT 'unknown' CHECK (browser_type IN ('chrome', 'firefox', 'brave', 'arc', 'edge', 'unknown')),
  browser_version TEXT,
  platform TEXT,
  last_sync_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_browser_extensions_user ON public.browser_extensions(user_id);
CREATE INDEX IF NOT EXISTS idx_browser_extensions_api_key ON public.browser_extensions(api_key_id);

-- Block attempts table (updated)
CREATE TABLE IF NOT EXISTS public.block_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  extension_id UUID REFERENCES public.browser_extensions(id) ON DELETE SET NULL,
  site_url TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_block_attempts_user ON public.block_attempts(user_id, blocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_block_attempts_profile ON public.block_attempts(profile_id, blocked_at DESC);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- API Keys policies
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own API keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own API keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own API keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);
```

### Step 4: Verify Migration

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('api_keys', 'browser_extensions', 'block_attempts');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('api_keys', 'browser_extensions', 'block_attempts');

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'api_keys';
```

## Data Migration (if preserving existing data)

If you have existing browser extensions and want to preserve them:

```sql
-- This is a complex migration - contact support if you need help
-- You'll need to:
-- 1. Generate API keys for existing browser extensions
-- 2. Link browser extensions to those API keys
-- 3. Update block_attempts to use the new UUID references

-- Example (simplified):
-- Generate API keys for existing users
INSERT INTO public.api_keys (user_id, api_key, name)
SELECT DISTINCT user_id, 'zbk_' || md5(random()::text), 'Migrated Browser'
FROM browser_extensions_backup;

-- This is incomplete - you'll need custom logic based on your data
```

## Testing After Migration

### 1. Test API Key Generation
```bash
curl -X POST http://localhost:3000/api/extension/generate-key \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

### 2. Test Browser Registration
```bash
curl -X POST http://localhost:3000/api/extension/register \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"browserType":"chrome","browserVersion":"120.0","platform":"darwin"}'
```

### 3. Test Sync
```bash
curl -X GET http://localhost:3000/api/extension/sync \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 4. Test Block Logging
```bash
curl -X POST http://localhost:3000/api/blocks/log \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"siteUrl":"facebook.com","profileId":null}'
```

## Rollback Plan

If something goes wrong:

```sql
-- Restore from backups
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.browser_extensions CASCADE;
DROP TABLE IF EXISTS public.block_attempts CASCADE;

-- Restore from backup
CREATE TABLE public.browser_extensions AS SELECT * FROM browser_extensions_backup;
CREATE TABLE public.block_attempts AS SELECT * FROM block_attempts_backup;

-- Re-enable RLS and recreate policies
-- ... (use your original schema)
```

## Support

If you encounter issues during migration:
1. Check the Supabase logs for detailed error messages
2. Verify all foreign key relationships are correct
3. Ensure RLS policies are properly set up
4. Test each API endpoint individually

## Benefits of New Schema

✅ **Proper API Key Management**: Keys are stored securely with user association
✅ **Better Tracking**: Track when API keys are used and by which browser
✅ **Improved Security**: API keys can be revoked without deleting browser data
✅ **Better Analytics**: Full audit trail of API usage and browser activity
✅ **Scalability**: Clean foreign key relationships for data integrity

