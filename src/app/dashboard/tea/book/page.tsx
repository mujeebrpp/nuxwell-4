'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectLabel } from '@/components/ui/select'
import { Calendar, Coffee, Plus } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

interface TeaTable {
    id: string
    tableNumber: number
    capacity: number
    location: string
    status: string
}

interface Family {
    id: string
    name: string
}

export default function TeaBookingPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <TeaBookingForm />
        </Suspense>
    )
}

function TeaBookingForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, familyMembers, families } = useAuth()
    const preselectedTable = searchParams.get('table')

    const [tables, setTables] = useState<TeaTable[]>([])
    const [selectedTable, setSelectedTable] = useState<TeaTable | null>(null)
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [startTime, setStartTime] = useState('18:00')
    const [endTime, setEndTime] = useState('20:00')
    const [groupSize, setGroupSize] = useState(2)
    const [specialRequest, setSpecialRequest] = useState('')
    const [depositAmount, setDepositAmount] = useState(0)
    const [depositPaid, setDepositPaid] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const res = await fetch('/api/tea-tables')
                if (res.ok) {
                    const data = await res.json()
                    const available = data.filter((t: TeaTable) => t.status === 'available')
                    setTables(available)
                    if (preselectedTable) {
                        const table = available.find((t: TeaTable) => t.id === preselectedTable)
                        if (table) setSelectedTable(table)
                    }
                }
            } catch (err) {
                setError('Failed to load tables')
            }
        }
        fetchTables()
    }, [preselectedTable])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const userId = user?.id
        const familyId = selectedFamily?.id

        if (!userId && !familyId) {
            setError('Please log in or select a family')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/tea-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    familyId,
                    tableId: selectedTable?.id,
                    date,
                    startTime: new Date(`${date}T${startTime}`).toISOString(),
                    endTime: new Date(`${date}T${endTime}`).toISOString(),
                    groupSize,
                    specialRequest: specialRequest || undefined,
                    depositAmount: depositAmount || undefined,
                    depositPaid,
                }),
            })

            if (res.ok) {
                router.push('/dashboard/tea')
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to book table')
            }
        } catch {
            setError('Failed to book table')
        } finally {
            setLoading(false)
        }
    }

    const userFamilies = families || []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Book Tea Table</h1>
                <p className="text-slate-600 mt-1">Reserve a table for your family gathering</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coffee className="h-5 w-5 text-amber-600" />
                        Tea Reservation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="table">Table</Label>
                                <select
                                    id="table"
                                    value={selectedTable?.id || ''}
                                    onChange={(e) => setSelectedTable(tables.find(t => t.id === e.target.value) || null)}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select Table</option>
                                    {tables.map((table) => (
                                        <option key={table.id} value={table.id}>
                                            Table {table.tableNumber} ({table.capacity} seats) - {table.location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="groupSize">Group Size</Label>
                                <Input
                                    id="groupSize"
                                    type="number"
                                    min="1"
                                    value={groupSize}
                                    onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="family">Family (Optional)</Label>
                                <select
                                    id="family"
                                    value={selectedFamily?.id || ''}
                                    onChange={(e) => setSelectedFamily(userFamilies.find(f => f.id === e.target.value) || null)}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select Family</option>
                                    {userFamilies.map((family) => (
                                        <option key={family.id} value={family.id}>
                                            {family.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialRequest">Special Request</Label>
                            <Textarea
                                id="specialRequest"
                                placeholder="Any dietary requirements or special arrangements..."
                                value={specialRequest}
                                onChange={(e) => setSpecialRequest(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                            <Input
                                id="depositAmount"
                                type="number"
                                min="0"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="depositPaid"
                                checked={depositPaid}
                                onChange={(e) => setDepositPaid(e.target.checked)}
                            />
                            <Label htmlFor="depositPaid" className="text-sm">Deposit paid</Label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !selectedTable}
                            className="w-full bg-amber-600 hover:bg-amber-700"
                        >
                            {loading ? 'Booking...' : 'Confirm Booking'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}