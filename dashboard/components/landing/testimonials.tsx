import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Parent of 3',
    avatar: '👩‍💼',
    content: 'ZeeBlocker has been a game-changer for our family. I receive instant alerts when my kids try to access inappropriate sites, and the detailed timeline gives me peace of mind. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Freelance Developer',
    avatar: '👨‍💻',
    content: 'As someone who works from home, distractions were killing my productivity. ZeeBlocker helps me stay focused during work hours. The focus mode is brilliant!',
    rating: 5,
  },
  {
    name: 'Jessica Martinez',
    role: 'HR Manager',
    avatar: '👩‍💼',
    content: 'We deployed ZeeBlocker across our organization and saw a 40% increase in productivity. The admin analytics are incredibly insightful. Worth every penny!',
    rating: 5,
  },
  {
    name: 'David Thompson',
    role: 'College Student',
    avatar: '🎓',
    content: 'This extension saved my GPA! During exam season, I block all social media and streaming sites. The cross-browser support means I\'m protected everywhere.',
    rating: 5,
  },
  {
    name: 'Emily Roberts',
    role: 'Elementary Teacher',
    avatar: '👩‍🏫',
    content: 'I use ZeeBlocker to protect my classroom computers. The organization mode is perfect for schools. Easy to set up and manage multiple devices.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Small Business Owner',
    avatar: '👨‍💼',
    content: 'The family plan is perfect for my household. My wife and I can monitor our kids\' browsing across all their devices from one dashboard. Simple and effective.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Loved by{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            See what our users have to say about ZeeBlocker
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

