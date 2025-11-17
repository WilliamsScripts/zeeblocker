# Quick Migration Instructions

## Error: `column "api_key_id" does not exist`

This error means your database is using the old schema. Follow these steps to migrate:

---

## 🚀 Quick Migration (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration Script

1. Open the file: `dashboard/lib/supabase/migration.sql`
2. Copy **ALL** the contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify Migration

You should see success messages like:
```
✅ Migration successful!
   - api_keys table: Created
   - browser_extensions: Updated with api_key_id
   - block_attempts: Updated foreign key
```

### Step 4: Check Your Tables

Run this query to verify:

```sql
-- Check if api_keys table exists
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'api_keys' AND table_schema = 'public') as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('api_keys', 'browser_extensions', 'block_attempts');

-- Check browser_extensions has api_key_id
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'browser_extensions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

You should see:
- `api_keys` table with 6 columns
- `browser_extensions` table with `api_key_id` column (UUID type)
- `block_attempts` table with `extension_id` as UUID (not text)

---

## ⚠️ Important Notes

### 1. Existing Browser Connections

**All existing browser connections will need to reconnect!**

Why? The old `extension_id` field has been replaced with a proper foreign key relationship to `api_keys`.

**What users need to do:**
1. Go to `/dashboard/browsers` 
2. Generate a new API key
3. Paste it in their browser extension
4. Extension will reconnect automatically

### 2. Data Backup

The migration script automatically backs up:
- `browser_extensions_backup` - Your old browser data
- `block_attempts_backup` - Your old block attempt logs

These tables are kept for safety. You can drop them after verifying everything works:

```sql
-- After verifying everything works (optional cleanup)
DROP TABLE IF EXISTS browser_extensions_backup;
DROP TABLE IF EXISTS block_attempts_backup;
```

### 3. Fresh Start Alternative

If you don't have important data in production, you can also:

1. Delete all data from old tables:
```sql
TRUNCATE TABLE browser_extensions CASCADE;
TRUNCATE TABLE block_attempts CASCADE;
```

2. Then run the migration script

---

## 🧪 Test After Migration

### Test 1: Generate API Key

```bash
# In your terminal (make sure dev server is running)
curl -X POST http://localhost:3000/api/extension/generate-key \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

You should get:
```json
{
  "apiKey": "zbk_...",
  "browserId": "uuid",
  "maxBrowsers": 1,
  "currentBrowsers": 0,
  "plan": "free"
}
```

### Test 2: Check Database

```sql
-- Should see the new API key
SELECT * FROM api_keys ORDER BY created_at DESC LIMIT 1;

-- Should see the browser entry
SELECT * FROM browser_extensions ORDER BY created_at DESC LIMIT 1;
```

### Test 3: Connect Browser Extension

1. Open your browser extension
2. Paste the API key you generated
3. Click "Connect to Dashboard"
4. Check Supabase logs for any errors

---

## 🐛 Troubleshooting

### Error: "relation already exists"

This means you're running the migration twice. It's safe to ignore or drop the tables first:

```sql
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.browser_extensions CASCADE;
DROP TABLE IF EXISTS public.block_attempts CASCADE;
-- Then run migration again
```

### Error: "permission denied"

Make sure you're running the query with the right permissions. Try:

```sql
-- At the top of your query
SET ROLE postgres;
-- Then run the migration
```

### Still Getting "api_key_id does not exist"

1. Verify the migration ran successfully:
```sql
\d browser_extensions
-- OR
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'browser_extensions';
```

2. Restart your Next.js dev server:
```bash
cd dashboard
npm run dev
```

3. Clear your browser cache and try again

---

## ✅ Success Checklist

After migration, you should be able to:

- [ ] View `api_keys` table in Supabase
- [ ] View `browser_extensions` with `api_key_id` column
- [ ] Generate new API keys via dashboard
- [ ] Connect browser extension with new API key
- [ ] See browser in `/dashboard/browsers` page
- [ ] Extension syncs blocklists successfully
- [ ] Block attempts are logged to database

---

## 🆘 Need Help?

If you're still having issues:

1. **Check Supabase Logs**: Look for detailed error messages
2. **Verify Environment Variables**: Make sure `.env.local` is set up
3. **Check Network Tab**: See if API requests are failing
4. **Database Permissions**: Ensure RLS policies are correct

Common issues:
- Forgot to run migration script
- Migration script failed silently (check for errors)
- RLS policies blocking access
- Environment variables not loaded

---

## 🎉 Migration Complete!

Once successful, you can:
- Generate API keys from the dashboard
- Connect multiple browsers (based on plan)
- Track all browser activity
- View complete audit trail in analytics table

Your database is now properly synced! 🚀

