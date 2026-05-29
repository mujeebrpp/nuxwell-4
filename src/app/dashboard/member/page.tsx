'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Waves,
    Coffee,
    Award,
    Users,
    Calendar,
    QrCode,
    Flame,
    Plus,
    Dumbbell
} from 'lucide-react'

interface MemberStats {
    poolVisits: number
    teaVisits: number
    rewardPoints: number
    wellnessScore: number
    upcomingBookings: number
}

interface UpcomingBooking {
    id: string
    type: string
    date: string
    time: string
}

export default function MemberDashboardPage() {
    const { profile } = useAuth()
    const [stats, setStats] = useState<MemberStats>({
        poolVisits: 0,
        teaVisits: 0,
        rewardPoints: 0,
        wellnessScore: 0,
        upcomingBookings: 0,
    })
    const [loading, setLoading] = useState(true)
    const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/member/stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats({
                        poolVisits: data.poolVisits || 0,
                        teaVisits: data.teaVisits || 0,
                        rewardPoints: data.rewardPoints || 0,
                        wellnessScore: data.wellnessScore || 78,
                        upcomingBookings: data.upcomingBookings || 0,
                    })
                }

// Fetch upcoming bookings
                 const bookingsResponse = await fetch('/api/pool-bookings?upcoming=true')
                 const teaBookingsResponse = await fetch('/api/tea-bookings?upcoming=true')

                 let bookingsList: UpcomingBooking[] = []
                 if (bookingsResponse.ok) {
                     const bookingsData = await bookingsResponse.json()
                     bookingsList = bookingsData.slice(0, 3).map((b: Record<string, unknown>) => ({
                         id: b.id as string,
                         type: 'Pool Booking',
                         date: new Date(b.date as string).toLocaleDateString(),
                         time: new Date(b.startTime as string).toLocaleTimeString()
                     })) || []
                 }

                 if (teaBookingsResponse.ok) {
                     const teaData = await teaBookingsResponse.json()
                     const teaBookings = teaData.slice(0, 3).map((b: Record<string, unknown>) => ({
                         id: b.id as string,
                         type: 'Tea Booking',
                         date: new Date(b.date as string).toLocaleDateString(),
                         time: new Date(b.startTime as string).toLocaleTimeString()
                     })) || []
                     bookingsList = [...bookingsList, ...teaBookings].slice(0, 3)
                 }

                 setUpcomingBookings(bookingsList)
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Welcome back, {profile?.fullName?.split(' ')[0] || 'Member'}!</h1>
                <p className="text-slate-600 mt-1">Your wellness journey continues today</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Waves className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="text-sm opacity-90">Pool Visits</p>
                                <p className="text-2xl font-bold">{loading ? '...' : stats.poolVisits}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Coffee className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="text-sm opacity-90">Tea Visits</p>
                                <p className="text-2xl font-bold">{loading ? '...' : stats.teaVisits}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Award className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="text-sm opacity-90">Reward Points</p>
                                <p className="text-2xl font-bold">{loading ? '...' : stats.rewardPoints}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Flame className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="text-sm opacity-90">Wellness Score</p>
                                <p className="text-2xl font-bold">{loading ? '...' : stats.wellnessScore}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-8 w-8 opacity-80" />
                            <div>
                                <p className="text-sm opacity-90">Bookings</p>
                                <p className="text-2xl font-bold">{loading ? '...' : stats.upcomingBookings}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a href="/dashboard/pools">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <Waves className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                                <h3 className="font-medium text-slate-900">Book Pool</h3>
                                <p className="text-xs text-slate-500 mt-1">Reserve a lane</p>
                            </CardContent>
                        </Card>
                    </a>

                    <a href="/dashboard/tea">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <Coffee className="h-12 w-12 mx-auto text-amber-600 mb-3" />
                                <h3 className="font-medium text-slate-900">Tea Hub</h3>
                                <p className="text-xs text-slate-500 mt-1">Reserve table</p>
                            </CardContent>
                        </Card>
                    </a>

                    <a href="/dashboard/workouts">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <Dumbbell className="h-12 w-12 mx-auto text-purple-600 mb-3" />
                                <h3 className="font-medium text-slate-900">AI Workouts</h3>
                                <p className="text-xs text-slate-500 mt-1">Track exercises</p>
                            </CardContent>
                        </Card>
                    </a>

                    <a href="/dashboard/family">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <Users className="h-12 w-12 mx-auto text-emerald-600 mb-3" />
                                <h3 className="font-medium text-slate-900">My Family</h3>
                                <p className="text-xs text-slate-500 mt-1">Manage members</p>
                            </CardContent>
                        </Card>
                    </a>

                    <a href="/dashboard/qr">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <QrCode className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                                <h3 className="font-medium text-slate-900">QR Services</h3>
                                <p className="text-xs text-slate-500 mt-1">Check-in, lockers</p>
                            </CardContent>
                        </Card>
                    </a>

                    <a href="/dashboard/rewards">
                        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <Award className="h-12 w-12 mx-auto text-yellow-600 mb-3" />
                                <h3 className="font-medium text-slate-900">Rewards</h3>
                                <p className="text-xs text-slate-500 mt-1">Redeem points</p>
                            </CardContent>
                        </Card>
                    </a>
                </div>
            </div>

            {/* Upcoming Bookings */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <a href="/dashboard/pools">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            View All
                        </Button>
                    </a>
                </CardHeader>
                <CardContent>
                    {upcomingBookings.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                                        <Calendar className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{booking.type}</p>
                                        <p className="text-sm text-slate-500">{booking.date} at {booking.time}</p>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-600 font-medium">No upcoming bookings</p>
                            <p className="text-sm text-slate-500 mt-1">Book a pool or tea table to get started</p>
                            <a href="/dashboard/pools" className="mt-4 inline-block">
                                <Button className="bg-emerald-600 hover:bg-emerald-700">Book Now</Button>
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Wellness Score Progress */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-slate-900">Wellness Progress</h3>
                            <p className="text-sm text-slate-600">Daily wellness score</p>
                        </div>
                        <span className="text-3xl font-bold text-emerald-600">{stats.wellnessScore}</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all"
                            style={{ width: `${stats.wellnessScore}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}