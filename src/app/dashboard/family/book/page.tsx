'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Users, Waves, Coffee, Dumbbell, Plus, Minus } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

interface Pool {
     id: string
     name: string
     type: string
     length: number
     width: number
     depth: number
     capacity: number
     lanes: { id: string; laneNumber: number; status: string }[]
}

interface TeaTable {
     id: string
     tableNumber: number
     capacity: number
     location: string
     status: string
}

interface WorkoutPlace {
     id: string
     name: string
     capacity: number
     location: string
     status: string
}

interface Family {
    id: string
    name: string
}

export default function FamilyBookingPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
            <FamilyBookingForm />
        </Suspense>
    )
}

function FamilyBookingForm() {
    const router = useRouter()
    const { user, families } = useAuth()
    
const [pools, setPools] = useState<Pool[]>([])
     const [tables, setTables] = useState<TeaTable[]>([])
     const [workoutPlaces, setWorkoutPlaces] = useState<WorkoutPlace[]>([])
     const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
     const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
     const [selectedPoolLane, setSelectedPoolLane] = useState<string | null>(null)
     const [selectedTable, setSelectedTable] = useState<TeaTable | null>(null)
     const [selectedWorkoutPlace, setSelectedWorkoutPlace] = useState<WorkoutPlace | null>(null)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [startTime, setStartTime] = useState('10:00')
    const [endTime, setEndTime] = useState('12:00')
    const [groupSize, setGroupSize] = useState(4)
    const [specialRequest, setSpecialRequest] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

useEffect(() => {
         const fetchData = async () => {
             try {
                 const [poolsRes, tablesRes, workoutPlacesRes] = await Promise.all([
                     fetch('/api/pools'),
                     fetch('/api/tea-tables'),
                     fetch('/api/workout-places')
                 ])
                 if (poolsRes.ok) setPools(await poolsRes.json())
                 if (tablesRes.ok) setTables(await tablesRes.json())
                 if (workoutPlacesRes.ok) setWorkoutPlaces(await workoutPlacesRes.json())
             } catch (err) {
                 setError('Failed to load data')
             }
         }
         fetchData()
     }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!selectedFamily) {
            setError('Please select a family account')
            setLoading(false)
            return
        }

try {
             const res = await fetch('/api/family-bookings', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     familyId: selectedFamily.id,
                     date,
                     startTime: new Date(`${date}T${startTime}`).toISOString(),
                     endTime: new Date(`${date}T${endTime}`).toISOString(),
                     groupSize,
                     poolId: selectedPool?.id,
                     poolLaneId: selectedPoolLane,
                     teaTableId: selectedTable?.id,
                     workoutPlaceId: selectedWorkoutPlace?.id,
                     specialRequest: specialRequest || undefined,
                 }),
             })

            if (res.ok) {
                router.push('/dashboard/family')
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to create family booking')
            }
        } catch {
            setError('Failed to create family booking')
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
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Family Group Booking</h1>
                <p className="text-slate-600 mt-1">Book pool, tea table, and workout place for your family (4-8 people)</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Family Activity Booking
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="family">Family Account *</Label>
                                <select
                                    id="family"
                                    value={selectedFamily?.id || ''}
                                    onChange={(e) => setSelectedFamily(userFamilies.find(f => f.id === e.target.value) || null)}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="">Select Family</option>
                                    {userFamilies.map((family) => (
                                        <option key={family.id} value={family.id}>
                                            {family.name} (Family Group)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time *</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time *</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Group Size (4-8 people) *</Label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setGroupSize(Math.max(4, groupSize - 1))}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                                    disabled={groupSize <= 4}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-xl font-bold text-slate-900 w-12 text-center">{groupSize}</span>
                                <button
                                    type="button"
                                    onClick={() => setGroupSize(Math.min(8, groupSize + 1))}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                                    disabled={groupSize >= 8}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

<div className="border-t pt-4">
                             <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                 <Waves className="h-4 w-4 text-blue-500" />
                                 Pool Selection (Optional)
                             </h3>
                             <select
                                 value={selectedPool?.id || ''}
                                 onChange={(e) => setSelectedPool(pools.find(p => p.id === e.target.value) || null)}
                                 className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                             >
                                 <option value="">No Pool Selected</option>
                                 {pools.map((pool) => (
                                     <option key={pool.id} value={pool.id}>
                                         {pool.name} ({poolLabels[pool.type as keyof typeof poolLabels]}) - {pool.capacity} capacity
                                     </option>
                                 ))}
                             </select>
                             {selectedPool && (
                                 <select
                                     value={selectedPoolLane || ''}
                                     onChange={(e) => setSelectedPoolLane(e.target.value || null)}
                                     className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                 >
                                     <option value="">Any Lane</option>
                                     {selectedPool.lanes.map((lane) => (
                                         <option key={lane.id} value={lane.id}>
                                             Lane {lane.laneNumber} ({lane.status})
                                         </option>
                                     ))}
                                 </select>
                             )}
                         </div>

                        <div className="border-t pt-4">
                            <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                <Coffee className="h-4 w-4 text-amber-500" />
                                Tea Table Selection (Optional)
                            </h3>
                            <select
                                value={selectedTable?.id || ''}
                                onChange={(e) => setSelectedTable(tables.find(t => t.id === e.target.value) || null)}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">No Tea Table Selected</option>
                                {tables.map((table) => (
                                    <option key={table.id} value={table.id}>
                                        Table {table.tableNumber} ({table.capacity} seats) - {table.location}
                                    </option>
                                ))}
                            </select>
                        </div>

<div className="border-t pt-4">
                             <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                 <Dumbbell className="h-4 w-4 text-purple-500" />
                                 Workout Place Selection (Optional)
                             </h3>
                             <select
                                 value={selectedWorkoutPlace?.id || ''}
                                 onChange={(e) => setSelectedWorkoutPlace(workoutPlaces.find(wp => wp.id === e.target.value) || null)}
                                 className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                             >
                                 <option value="">No Workout Place Selected</option>
                                 {workoutPlaces.map((wp) => (
                                     <option key={wp.id} value={wp.id}>
                                         {wp.name} - {wp.location} ({wp.capacity} capacity)
                                     </option>
                                 ))}
                             </select>
                             <p className="text-xs text-slate-500 mt-1">
                                 Dedicated trainers are optional and shared among multiple families.
                             </p>
                         </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialRequest">Special Request</Label>
                            <textarea
                                id="specialRequest"
                                placeholder="Any special requirements for your family session..."
                                value={specialRequest}
                                onChange={(e) => setSpecialRequest(e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

<div className="bg-emerald-50 p-4 rounded-lg">
                             <h4 className="font-medium text-emerald-900 mb-2">Booking Summary</h4>
                             <ul className="text-sm text-emerald-700 space-y-1">
                                 <li>• Family group: {groupSize} people</li>
                                 <li>• Pool access: {selectedPool ? selectedPool.name : 'Not selected'}{selectedPoolLane && ` (Lane ${selectedPool?.lanes.find(l => l.id === selectedPoolLane)?.laneNumber})`}</li>
                                 <li>• Tea table: {selectedTable ? `Table ${selectedTable.tableNumber}` : 'Not selected'}</li>
                                 <li>• Workout place: {selectedWorkoutPlace ? selectedWorkoutPlace.name : 'Not selected'}</li>
                                 <li>• Dedicated trainer: Optional (shared with other families)</li>
                             </ul>
                         </div>

                        <Button
                            type="submit"
                            disabled={loading || !selectedFamily}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? 'Booking...' : 'Confirm Family Booking'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}