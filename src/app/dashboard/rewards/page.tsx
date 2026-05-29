'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, Coffee, Waves, Ticket, Gift, ShoppingBag } from 'lucide-react'

interface RewardPoint {
    id: string
    points: number
    type: string
    createdAt: string
}

export default function RewardsPage() {
    const [points, setPoints] = useState<RewardPoint[]>([])
    const [totalPoints, setTotalPoints] = useState(0)

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const response = await fetch('/api/rewards')
                if (response.ok) {
                    const data = await response.json()
                    setPoints(data)
                    setTotalPoints(data.reduce((sum: number, r: RewardPoint) => sum + r.points, 0))
                }
            } catch (error) {
                console.error('Error fetching rewards:', error)
            }
        }
        fetchPoints()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Rewards</h1>
                <p className="text-slate-600 mt-1">Earn points and redeem for rewards</p>
            </div>

            {/* Total Points Card */}
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100">Your Points Balance</p>
                            <p className="text-5xl font-bold mt-2">{totalPoints || 0}</p>
                        </div>
                        <Award className="h-20 w-20 text-emerald-300 opacity-50" />
                    </div>
                </CardContent>
            </Card>

            {/* Redeem Options */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Redeem Points</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Coffee className="h-12 w-12 mx-auto text-amber-600 mb-3" />
                            <h3 className="font-semibold text-slate-900">Free Tea</h3>
                            <p className="text-sm text-slate-600 mt-1">150 points</p>
                            <Button variant="outline" size="sm" className="mt-4 w-full">
                                Redeem
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Waves className="h-12 w-12 mx-auto text-blue-600 mb-3" />
                            <h3 className="font-semibold text-slate-900">Free Pool Session</h3>
                            <p className="text-sm text-slate-600 mt-1">200 points</p>
                            <Button variant="outline" size="sm" className="mt-4 w-full">
                                Redeem
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Ticket className="h-12 w-12 mx-auto text-purple-600 mb-3" />
                            <h3 className="font-semibold text-slate-900">Event Ticket</h3>
                            <p className="text-sm text-slate-600 mt-1">300 points</p>
                            <Button variant="outline" size="sm" className="mt-4 w-full">
                                Redeem
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Gift className="h-12 w-12 mx-auto text-pink-600 mb-3" />
                            <h3 className="font-semibold text-slate-900">Merchandise</h3>
                            <p className="text-sm text-slate-600 mt-1">500 points</p>
                            <Button variant="outline" size="sm" className="mt-4 w-full">
                                Redeem
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <ShoppingBag className="h-12 w-12 mx-auto text-emerald-600 mb-3" />
                            <h3 className="font-semibold text-slate-900">Membership Discount</h3>
                            <p className="text-sm text-slate-600 mt-1">1000 points</p>
                            <Button variant="outline" size="sm" className="mt-4 w-full">
                                Redeem
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}