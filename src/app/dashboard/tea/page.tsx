'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coffee, Calendar, Users, Clock, CheckCircle } from 'lucide-react'

interface TeaTable {
    id: string
    name: string
    tableNumber: number
    capacity: number
    location: string
    status: string
}

export default function TeaPage() {
    const [tables, setTables] = useState<TeaTable[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await fetch('/api/tea-tables')
                if (response.ok) {
                    const data = await response.json()
                    setTables(data)
                }
            } catch (error) {
                console.error('Error fetching tea tables:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTables()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Tea Hub</h1>
                    <p className="text-slate-600 mt-1">Reserve tables for family gatherings and refreshments</p>
                </div>
                <a href="/dashboard/tea/book">
                    <Button className="bg-amber-600 hover:bg-amber-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Table
                    </Button>
                </a>
            </div>

            {loading ? (
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
                <>
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
                                        <a href={`/dashboard/tea/book?table=${table.id}`} className="mt-4 block">
                                            <Button variant="outline" size="sm" className="w-full">
                                                Reserve
                                            </Button>
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {tables.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Coffee className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600 font-medium">No tables available</p>
                                <p className="text-sm text-slate-500 mt-1">Check back later or contact staff</p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}