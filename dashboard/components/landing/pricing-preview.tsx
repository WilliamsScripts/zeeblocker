import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for individual users getting started",
    features: [
      "1 linked browser",
      "Basic site blocking",
      "Browser notifications only",
      "Community support",
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: 15,
    description: "For power users who need more control",
    features: [
      "3 linked browsers",
      "Advanced site blocking",
      "Email notifications",
      "Focus mode analytics",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Family",
    price: 25,
    description: "Protect your entire family online",
    features: [
      "10 linked browsers",
      "Up to 5 child profiles",
      "Parental controls",
      "Email & dashboard notifications",
      "Detailed activity reports",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    popular: false,
  },
  {
    name: "Organization",
    price: 30,
    description: "Enterprise-grade solution for teams",
    features: [
      "50 linked browsers",
      "Up to 20 worker profiles",
      "Organization policies",
      "Advanced analytics",
      "Disable detection alerts",
      "Dedicated account manager",
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    popular: false,
  },
];

export function PricingPreview() {
  return (
    <section
      id="pricing"
      className="py-24 bg-linear-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Simple,{" "}
            <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that fits your needs. All paid plans include a
            14-day free trial.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 flex flex-col rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                plan.popular
                  ? "border-purple-500 dark:border-purple-600 bg-linear-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20"
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
                  <span className="text-gray-600 dark:text-gray-400">
                    /month
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-auto">
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
                asChild
                variant={plan.ctaVariant}
                className={cn(
                  "w-full mt-5",
                  plan.popular
                    ? "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    : ""
                )}
                size="lg"
              >
                <Link href={plan.price === 0 ? "/signup" : "/pricing"}>
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* View full pricing link */}
        <div className="text-center">
          <Button asChild variant="link" size="lg">
            <Link
              href="/pricing"
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              View detailed pricing comparison →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
