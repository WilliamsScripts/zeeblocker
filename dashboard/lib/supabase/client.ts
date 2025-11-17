import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_CONFIG } from "@/lib/config";

export function createClient() {
  // Check if Supabase is configured
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    throw new Error(
      "❌ Supabase is not configured!\n\n" +
        "📝 To fix this:\n" +
        "1. Copy dashboard/.env.example to dashboard/.env.local\n" +
        "2. Add your Supabase URL and keys\n" +
        "3. Get them from: https://supabase.com/dashboard/project/_/settings/api\n\n" +
        "See dashboard/SETUP_GUIDE.md for detailed instructions."
    );
  }

  return createBrowserClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}
