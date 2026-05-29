'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Waves } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

interface Pool {
    id: string
    name: string
    type: string
    length: number
    width: number
    depth: number
    capacity: number
    lanes: PoolLane[]
}

interface PoolLane {
    id: string
    laneNumber: number
    status: string
}

interface Family {
    id: string
    name: string
}

export default function PoolBookingPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <PoolBookingForm />
        </Suspense>
    )
}

function PoolBookingForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, familyMembers, families } = useAuth()
    const preselectedPool = searchParams.get('pool')

    const [pools, setPools] = useState<Pool[]>([])
    const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
    const [selectedLane, setSelectedLane] = useState<PoolLane | null>(null)
    const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [startTime, setStartTime] = useState('08:00')
    const [endTime, setEndTime] = useState('09:00')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPools = async () => {
            try {
                const res = await fetch('/api/pools')
                if (res.ok) {
                    const data = await res.json()
                    setPools(data)
                    if (preselectedPool) {
                        const pool = data.find((p: Pool) => p.id === preselectedPool)
                        if (pool) setSelectedPool(pool)
                    }
                }
            } catch (err) {
                setError('Failed to load pools')
            }
        }
        fetchPools()
    }, [preselectedPool])

    const availableLanes = selectedPool?.lanes.filter(l => l.status === 'available') || []

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

        if (!selectedPool || !startTime || !endTime) {
            setError('Please select pool, date and time')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/pool-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    familyId,
                    poolId: selectedPool.id,
                    laneId: selectedLane?.id,
                    date,
                    startTime: new Date(`${date}T${startTime}`).toISOString(),
                    endTime: new Date(`${date}T${endTime}`).toISOString(),
                }),
            })

            if (res.ok) {
                router.push('/dashboard/pools')
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to book pool')
            }
        } catch {
            setError('Failed to book pool')
        } finally {
            setLoading(false)
        }
    }

    const poolLabels = {
        large_lap: 'Large Lap Pool',
        small_lap: 'Therapy Pool',
        kids: 'Kids Pool'
    }

    const userFamilies = families || []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Pool Booking</h1>
                <p className="text-slate-600 mt-1">Reserve lanes for your swim sessions</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Waves className="h-5 w-5 text-emerald-600" />
                        Swim Lane Reservation
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
                                <Label htmlFor="pool">Pool</Label>
                                <select
                                    id="pool"
                                    value={selectedPool?.id || ''}
                                    onChange={(e) => {
                                        const pool = pools.find(p => p.id === e.target.value)
                                        setSelectedPool(pool || null)
                                        setSelectedLane(null)
                                    }}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select Pool</option>
                                    {pools.map((pool) => (
                                        <option key={pool.id} value={pool.id}>
                                            {pool.name} ({poolLabels[pool.type as keyof typeof poolLabels]})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lane">Lane (Optional)</Label>
                                <select
                                    id="lane"
                                    value={selectedLane?.id || ''}
                                    onChange={(e) => {
                                        const lane = availableLanes.find(l => l.id === e.target.value)
                                        setSelectedLane(lane || null)
                                    }}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={!selectedPool}
                                >
                                    <option value="">Any Available Lane</option>
                                    {availableLanes.map((lane) => (
                                        <option key={lane.id} value={lane.id}>
                                            Lane {lane.laneNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

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
                                <Label htmlFor="family">Family (Optional)</Label>
                                <select
                                    id="family"
                                    value={selectedFamily?.id || ''}
                                    onChange={(e) => setSelectedFamily(userFamilies.find(f => f.id === e.target.value) || null)}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Individual Booking</option>
                                    {userFamilies.map((family) => (
                                        <option key={family.id} value={family.id}>
                                            {family.name}
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

                        <Button
                            type="submit"
                            disabled={loading || !selectedPool}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? 'Booking...' : 'Confirm Booking'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}