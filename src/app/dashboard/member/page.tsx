'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dumbbell,
    Utensils,
    TrendingUp,
    Calendar,
    Target,
    Flame,
    Timer,
    ArrowUpRight
} from 'lucide-react'

interface MemberStats {
    workoutsThisWeek: number
    mealsLogged: number
    caloriesBurned: number
    activeMinutes: number
    currentStreak: number
    goalProgress: number
}

export default function MemberDashboardPage() {
    const { profile } = useAuth()
    const [stats, setStats] = useState<MemberStats>({
        workoutsThisWeek: 0,
        mealsLogged: 0,
        caloriesBurned: 0,
        activeMinutes: 0,
        currentStreak: 0,
        goalProgress: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/member/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Error fetching member stats:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            title: 'Workouts This Week',
            value: stats.workoutsThisWeek,
            icon: Dumbbell,
            change: '+2',
            color: 'bg-purple-500'
        },
        {
            title: 'Calories Burned',
            value: stats.caloriesBurned,
            icon: Flame,
            change: '+150',
            color: 'bg-orange-500'
        },
        {
            title: 'Active Minutes',
            value: stats.activeMinutes,
            icon: Timer,
            change: '+30',
            color: 'bg-emerald-500'
        },
        {
            title: 'Current Streak',
            value: `${stats.currentStreak} days`,
            icon: TrendingUp,
            change: '',
            color: 'bg-blue-500'
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Member Dashboard</h1>
                <p className="text-slate-600 mt-2">Welcome back, {profile?.fullName || 'Member'}! Keep up the great work!</p>
            </div>

            {/* Goal Progress */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100">Weekly Goal Progress</p>
                            <p className="text-4xl font-bold mt-2">{stats.goalProgress}%</p>
                            <p className="text-indigo-100 text-sm mt-1">Keep going! You're doing great!</p>
                        </div>
                        <Target className="w-16 h-16 text-indigo-300" />
                    </div>
                    <div className="mt-4 bg-white/20 rounded-full h-3">
                        <div
                            className="bg-white rounded-full h-3 transition-all"
                            style={{ width: `${Math.min(stats.goalProgress, 100)}%` }}
                        ></div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                {stat.change && (
                                    <div className="flex items-center gap-1 text-sm text-emerald-600">
                                        <ArrowUpRight className="w-4 h-4" />
                                        {stat.change}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-slate-600">{stat.title}</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    {loading ? '...' : stat.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <a href="/dashboard/member/workouts" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Dumbbell className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">Start a Workout</span>
                        </a>
                        <a href="/dashboard/member/meals" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Utensils className="w-5 h-5 text-orange-600" />
                            <span className="font-medium">Log a Meal</span>
                        </a>
                        <a href="/dashboard/member/progress" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            <span className="font-medium">Track Progress</span>
                        </a>
                        <a href="/dashboard/member/calendar" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">View Calendar</span>
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Dumbbell className="w-5 h-5 text-purple-500" />
                                <div className="flex-1">
                                    <p className="font-medium">No recent workouts</p>
                                    <p className="text-sm text-slate-500">Start your first workout today!</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
