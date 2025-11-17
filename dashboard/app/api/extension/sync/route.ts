import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG } from "@/lib/config";

const supabaseAdmin = createClient(
  SUPABASE_CONFIG.url || "",
  SUPABASE_CONFIG.serviceRoleKey || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // Validate API key format
    if (!apiKey.startsWith("zbk_")) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 401 }
      );
    }

    // Validate and get API key from database
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("id, user_id, is_active")
      .eq("api_key", apiKey)
      .eq("is_active", true)
      .single();

    if (keyError || !keyData) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    // Update last_used_at for API key
    await supabaseAdmin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyData.id);

    // Update browser extension last sync time
    const { data: browserData } = await supabaseAdmin
      .from("browser_extensions")
      .select("id")
      .eq("api_key_id", keyData.id)
      .single();

    if (browserData) {
      await supabaseAdmin
        .from("browser_extensions")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", browserData.id);
    }

    // Get user data
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", keyData.user_id)
      .single();

    // Get all blocklists for the user (including profile-specific ones)
    const { data: blocklists } = await supabaseAdmin
      .from("blocklists")
      .select("*")
      .eq("user_id", keyData.user_id)
      .eq("is_active", true);

    // Get profiles
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", keyData.user_id);

    // Group blocklists by profile
    interface BlocklistsByProfile {
      personal: string[];
      [profileId: string]: string[];
    }

    const blocklistsByProfile: BlocklistsByProfile = {
      personal:
        blocklists?.filter((b) => !b.profile_id).map((b) => b.site_url) || [],
    };

    profiles?.forEach((profile) => {
      blocklistsByProfile[profile.id] =
        blocklists
          ?.filter((b) => b.profile_id === profile.id)
          .map((b) => b.site_url) || [];
    });

    // Track analytics
    await supabaseAdmin.from("analytics").insert({
      user_id: keyData.user_id,
      event_type: "extension_sync",
      event_data: {
        browser_id: browserData?.id,
        blocklist_count: blocklists?.length || 0,
        profile_count: profiles?.length || 0,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: keyData.user_id,
        email: userData?.email,
        subscription_plan: userData?.subscription_plan || "free",
        subscription_status: userData?.subscription_status || "free",
      },
      browserId: browserData?.id,
      blocklists: blocklistsByProfile,
      profiles: profiles || [],
      settings: {
        notificationsEnabled: true,
        emailNotificationsEnabled: userData?.subscription_plan !== "free",
      },
    });
  } catch (error) {
    console.error("Extension sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
