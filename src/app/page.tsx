'use client'

import Link from 'next/link'
import { Dumbbell, Activity, Utensils, TrendingUp, Users, Star, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/use-auth'

const features = [
  {
    icon: Dumbbell,
    title: 'Workout Tracking',
    description: 'Log and track your workouts with detailed exercise records. Monitor duration, calories, and progress over time.',
  },
  {
    icon: Utensils,
    title: 'Meal Planning',
    description: 'Track your nutrition with comprehensive meal logging. Monitor calories, protein, carbs, and fats.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Visualize your fitness journey with detailed charts. Track weight, measurements, and achieve your goals.',
  },
  {
    icon: Users,
    title: 'Personalized Goals',
    description: 'Set fitness goals tailored to your needs. Whether weight loss, muscle gain, or maintenance.',
  },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Fitness Enthusiast',
    content: 'Nuxwell has transformed my fitness journey. The workout tracking and meal planning features are incredible!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Personal Trainer',
    content: 'I recommend Nuxwell to all my clients. The progress tracking helps them stay motivated and see real results.',
    rating: 5,
  },
  {
    name: 'Emily Davis',
    role: 'Marathon Runner',
    content: 'Finally, an app that understands both nutrition and exercise. Been using it for 6 months and love it.',
    rating: 5,
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started',
    features: [
      'Basic workout tracking',
      'Meal logging',
      'Progress charts',
      'Goal setting',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious fitness enthusiasts',
    features: [
      'Everything in Starter',
      'Advanced analytics',
      'Custom workout plans',
      'Nutrition insights',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Elite',
    price: '$19.99',
    period: '/month',
    description: 'Complete fitness solution',
    features: [
      'Everything in Pro',
      '1-on-1 coaching sessions',
      'Personalized meal plans',
      'API access',
      'White-label options',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Trusted by 10,000+ fitness enthusiasts
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Your Wellness{''}
              <span className="text-emerald-600"> Journey</span>
              <br />Starts Here
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Transform your fitness with personalized workouts, comprehensive meal plans, and detailed progress tracking. Join thousands achieving their goals with Nuxwell.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="px-8">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="px-8">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/#features">
                    <Button size="lg" variant="outline" className="px-8">
                      Learn More
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div>
                <div className="text-3xl font-bold text-emerald-600">10K+</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">50K+</div>
                <div className="text-sm text-slate-600">Workouts Logged</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">98%</div>
                <div className="text-sm text-slate-600">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to{''}
              <span className="text-emerald-600"> Succeed</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools designed to help you achieve your fitness goals efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Loved by{''}
              <span className="text-emerald-600"> Fitness Pros</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See what our community has to say about their experience with Nuxwell.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Simple,{''}
              <span className="text-emerald-600"> Transparent</span> Pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your fitness journey. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-emerald-500 border-2' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-slate-500">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm mb-6">{plan.description}</p>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'primary' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-700" />
            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your{''}
                <span className="text-emerald-200"> Fitness?</span>
              </h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of people who have already started their wellness journey with Nuxwell. Your transformation begins today.
              </p>
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="px-8">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="px-8 bg-white text-emerald-600 hover:bg-emerald-50">
                    Get Started Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Nuxwell</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 Nuxwell. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
