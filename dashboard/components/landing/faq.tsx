import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'How does ZeeBlocker work?',
    answer: 'ZeeBlocker is a browser extension that connects to your account dashboard. You configure blocklists from the dashboard, and the extension syncs these settings in real-time. When you try to visit a blocked site, the extension redirects you before the page loads, ensuring instant blocking with no exposure to unwanted content.',
  },
  {
    question: 'Is my data private and secure?',
    answer: 'Absolutely. We take privacy seriously. Your blocklists and settings are stored securely in our database with encryption. We only track what you explicitly configure (blocked sites, profiles, etc.). We never track your general browsing history, sell your data, or share it with third parties. You can delete your account and all associated data at any time.',
  },
  {
    question: 'Can ZeeBlocker be bypassed or disabled?',
    answer: 'While the extension can be disabled like any browser extension, we offer features to detect this. For organization and family plans, you can receive alerts when the extension is disabled. For true enforcement, we recommend combining ZeeBlocker with network-level filtering and having transparent conversations with users about expectations.',
  },
  {
    question: 'Which browsers are supported?',
    answer: 'ZeeBlocker works on Chrome, Firefox, Brave, Arc, and Edge. The same extension codebase works across all these browsers, and you can manage all of them from one dashboard. Your blocklists and settings sync instantly across all browsers.',
  },
  {
    question: 'How do notifications work?',
    answer: 'When a restricted site is accessed, ZeeBlocker logs the attempt and can send notifications in two ways: (1) In-dashboard notifications that appear in real-time in your ZeeBlocker dashboard, and (2) Email notifications sent to the address you configure. You can customize notification preferences per profile.',
  },
  {
    question: 'What happens after my trial ends?',
    answer: 'All paid plans include a 14-day free trial. During the trial, you have full access to all features. After the trial, if you don\'t add a payment method, your account reverts to the Free plan. If you\'ve added payment, your subscription continues automatically. You can cancel anytime from your dashboard billing settings.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time from your dashboard. When upgrading, you get immediate access to new features. When downgrading, changes take effect at the end of your current billing period. We\'ll prorate charges appropriately.',
  },
  {
    question: 'How many profiles can I create?',
    answer: 'The number of profiles depends on your plan: Free (0 profiles - personal use only), Pro (0 profiles - personal use only), Family (5 child profiles), Organization (20 worker profiles). Each profile can have its own blocklist and notification settings.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with ZeeBlocker for any reason within the first 30 days, contact our support team and we\'ll issue a full refund, no questions asked.',
  },
  {
    question: 'Is ZeeBlocker suitable for children under 13?',
    answer: 'ZeeBlocker is designed to help parents protect children of all ages. However, per COPPA regulations, you must be 18 or older to create an account. As a parent, you create profiles for your children within your account. This ensures proper consent and parental control.',
  },
  {
    question: 'Can I use ZeeBlocker on mobile?',
    answer: 'Currently, ZeeBlocker is a browser extension for desktop/laptop browsers. Mobile browser support is on our roadmap. However, you can access your dashboard from mobile to view analytics, manage settings, and see notifications.',
  },
  {
    question: 'How is this different from built-in browser parental controls?',
    answer: 'ZeeBlocker offers several advantages: (1) Works across multiple browsers from one dashboard, (2) Cloud-synced settings, (3) Real-time email notifications, (4) Detailed activity timelines, (5) Support for organization use cases, (6) More granular control over blocklists per profile.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to know about ZeeBlocker
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-gray-200 dark:border-gray-800 rounded-xl px-6 bg-white dark:bg-gray-900"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:support@zeeblocker.com"
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-semibold"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  )
}

