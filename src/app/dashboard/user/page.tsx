'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dumbbell,
    Utensils,
    TrendingUp,
    Star,
    Lock,
    ArrowRight,
    CheckCircle
} from 'lucide-react'

interface UserStats {
    workoutsThisWeek: number
    mealsLogged: number
    daysActive: number
}

export default function UserDashboardPage() {
    const { profile } = useAuth()
    const [stats, setStats] = useState<UserStats>({
        workoutsThisWeek: 0,
        mealsLogged: 0,
        daysActive: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/user/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Error fetching user stats:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const features = [
        { name: 'Unlimited Workouts', free: true },
        { name: 'Meal Logging', free: true },
        { name: 'Progress Tracking', free: true },
        { name: 'Workout Plans', free: false },
        { name: 'Meal Plans', free: false },
        { name: 'Personal Trainer', free: false },
        { name: 'Advanced Analytics', free: false },
        { name: 'Priority Support', free: false },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-2">Welcome, {profile?.fullName || 'User'}!</p>
            </div>

            {/* Upgrade Banner */}
            <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                <p className="font-semibold">Upgrade to Pro</p>
                            </div>
                            <p className="text-white/80 text-sm mt-1">Unlock all features and reach your goals faster!</p>
                        </div>
                        <a
                            href="/dashboard/user/upgrade"
                            className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                        >
                            Learn More <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                                <Dumbbell className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-slate-600">Workouts This Week</p>
                            <p className="text-3xl font-bold text-slate-900">
                                {loading ? '...' : stats.workoutsThisWeek}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                                <Utensils className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-slate-600">Meals Logged</p>
                            <p className="text-3xl font-bold text-slate-900">
                                {loading ? '...' : stats.mealsLogged}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-slate-600">Days Active</p>
                            <p className="text-3xl font-bold text-slate-900">
                                {loading ? '...' : stats.daysActive}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Features Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle>Pro Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-3 p-3 rounded-lg ${feature.free ? 'bg-emerald-50' : 'bg-slate-50'
                                    }`}
                            >
                                {feature.free ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <Lock className="w-5 h-5 text-slate-400" />
                                )}
                                <span className={feature.free ? 'text-slate-900' : 'text-slate-500'}>
                                    {feature.name}
                                </span>
                                {feature.free && (
                                    <span className="ml-auto text-xs text-emerald-600 font-medium">FREE</span>
                                )}
                                {!feature.free && (
                                    <span className="ml-auto text-xs text-slate-400 font-medium">PRO</span>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <a href="/dashboard/user/workouts" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Dumbbell className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">Start a Workout</span>
                        </a>
                        <a href="/dashboard/user/meals" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Utensils className="w-5 h-5 text-orange-600" />
                            <span className="font-medium">Log a Meal</span>
                        </a>
                        <a href="/dashboard/user/upgrade" className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
                            <Star className="w-5 h-5 text-amber-600" />
                            <span className="font-medium">Upgrade to Pro</span>
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 mb-4">Check out our help center or contact support for assistance.</p>
                        <a
                            href="/dashboard/user/help"
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Visit Help Center <ArrowRight className="w-4 h-4" />
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
