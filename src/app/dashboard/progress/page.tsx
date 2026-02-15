'use client'

import { useState } from 'react'
import { TrendingUp, Scale, Ruler, Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'

const weightData = [
    { date: 'Feb 1', weight: 180 },
    { date: 'Feb 3', weight: 179 },
    { date: 'Feb 5', weight: 178 },
    { date: 'Feb 7', weight: 177 },
    { date: 'Feb 9', weight: 177 },
    { date: 'Feb 11', weight: 176 },
    { date: 'Feb 13', weight: 175 },
    { date: 'Feb 15', weight: 174 },
]

const workoutData = [
    { date: 'Mon', workouts: 1, calories: 250 },
    { date: 'Tue', workouts: 2, calories: 520 },
    { date: 'Wed', workouts: 1, calories: 300 },
    { date: 'Thu', workouts: 2, calories: 480 },
    { date: 'Fri', workouts: 1, calories: 320 },
    { date: 'Sat', workouts: 0, calories: 0 },
    { date: 'Sun', workouts: 1, calories: 280 },
]

const mockMeasurements = [
    { date: '2026-02-01', weight: 180, bodyFat: 22, chest: 42, waist: 34, hips: 38 },
    { date: '2026-02-08', weight: 177, bodyFat: 21, chest: 42, waist: 33, hips: 38 },
    { date: '2026-02-15', weight: 174, bodyFat: 20, chest: 43, waist: 32, hips: 37 },
]

export default function ProgressPage() {
    const [timeRange, setTimeRange] = useState('month')

    const currentWeight = weightData[weightData.length - 1].weight
    const startingWeight = weightData[0].weight
    const weightLoss = startingWeight - currentWeight

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Progress</h1>
                    <p className="text-slate-600 mt-1">Track your fitness journey and achievements</p>
                </div>
                <Button>
                    <Plus className="w-5 h-5 mr-2" />
                    Log Progress
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Current Weight</p>
                                <p className="text-3xl font-bold text-slate-900">{currentWeight} kg</p>
                                <p className="text-sm text-emerald-600 mt-1">
                                    ↓ {weightLoss} kg since start
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-100">
                                <Scale className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Body Fat</p>
                                <p className="text-3xl font-bold text-slate-900">20%</p>
                                <p className="text-sm text-emerald-600 mt-1">
                                    ↓ 2% since start
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">This Week</p>
                                <p className="text-3xl font-bold text-slate-900">7</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    workouts completed
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-100">
                                <Calendar className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Weight Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Weight Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weightData}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="date" stroke="#64748B" />
                                <YAxis stroke="#64748B" domain={['dataMin - 5', 'dataMax + 5']} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#10B981"
                                    fillOpacity={1}
                                    fill="url(#colorWeight)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={workoutData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="date" stroke="#64748B" />
                                <YAxis stroke="#64748B" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="workouts"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                                    name="Workouts"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Body Measurements */}
            <Card>
                <CardHeader>
                    <CardTitle>Body Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Weight</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Body Fat</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Chest</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Waist</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Hips</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockMeasurements.map((m, index) => (
                                    <tr key={index} className="border-b border-slate-100">
                                        <td className="py-3 px-4 text-slate-900">{m.date}</td>
                                        <td className="py-3 px-4 text-slate-900">{m.weight} kg</td>
                                        <td className="py-3 px-4 text-slate-900">{m.bodyFat}%</td>
                                        <td className="py-3 px-4 text-slate-900">{m.chest}"</td>
                                        <td className="py-3 px-4 text-slate-900">{m.waist}"</td>
                                        <td className="py-3 px-4 text-slate-900">{m.hips}"</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
