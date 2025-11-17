import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center py-30 justify-center overflow-hidden bg-linear-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-indigo-400/30 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800 mb-8">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Trusted by thousands of families & organizations
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Block Distractions.
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              Boost Productivity.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            The ultimate browser extension for focus, online safety, and
            organizational productivity. Block distracting sites, protect your
            children, and manage your team—all from one powerful dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Link href="/signup">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Instant Blocking
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Sites blocked before they load. No distractions, no exceptions.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Parental Controls
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Protect your children with instant email alerts and detailed
                logs.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Team Management
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Enforce organization policies across multiple browsers and
                users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
