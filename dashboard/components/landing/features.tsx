import { 
  Shield, 
  Zap, 
  Bell, 
  Users, 
  BarChart3, 
  Chrome,
  Lock,
  Clock,
  Mail,
  Settings,
  Eye,
  Database
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Instant Site Blocking',
    description: 'Block distracting websites before they even load. Custom blocklists per profile with real-time sync across all your browsers.',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  {
    icon: Shield,
    title: 'Advanced Parental Controls',
    description: 'Protect your children with automatic blocking of inappropriate content. Create multiple child profiles with individual settings.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    description: 'Receive instant email and dashboard alerts when restricted sites are accessed. Never miss important activity.',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    icon: Users,
    title: 'Multi-Profile Management',
    description: 'Manage children or team members from one dashboard. Assign different blocklists and permissions to each profile.',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Track blocking patterns, view activity timelines, and export reports. Understand productivity trends over time.',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
  },
  {
    icon: Chrome,
    title: 'Cross-Browser Support',
    description: 'Works seamlessly on Chrome, Firefox, Brave, Arc, and Edge. One account, multiple browsers, unified management.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  {
    icon: Lock,
    title: 'Organization Policies',
    description: 'Deploy across your company with centralized control. Detect when employees disable the extension.',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  {
    icon: Clock,
    title: 'Activity Timeline',
    description: 'View a complete history of blocked attempts with timestamps, sites, and profile details. Filterable and searchable.',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    icon: Mail,
    title: 'Email Alerts',
    description: 'Get beautiful email notifications with all the details you need. Customize notification preferences per profile.',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
  },
  {
    icon: Settings,
    title: 'Flexible Configuration',
    description: 'Customize every aspect of blocking behavior. Set up different rules for work hours, weekends, or specific scenarios.',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  {
    icon: Eye,
    title: 'Privacy-First Design',
    description: 'Your data stays yours. We only track what you explicitly configure. No third-party tracking or data selling.',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
  },
  {
    icon: Database,
    title: 'Cloud Sync',
    description: 'Your blocklists and settings sync instantly across all your devices. Sign in once, protected everywhere.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need to Stay{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Focused & Safe
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Powerful features designed for individuals, families, and organizations. 
            No matter your use case, ZeeBlocker has you covered.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

