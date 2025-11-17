import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Chrome,
  Download,
  Settings,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { ConnectExtensionGuide } from "@/components/connect/connect-extension-guide";

export const metadata = {
  title: "Connect Your Browser - ZeeBlocker",
  description: "Step-by-step guide to connect your browser extension",
};

export default async function ConnectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/connect");
  }

  // Get user subscription info
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get connected browsers
  const { data: browsers } = await supabase
    .from("browser_extensions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const hasConnectedBrowsers = browsers && browsers.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Navbar would go here - using same navbar as landing */}
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Shield className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Browser Extension
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Follow these simple steps to start blocking distractions across all
            your devices
          </p>
        </div>

        {/* Status Banner */}
        {hasConnectedBrowsers && (
          <div className="max-w-3xl mx-auto mb-8">
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardContent className="flex items-center gap-4 p-6">
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    You're all set!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {browsers.length} browser{browsers.length !== 1 ? "s" : ""}{" "}
                    connected. You can connect more or manage existing
                    connections.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/browsers">Manage Browsers</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Guide */}
        <div className="max-w-4xl mx-auto">
          <ConnectExtensionGuide
            userData={userData}
            hasConnectedBrowsers={hasConnectedBrowsers}
          />
        </div>

        {/* Quick Links */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Once connected, explore these features
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                asChild
                variant="outline"
                className="h-auto py-4 justify-start"
              >
                <Link href="/dashboard/blocklists">
                  <Shield className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Blocklists</div>
                    <div className="text-xs text-gray-500">
                      Add sites to block
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto py-4 justify-start"
              >
                <Link href="/dashboard/profiles">
                  <Settings className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Create Profiles</div>
                    <div className="text-xs text-gray-500">
                      For family or team
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto py-4 justify-start"
              >
                <Link href="/dashboard">
                  <ArrowRight className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Go to Dashboard</div>
                    <div className="text-xs text-gray-500">View analytics</div>
                  </div>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto py-4 justify-start"
              >
                <Link href="/pricing">
                  <Chrome className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Upgrade Plan</div>
                    <div className="text-xs text-gray-500">
                      Connect more browsers
                    </div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
