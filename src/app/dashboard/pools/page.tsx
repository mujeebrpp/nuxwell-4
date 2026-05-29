'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Waves, Calendar, Users, Clock, CheckCircle } from 'lucide-react'

interface Pool {
    id: string
    name: string
    type: string
    length: number
    width: number
    depth: number
    capacity: number
    _count?: { lanes: number }
}

export default function PoolsPage() {
    const [pools, setPools] = useState<Pool[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPools = async () => {
            try {
                const response = await fetch('/api/pools')
                if (response.ok) {
                    const data = await response.json()
                    setPools(data)
                }
            } catch (error) {
                console.error('Error fetching pools:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPools()
    }, [])

    const poolLabels = {
        large_lap: 'Large Lap Pool',
        small_lap: 'Therapy Pool',
        kids: 'Kids Pool'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Pool Booking</h1>
                    <p className="text-slate-600 mt-1">Reserve lanes for your swim sessions</p>
                </div>
                <a href="/dashboard/member/book-pool">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now
                    </Button>
                </a>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-48 bg-slate-200 rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pools.map((pool) => (
                            <Card key={pool.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${
                                            pool.type === 'large_lap' ? 'bg-blue-100 text-blue-600' :
                                            pool.type === 'small_lap' ? 'bg-teal-100 text-teal-600' :
                                            'bg-amber-100 text-amber-600'
                                        }`}>
                                            <Waves className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{pool.name}</CardTitle>
                                            <p className="text-sm text-slate-500">{poolLabels[pool.type as keyof typeof poolLabels]}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Dimensions</span>
                                            <span className="font-medium">{pool.length}m × {pool.width}m × {pool.depth}m</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Capacity</span>
                                            <span className="font-medium">{pool.capacity} people</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Available Lanes</span>
                                            <span className="font-medium">{pool._count?.lanes || 8}</span>
                                        </div>
                                    </div>
                                    <a href={`/dashboard/pools/book?pool=${pool.id}`} className="mt-4 block">
                                        <Button variant="outline" className="w-full">
                                            Check Availability
                                        </Button>
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {pools.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Waves className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600 font-medium">No pools available</p>
                                <p className="text-sm text-slate-500 mt-1">Contact administration to set up pools</p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}