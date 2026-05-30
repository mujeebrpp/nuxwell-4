'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, Search, Coffee } from 'lucide-react'

interface Booking {
    id: string
    bookingType: 'pool' | 'tea' | 'poll'
    status: string
    date: Date
    startTime: Date
    endTime: Date
    user: {
        fullName: string | null
        email: string
    }
    pool?: { name: string }
    table?: { tableNumber: number }
    poll?: { name: string }
    family?: { name: string }
    membership?: { type: string }
    groupSize?: number
    specialRequest?: string
}

const statusConfig: Record<string, { color: string; label: string }> = {
    confirmed: { color: 'bg-emerald-100 text-emerald-800', label: 'Confirmed' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    completed: { color: 'bg-slate-100 text-slate-800', label: 'Completed' },
    no_show: { color: 'bg-orange-100 text-orange-800', label: 'No Show' },
}

const getStatusInfo = (status: string) => {
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status.replace('_', ' ') }
}

export default function AdminBookingsPage() {
    const { profile } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/admin/bookings')
            if (response.ok) {
                const data = await response.json()
                setBookings(data)
            } else if (response.status === 401 || response.status === 403) {
                console.error('Access denied: You do not have permission to view bookings')
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                console.error('Failed to fetch bookings:', response.status, errorData)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (bookingId: string, type: string, newStatus: string) => {
        try {
            const response = await fetch('/api/admin/bookings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: bookingId, type, status: newStatus }),
            })
            if (!response.ok) {
                console.error('Failed to update status')
                return
            }
            setBookings(bookings.map(b => 
                b.id === bookingId ? { ...b, status: newStatus } : b
            ))
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = searchTerm === '' || 
            booking.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.pool?.name && booking.pool.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (booking.table && `Table ${booking.table.tableNumber}`.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesType = filterType === 'all' || booking.bookingType === filterType
        const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
        return matchesSearch && matchesType && matchesStatus
    })

    const getBookingIcon = (type: string) => {
        switch (type) {
            case 'pool': return Calendar
            case 'tea': return Coffee
            default: return Calendar
        }
    }

    const formatTime = (date: Date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Booking Management</h1>
                <p className="text-slate-600 mt-2">Welcome back, {(profile?.fullName || profile?.email?.split('@')[0] || 'Admin')}!</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="rounded-lg border-slate-200 px-3 py-2 text-sm"
                >
                    <option value="all">All Types</option>
                    <option value="pool">Pool</option>
                    <option value="tea">Tea</option>
                    <option value="poll">Poll</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-lg border-slate-200 px-3 py-2 text-sm"
                >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                    <option value="no_show">No Show</option>
                </select>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No bookings found</div>
                ) : (
                    filteredBookings.map((booking) => {
                        const Icon = getBookingIcon(booking.bookingType)
                        const statusInfo = getStatusInfo(booking.status)
                        
                        return (
                            <Card key={booking.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                booking.bookingType === 'pool' ? 'bg-blue-100' : 
                                                booking.bookingType === 'tea' ? 'bg-amber-100' : 'bg-purple-100'
                                            }`}>
                                                <Icon className={`w-6 h-6 ${
                                                    booking.bookingType === 'pool' ? 'text-blue-600' : 
                                                    booking.bookingType === 'tea' ? 'text-amber-600' : 'text-purple-600'
                                                }`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {(booking.user.fullName || booking.user.email.split('@')[0]) ?? 'Unknown'}
                                                </p>
                                                <p className="text-sm text-slate-500">{booking.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-medium text-slate-900">
                                                    {booking.pool?.name || 
                                                     (booking.table && `Table ${booking.table.tableNumber}`) || 
                                                     booking.poll?.name || 
                                                     booking.family?.name || 'N/A'}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge className={statusInfo.color}>
                                                    {statusInfo.label}
                                                </Badge>
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) => handleStatusChange(booking.id, booking.bookingType, e.target.value)}
                                                    className="text-xs rounded border-slate-200 px-2 py-1"
                                                >
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="no_show">No Show</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    {booking.specialRequest && (
                                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                            <p className="text-sm text-slate-600">
                                                <strong>Special Request:</strong> {booking.specialRequest}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}