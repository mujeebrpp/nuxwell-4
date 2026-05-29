'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Waves, Coffee, Award, TrendingUp, Calendar } from 'lucide-react'

interface AnalyticsData {
    activeMemberships: number
    poolBookings: number
    poolOccupancy: number
    teaBookings: number
    events: number
    totalRevenue: number
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData>({
        activeMemberships: 0,
        poolBookings: 0,
        poolOccupancy: 0,
        teaBookings: 0,
        events: 0,
        totalRevenue: 0
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/analytics')
                if (response.ok) {
                    const analyticsData = await response.json()
                    setData(analyticsData)
                }
            } catch (error) {
                console.error('Error fetching analytics:', error)
            }
        }
        fetchData()
    }, [])

    const metrics = [
        { label: 'Active Memberships', value: data.activeMemberships, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Pool Bookings', value: data.poolBookings, icon: Waves, color: 'text-cyan-600', bg: 'bg-cyan-100' },
        { label: 'Tea Bookings', value: data.teaBookings, icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Total Events', value: data.events, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Analytics</h1>
                <p className="text-slate-600 mt-1">View your wellness metrics and progress</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${metric.bg}`}>
                                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                                    <p className="text-sm text-slate-600">{metric.label}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Wellness Score Chart Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Wellness Score History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-12 w-12 text-slate-300" />
                        <p className="text-slate-500 ml-3">Chart visualization coming soon</p>
                    </div>
                </CardContent>
            </Card>

            {/* Membership Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Membership Types</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Family Memberships</span>
                                <span className="text-sm text-slate-600">65%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full">
                                <div className="h-full w-[65%] bg-emerald-600 rounded-full" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Individual Memberships</span>
                                <span className="text-sm text-slate-600">35%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full">
                                <div className="h-full w-[35%] bg-blue-600 rounded-full" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}