'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Users,
    Dumbbell,
    Utensils,
    TrendingUp,
    Activity,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Shield,
    Settings,
    Database,
    KeyRound,
    BarChart3,
} from 'lucide-react'

interface Stats {
    totalUsers: number
    totalWorkouts: number
    totalMeals: number
    activeUsers: number
    workoutsThisWeek: number
    mealsThisWeek: number
}

export default function AdminDashboardPage() {
    const { profile } = useAuth()
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalWorkouts: 0,
        totalMeals: 0,
        activeUsers: 0,
        workoutsThisWeek: 0,
        mealsThisWeek: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            change: '+12%',
            trend: 'up',
            color: 'bg-blue-500',
        },
        {
            title: 'Active Users',
            value: stats.activeUsers,
            icon: Activity,
            change: '+8%',
            trend: 'up',
            color: 'bg-emerald-500',
        },
        {
            title: 'Workouts This Week',
            value: stats.workoutsThisWeek,
            icon: Dumbbell,
            change: '+24%',
            trend: 'up',
            color: 'bg-purple-500',
        },
        {
            title: 'Meals Logged This Week',
            value: stats.mealsThisWeek,
            icon: Utensils,
            change: '+15%',
            trend: 'up',
            color: 'bg-orange-500',
        },
    ]

    const superadminCards = profile?.role === 'SUPERADMIN'
        ? [
            {
                title: 'System Settings',
                href: '/dashboard/admin/settings',
                icon: Settings,
                color: 'bg-slate-700',
                description: 'Configure system-wide settings',
            },
            {
                title: 'Database Management',
                href: '/dashboard/admin/database',
                icon: Database,
                color: 'bg-indigo-500',
                description: 'Manage database and migrations',
            },
            {
                title: 'API Keys',
                href: '/dashboard/admin/api-keys',
                icon: KeyRound,
                color: 'bg-purple-500',
                description: 'Manage API keys and integrations',
            },
            {
                title: 'System Analytics',
                href: '/dashboard/admin/analytics',
                icon: BarChart3,
                color: 'bg-cyan-500',
                description: 'View detailed system analytics',
            },
        ]
        : []

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 mt-2">Welcome back, {profile?.fullName || 'Admin'}!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {stat.trend === 'up' ? (
                                        <ArrowUpRight className="w-4 h-4" />
                                    ) : (
                                        <ArrowDownRight className="w-4 h-4" />
                                    )}
                                    {stat.change}
                                </div>
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

            {superadminCards.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900">SUPERADMIN Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {superadminCards.map((card, index) => (
                            <a
                                key={index}
                                href={card.href}
                                className={`p-6 rounded-xl ${card.color} text-white hover:opacity-90 transition-all`}
                            >
                                <card.icon className="w-8 h-8 mb-3" />
                                <h3 className="font-bold text-lg">{card.title}</h3>
                                <p className="text-sm opacity-90">{card.description}</p>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <a href="/dashboard/admin/users" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">Manage Users</span>
                        </a>
                        <a href="/dashboard/admin/trainers" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Activity className="w-5 h-5 text-emerald-600" />
                            <span className="font-medium">Manage Trainers</span>
                        </a>
                        <a href="/dashboard/admin/workouts" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Dumbbell className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">View All Workouts</span>
                        </a>
                        <a href="/dashboard/admin/calendar" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Calendar className="w-5 h-5 text-orange-600" />
                            <span className="font-medium">View Calendar</span>
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="font-medium">API Server</span>
                                </div>
                                <span className="text-emerald-600 text-sm">Online</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="font-medium">Database</span>
                                </div>
                                <span className="text-emerald-600 text-sm">Connected</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="font-medium">Authentication</span>
                                </div>
                                <span className="text-emerald-600 text-sm">Active</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}