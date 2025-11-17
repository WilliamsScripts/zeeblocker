"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for individual users getting started",
    features: [
      "1 linked browser",
      "Basic site blocking",
      "Custom blocklists",
      "Browser notifications",
      "Community support",
      "Cloud sync",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 15,
    description: "For power users who need more control",
    features: [
      "Everything in Free, plus:",
      "3 linked browsers",
      "Advanced site blocking",
      "Email notifications",
      "Dashboard notifications",
      "Full activity timeline",
      "Basic analytics",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    id: "family",
    name: "Family",
    price: 25,
    description: "Protect your entire family online",
    features: [
      "Everything in Pro, plus:",
      "10 linked browsers",
      "Up to 5 child profiles",
      "Parental controls",
      "Per-profile blocklists",
      "Advanced analytics",
      "Detailed activity reports",
      "Disable detection alerts",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    popular: false,
  },
  {
    id: "org",
    name: "Organization",
    price: 30,
    description: "Enterprise-grade solution for teams",
    features: [
      "Everything in Family, plus:",
      "50 linked browsers",
      "Up to 20 worker profiles",
      "Organization policies",
      "Worker management",
      "Advanced analytics dashboard",
      "CSV export",
      "Disable detection alerts",
      "Priority support",
      "Dedicated account manager",
    ],
    cta: "Start 14-Day Free Trial",
    popular: false,
  },
];

export function PricingCards() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") {
      window.location.href = "/signup";
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col ${
            plan.popular
              ? "border-purple-500 dark:border-purple-600 bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-xl scale-105"
              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-linear-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                Most Popular
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {plan.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {plan.description}
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">
                ${plan.price}
              </span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-auto min-h-[300px]">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <Button
            onClick={() => handleSubscribe(plan.id)}
            disabled={loading === plan.id}
            variant={plan.popular ? "default" : "outline"}
            className={`w-full ${
              plan.popular
                ? "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                : " mt-6"
            }`}
            size="lg"
          >
            {loading === plan.id ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              plan.cta
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
