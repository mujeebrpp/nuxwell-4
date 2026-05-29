'use client'

import Link from 'next/link'
import { Dumbbell, Utensils, TrendingUp, Users, Star, ArrowRight, Check, Waves, Coffee, Award, Calendar, Shield, QrCode, Zap, Heart, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/use-auth'

const features = [
    {
        icon: Waves,
        title: 'Pool Booking',
        description: 'Reserve lanes in our Olympic lap pools, therapy pools, or kids pools with ease.',
    },
    {
        icon: Coffee,
        title: 'Tea Hub',
        description: 'Book tea tables for family gatherings, events, and healthy refreshments.',
    },
    {
        icon: Dumbbell,
        title: 'AI Workout Tracking',
        description: 'Track exercises with MediaPipe BlazePose. Get real-time form feedback and rep counting.',
    },
    {
        icon: Award,
        title: 'Wellness Rewards',
        description: 'Earn points for visits, swimming, workouts, and tea purchases. Redeem for rewards.',
    },
    {
        icon: Users,
        title: 'Family Accounts',
        description: 'Manage shared memberships, rewards, and wellness scores for your family.',
    },
    {
        icon: QrCode,
        title: 'QR Self-Service',
        description: 'Check-in, unlock lockers, and rent equipment with QR codes.',
    },
    {
        icon: Calendar,
        title: 'Events & Workshops',
        description: 'Join birthday parties, family events, and wellness workshops.',
    },
    {
        icon: Zap,
        title: 'Multi-Pool System',
        description: '2 Large lap pools, 2 Small therapy pools, 3 Kids pools - all configurable.',
    },
]

const testimonials = [
    {
        name: 'Priya Sharma',
        role: 'Family Member',
        content: 'Nuxwell has transformed our family wellness routine. The kids love the pools and we love the tea hub!',
        rating: 5,
    },
    {
        name: 'Arjun Nair',
        role: 'Trainer',
        content: 'The AI workout tracking helps my clients maintain perfect form. Amazing technology!',
        rating: 5,
    },
    {
        name: 'Meera Krishnan',
        role: 'Lifestyle Coach',
        content: 'The wellness scoring and rewards system keeps families motivated and consistent.',
        rating: 5,
    },
]

const pricingPlans = [
    {
        name: 'Family Wellness',
        price: '₹4,999',
        period: '/month',
        description: 'Perfect for families',
        features: ['Up to 4 family members', 'Pool access', 'Tea hub access', 'AI workout tracking', 'Rewards program'],
        cta: 'Get Started',
        popular: true,
    },
    {
        name: 'Individual',
        price: '₹1,999',
        period: '/month',
        description: 'For single members',
        features: ['Personal access', 'Pool access', 'Tea hub access', 'AI workout tracking', 'Rewards program'],
        cta: 'Start Free Trial',
        popular: false,
    },
    {
        name: 'Senior/Child',
        price: '₹999',
        period: '/month',
        description: 'Special pricing',
        features: ['Swim lessons', 'Therapy pool access', 'Family booking link', 'Progress tracking'],
        cta: 'Enroll Now',
        popular: false,
    },
]

export default function Home() {
    const { user } = useAuth()

    return (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]">
            <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:pb-20 sm:pt-32">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white" />
                    <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
                                <Star className="h-4 w-4" />
                                Trusted by 10,000+ wellness families
                            </div>

                            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
                                Nuxwell Family{' '}
                                <span className="text-emerald-600">Tea Hub</span> &{' '}
                                <span className="text-blue-600">Aquatic Wellness</span>
                            </h1>

                            <p className="mb-8 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg lg:mx-0">
                                A hybrid family wellness club combining aquatic centers, tea social hub,
                                functional fitness, and AI-powered fitness tracking into one seamless experience.
                            </p>

                            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                                {user ? (
                                    <Link href="/dashboard">
                                        <Button size="lg" className="w-full rounded-2xl px-8 sm:w-auto">
                                            Go to Dashboard
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/register">
                                            <Button size="lg" className="w-full rounded-2xl px-8 sm:w-auto">
                                                Start Free Trial
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </Link>
                                        <Link href="/#features">
                                            <Button size="lg" variant="outline" className="w-full rounded-2xl px-8 sm:w-auto">
                                                Explore Features
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3 sm:gap-4 lg:mx-0">
                                {[
                                    ['2 Large', 'Lap Pools'],
                                    ['3 Kids', 'Pools'],
                                    ['20+ Tea', 'Tables'],
                                ].map(([value, label]) => (
                                    <div key={label} className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
                                        <div className="text-2xl font-bold text-slate-950 sm:text-3xl">{value}</div>
                                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500 sm:text-sm">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-200/50 via-white to-slate-200/40 blur-3xl" />
                            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-slate-200/50 backdrop-blur">
                                <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white sm:p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white/60">Today's Wellness</p>
                                            <p className="mt-1 text-2xl font-semibold">7-day streak</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm text-emerald-300">Live</div>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-white/5 p-4">
                                            <p className="text-sm text-white/60">Pool Sessions</p>
                                            <p className="mt-2 text-lg font-medium">2/3 visited</p>
                                            <p className="mt-1 text-sm text-white/60">This week</p>
                                        </div>
                                        <div className="rounded-2xl bg-blue-500/15 p-4">
                                            <p className="text-sm text-blue-200">Reward Points</p>
                                            <p className="mt-2 text-lg font-medium text-white">1,250 pts</p>
                                            <p className="mt-1 text-sm text-blue-100/80">Family leaderboard #3</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-2xl bg-white p-4 text-slate-900">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Family Wellness Score</span>
                                            <span className="font-semibold text-emerald-600">Excellent</span>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-slate-100">
                                            <div className="h-2 w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="bg-slate-50 px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Complete Wellness Ecosystem
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Everything your family needs for fitness, fun, and connection in one integrated platform.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <Card key={index} hover className="rounded-3xl border-white/80 text-center shadow-sm shadow-slate-200/40">
                                <CardContent className="p-6">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                                        <feature.icon className="h-7 w-7 text-emerald-600" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                                    <p className="text-sm leading-6 text-slate-600">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Loved by Wellness Families
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            See how Nuxwell helps families stay healthy together.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="rounded-3xl border-white/80 bg-white/90 shadow-sm shadow-slate-200/40">
                                <CardContent className="p-6">
                                    <div className="mb-4 flex gap-1">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="mb-4 text-slate-600">"{testimonial.content}"</p>
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

            <section id="pricing" className="bg-slate-50 px-4 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Simple, <span className="text-emerald-600">Transparent</span> Pricing
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Choose the plan that matches your family's wellness journey.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
                        {pricingPlans.map((plan, index) => (
                            <Card
                                key={index}
                                className={`relative rounded-[2rem] bg-white/90 shadow-sm shadow-slate-200/40 ${plan.popular ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-100' : 'border-white/80'}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-sm font-medium text-white">
                                        Most Popular
                                    </div>
                                )}
                                <CardContent className="p-6 sm:p-8">
                                    <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                                    <div className="mt-4 flex items-end gap-1">
                                        <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                        {plan.period && <span className="pb-1 text-slate-500">{plan.period}</span>}
                                    </div>
                                    <p className="mt-2 text-slate-600">{plan.description}</p>
                                    <ul className="mt-6 space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3 text-slate-600">
                                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className="mt-8 w-full rounded-2xl" variant={plan.popular ? 'primary' : 'outline'}>
                                        {plan.cta}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}