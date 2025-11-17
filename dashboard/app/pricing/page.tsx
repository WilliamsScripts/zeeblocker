import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { PricingCards } from '@/components/pricing/pricing-cards'

export const metadata = {
  title: 'Pricing - ZeeBlocker',
  description: 'Choose the perfect plan for your needs. All paid plans include a 14-day free trial.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Header */}
        <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All paid plans include a 14-day free trial with full access. 
              Cancel anytime, no questions asked.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <PricingCards />
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Detailed Feature Comparison
            </h2>
            
            <div className="max-w-6xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <th className="p-4 text-left font-semibold">Feature</th>
                    <th className="p-4 text-center font-semibold">Free</th>
                    <th className="p-4 text-center font-semibold">Pro</th>
                    <th className="p-4 text-center font-semibold">Family</th>
                    <th className="p-4 text-center font-semibold">Organization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Price</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">$0/mo</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">$15/mo</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">$25/mo</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">$30/mo</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Linked Browsers</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">1</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">3</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">10</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">50</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Child/Worker Profiles</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">0</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">0</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">5</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">20</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Site Blocking</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Custom Blocklists</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Browser Notifications</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Email Notifications</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Dashboard Notifications</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Activity Timeline</td>
                    <td className="p-4 text-center">Basic</td>
                    <td className="p-4 text-center">Full</td>
                    <td className="p-4 text-center">Full</td>
                    <td className="p-4 text-center">Full</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Analytics & Reports</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">Basic</td>
                    <td className="p-4 text-center">Advanced</td>
                    <td className="p-4 text-center">Advanced</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Parental Controls</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">❌</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Organization Policies</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Disable Detection</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">✅</td>
                    <td className="p-4 text-center">✅</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">Support</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">Community</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">Priority</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">Priority</td>
                    <td className="p-4 text-center text-gray-600 dark:text-gray-400">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Pricing FAQ
            </h2>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Do I need a credit card for the free trial?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No! The free trial for paid plans doesn't require a credit card. You can explore all features 
                  for 14 days before deciding to subscribe.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Can I change my plan later?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! You can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades 
                  take effect at the end of your current billing period. We'll prorate charges fairly.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We accept all major credit cards (Visa, Mastercard, American Express) through Stripe. 
                  Enterprise customers can also arrange invoicing.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  Is there a discount for annual billing?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Not yet, but we're working on it! Subscribe to our newsletter to be notified when annual 
                  plans with discounts become available.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

