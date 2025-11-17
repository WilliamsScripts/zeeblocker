-- ============================================
-- ZeeBlocker Database Migration Script
-- From: Old schema without api_keys
-- To: New schema with api_keys and updated browser_extensions
-- ============================================

-- Step 1: Create api_keys table if it doesn't exist
-- ============================================
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

-- Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for api_keys
DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own API keys" ON public.api_keys;
CREATE POLICY "Users can create own API keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own API keys" ON public.api_keys;
CREATE POLICY "Users can update own API keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own API keys" ON public.api_keys;
CREATE POLICY "Users can delete own API keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Step 2: Backup existing browser_extensions (if any data exists)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'browser_extensions') THEN
    
    -- Create backup table
    DROP TABLE IF EXISTS browser_extensions_backup;
    CREATE TABLE browser_extensions_backup AS 
    SELECT * FROM public.browser_extensions;
    
    RAISE NOTICE 'Backed up % rows from browser_extensions', 
                 (SELECT COUNT(*) FROM browser_extensions_backup);
  END IF;
END $$;

-- Step 3: Drop old browser_extensions table
-- ============================================
DROP TABLE IF EXISTS public.browser_extensions CASCADE;

-- Step 4: Create new browser_extensions table with api_key_id
-- ============================================
CREATE TABLE public.browser_extensions (
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

-- Enable RLS
ALTER TABLE public.browser_extensions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view own extensions" ON public.browser_extensions;
CREATE POLICY "Users can view own extensions" ON public.browser_extensions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own extensions" ON public.browser_extensions;
CREATE POLICY "Users can create own extensions" ON public.browser_extensions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own extensions" ON public.browser_extensions;
CREATE POLICY "Users can update own extensions" ON public.browser_extensions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own extensions" ON public.browser_extensions;
CREATE POLICY "Users can delete own extensions" ON public.browser_extensions
  FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Update block_attempts table if it exists
-- ============================================
DO $$
BEGIN
  -- Check if block_attempts table exists
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'block_attempts') THEN
    
    -- Check if extension_id column exists and is wrong type
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'block_attempts' 
               AND column_name = 'extension_id'
               AND data_type = 'text') THEN
      
      -- Backup existing data
      DROP TABLE IF EXISTS block_attempts_backup;
      CREATE TABLE block_attempts_backup AS 
      SELECT * FROM public.block_attempts;
      
      -- Drop and recreate table with correct foreign key
      DROP TABLE public.block_attempts CASCADE;
      
      CREATE TABLE public.block_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        extension_id UUID REFERENCES public.browser_extensions(id) ON DELETE SET NULL,
        site_url TEXT NOT NULL,
        blocked_at TIMESTAMPTZ DEFAULT NOW(),
        notified BOOLEAN DEFAULT false
      );
      
      CREATE INDEX idx_block_attempts_user ON public.block_attempts(user_id, blocked_at DESC);
      CREATE INDEX idx_block_attempts_profile ON public.block_attempts(profile_id, blocked_at DESC);
      
      -- Enable RLS
      ALTER TABLE public.block_attempts ENABLE ROW LEVEL SECURITY;
      
      -- Recreate policies
      DROP POLICY IF EXISTS "Users can view own block attempts" ON public.block_attempts;
      CREATE POLICY "Users can view own block attempts" ON public.block_attempts
        FOR SELECT USING (auth.uid() = user_id);
      
      DROP POLICY IF EXISTS "Anyone can insert block attempts" ON public.block_attempts;
      CREATE POLICY "Anyone can insert block attempts" ON public.block_attempts
        FOR INSERT WITH CHECK (true);
      
      RAISE NOTICE 'Recreated block_attempts table with correct foreign key';
    END IF;
  ELSE
    -- Create block_attempts table if it doesn't exist
    CREATE TABLE public.block_attempts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      extension_id UUID REFERENCES public.browser_extensions(id) ON DELETE SET NULL,
      site_url TEXT NOT NULL,
      blocked_at TIMESTAMPTZ DEFAULT NOW(),
      notified BOOLEAN DEFAULT false
    );
    
    CREATE INDEX idx_block_attempts_user ON public.block_attempts(user_id, blocked_at DESC);
    CREATE INDEX idx_block_attempts_profile ON public.block_attempts(profile_id, blocked_at DESC);
    
    -- Enable RLS
    ALTER TABLE public.block_attempts ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view own block attempts" ON public.block_attempts
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Anyone can insert block attempts" ON public.block_attempts
      FOR INSERT WITH CHECK (true);
    
    RAISE NOTICE 'Created block_attempts table';
  END IF;
END $$;

-- Step 6: Verify migration
-- ============================================
DO $$
DECLARE
  api_keys_count INTEGER;
  browser_ext_count INTEGER;
  has_api_key_id BOOLEAN;
BEGIN
  -- Check api_keys table
  SELECT COUNT(*) INTO api_keys_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'api_keys';
  
  -- Check browser_extensions has api_key_id column
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'browser_extensions' 
    AND column_name = 'api_key_id'
  ) INTO has_api_key_id;
  
  -- Report results
  IF api_keys_count > 0 AND has_api_key_id THEN
    RAISE NOTICE '✅ Migration successful!';
    RAISE NOTICE '   - api_keys table: Created';
    RAISE NOTICE '   - browser_extensions: Updated with api_key_id';
    RAISE NOTICE '   - block_attempts: Updated foreign key';
  ELSE
    RAISE WARNING '⚠️ Migration may have issues. Please verify manually.';
  END IF;
END $$;

-- Step 7: Grant permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- Migration Complete!
-- ============================================
-- Next steps:
-- 1. Verify the migration worked by checking the tables
-- 2. Test API key generation: POST /api/extension/generate-key
-- 3. All existing browser connections will need to reconnect with new API keys
-- 4. Old browser data has been backed up in browser_extensions_backup
-- 5. Old block attempts backed up in block_attempts_backup
-- ============================================

