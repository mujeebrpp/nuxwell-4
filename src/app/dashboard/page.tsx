'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Dumbbell,
    Utensils,
    TrendingUp,
    Flame,
    Target,
    Calendar,
    Plus,
    ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

// Mock data for demonstration
const mockStats = {
    workoutsThisWeek: 4,
    caloriesToday: 1850,
    currentStreak: 7,
    weeklyGoal: 5,
}

const mockRecentWorkouts = [
    { id: 1, name: 'Morning Cardio', type: 'cardio', duration: 30, calories: 250, date: '2026-02-15' },
    { id: 2, name: 'Upper Body Strength', type: 'strength', duration: 45, calories: 320, date: '2026-02-14' },
    { id: 3, name: 'Yoga Flow', type: 'yoga', duration: 60, calories: 180, date: '2026-02-13' },
]

const mockRecentMeals = [
    { id: 1, name: 'Breakfast', type: 'breakfast', calories: 450, protein: 25, carbs: 40, fats: 15, date: '2026-02-15' },
    { id: 2, name: 'Lunch', type: 'lunch', calories: 650, protein: 45, carbs: 50, fats: 20, date: '2026-02-15' },
    { id: 3, name: 'Snack', type: 'snack', calories: 200, protein: 10, carbs: 25, fats: 8, date: '2026-02-15' },
]

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    const stats = [
        {
            label: 'Workouts This Week',
            value: mockStats.workoutsThisWeek,
            goal: `of ${mockStats.weeklyGoal}`,
            icon: Dumbbell,
            color: 'bg-emerald-100 text-emerald-600',
        },
        {
            label: 'Calories Today',
            value: mockStats.caloriesToday.toLocaleString(),
            goal: 'kcal',
            icon: Flame,
            color: 'bg-orange-100 text-orange-600',
        },
        {
            label: 'Current Streak',
            value: mockStats.currentStreak,
            goal: 'days',
            icon: Target,
            color: 'bg-amber-100 text-amber-600',
        },
        {
            label: 'Next Workout',
            value: 'Tomorrow',
            goal: '9:00 AM',
            icon: Calendar,
            color: 'bg-blue-100 text-blue-600',
        },
    ]

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Here's an overview of your fitness journey
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/workouts">
                        <Button>
                            <Plus className="w-5 h-5 mr-2" />
                            Log Workout
                        </Button>
                    </Link>
                    <Link href="/dashboard/meals">
                        <Button variant="outline">
                            <Utensils className="w-5 h-5 mr-2" />
                            Log Meal
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">{stat.goal}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Workouts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Workouts</CardTitle>
                        <Link href="/dashboard/workouts">
                            <Button variant="ghost" size="sm">
                                View All
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockRecentWorkouts.map((workout) => (
                                <div
                                    key={workout.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-100">
                                            <Dumbbell className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{workout.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {workout.duration} min • {workout.calories} kcal
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-400">{workout.date}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Meals */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Today's Meals</CardTitle>
                        <Link href="/dashboard/meals">
                            <Button variant="ghost" size="sm">
                                View All
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockRecentMeals.map((meal) => (
                                <div
                                    key={meal.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-orange-100">
                                            <Utensils className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{meal.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-400 capitalize">{meal.type}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Overview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Weekly Progress</CardTitle>
                    <Link href="/dashboard/progress">
                        <Button variant="ghost" size="sm">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 rounded-xl bg-emerald-50">
                            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-emerald-600">+12%</p>
                            <p className="text-sm text-slate-600">Workout Completion</p>
                        </div>
                        <div className="text-center p-6 rounded-xl bg-blue-50">
                            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-blue-600">85%</p>
                            <p className="text-sm text-slate-600">Calorie Goal</p>
                        </div>
                        <div className="text-center p-6 rounded-xl bg-amber-50">
                            <Flame className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-amber-600">2,450</p>
                            <p className="text-sm text-slate-600">Weekly Calories</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
