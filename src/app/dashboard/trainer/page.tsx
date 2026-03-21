'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Users,
    Dumbbell,
    Utensils,
    TrendingUp,
    Calendar,
    Clock,
    ArrowUpRight
} from 'lucide-react'

interface TrainerStats {
    totalClients: number
    activeClients: number
    workoutsAssigned: number
    mealPlansCreated: number
    sessionsThisWeek: number
    upcomingSessions: number
}

export default function TrainerDashboardPage() {
    const { profile } = useAuth()
    const [stats, setStats] = useState<TrainerStats>({
        totalClients: 0,
        activeClients: 0,
        workoutsAssigned: 0,
        mealPlansCreated: 0,
        sessionsThisWeek: 0,
        upcomingSessions: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/trainer/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Error fetching trainer stats:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            title: 'Total Clients',
            value: stats.totalClients,
            icon: Users,
            change: '+5%',
            color: 'bg-blue-500'
        },
        {
            title: 'Active Clients',
            value: stats.activeClients,
            icon: TrendingUp,
            change: '+12%',
            color: 'bg-emerald-500'
        },
        {
            title: 'Workouts Assigned',
            value: stats.workoutsAssigned,
            icon: Dumbbell,
            change: '+8%',
            color: 'bg-purple-500'
        },
        {
            title: 'Upcoming Sessions',
            value: stats.upcomingSessions,
            icon: Calendar,
            change: '',
            color: 'bg-orange-500'
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Trainer Dashboard</h1>
                <p className="text-slate-600 mt-2">Welcome back, {profile?.fullName || 'Trainer'}!</p>
            </div>

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

            {/* Quick Actions & Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <a href="/dashboard/trainer/clients" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Users className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">View My Clients</span>
                        </a>
                        <a href="/dashboard/trainer/workouts" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Dumbbell className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">Create Workout Plan</span>
                        </a>
                        <a href="/dashboard/trainer/meals" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Utensils className="w-5 h-5 text-orange-600" />
                            <span className="font-medium">Create Meal Plan</span>
                        </a>
                        <a href="/dashboard/trainer/calendar" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            <span className="font-medium">View Schedule</span>
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <div className="flex-1">
                                    <p className="font-medium">No sessions scheduled</p>
                                    <p className="text-sm text-slate-500">Your schedule is clear for today</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
