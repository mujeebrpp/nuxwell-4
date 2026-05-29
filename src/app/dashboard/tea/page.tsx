'use client'

import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coffee, Calendar, Users, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'

interface TeaTable {
    id: string
    tableNumber: number
    capacity: number
    location: string
    status: string
}

interface TeaBooking {
    id: string
    date: string
    startTime: string
    endTime: string
    groupSize: number
    status: string
    table: { tableNumber: number }
    family?: { name: string }
}

export default function TeaPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <TeaDashboard />
        </Suspense>
    )
}

function TeaDashboard() {
    const { families } = useAuth()
    const [tables, setTables] = useState<TeaTable[]>([])
    const [bookings, setBookings] = useState<TeaBooking[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'tables' | 'bookings'>('tables')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tablesRes, bookingsRes] = await Promise.all([
                    fetch('/api/tea-tables'),
                    fetch('/api/tea-bookings')
                ])
                if (tablesRes.ok) {
                    const data = await tablesRes.json()
                    setTables(data)
                }
                if (bookingsRes.ok) {
                    const data = await bookingsRes.json()
                    setBookings(data)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            case 'completed': return 'bg-slate-100 text-slate-600'
            default: return 'bg-amber-100 text-amber-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Tea Hub</h1>
                    <p className="text-slate-600 mt-1">Reserve tables for family gatherings and refreshments</p>
                </div>
                <Link href="/dashboard/tea/book">
                    <Button className="bg-amber-600 hover:bg-amber-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Book Table
                    </Button>
                </Link>
            </div>

            <div className="flex gap-2 mb-4">
                <Button
                    variant={activeTab === 'tables' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('tables')}
                >
                    Tables
                </Button>
                <Button
                    variant={activeTab === 'bookings' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('bookings')}
                >
                    My Bookings
                </Button>
            </div>

            {activeTab === 'tables' ? (
                loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-32 bg-slate-200 rounded-lg" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tables.map((table) => (
                            <Card key={table.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Table {table.tableNumber}</CardTitle>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            table.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                            table.status === 'reserved' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                            {table.status}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-slate-400" />
                                            <span>Seats {table.capacity}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Coffee className="h-4 w-4 text-slate-400" />
                                            <span className="capitalize">{table.location}</span>
                                        </div>
                                    </div>
                                    {table.status === 'available' && (
                                        <Link href={`/dashboard/tea/book?table=${table.id}`} className="mt-4 block">
                                            <Button variant="outline" size="sm" className="w-full">
                                                Reserve
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
            ) : (
                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600 font-medium">No bookings yet</p>
                                <p className="text-sm text-slate-500 mt-1">Make your first reservation!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        bookings.map((booking) => (
                            <Card key={booking.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">
                                            Table {booking.table?.tableNumber || 'N/A'} • {booking.groupSize} people
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(booking.date).toLocaleDateString()} • {booking.startTime} - {booking.endTime}
                                        </p>
                                        {booking.family && (
                                            <p className="text-sm text-amber-600">Family: {booking.family.name}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}