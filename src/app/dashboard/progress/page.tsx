'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    TrendingUp,
    Scale,
    Ruler,
    Calendar,
    Plus,
    Activity,
    Flame,
    Clock,
    Target,
    ArrowUp,
    ArrowDown,
    Minus,
    Dumbbell,
    Heart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Legend
} from 'recharts'

// Types for workout and exercise data
interface Exercise {
    name: string
    reps?: number
    sets?: number
    weight?: number
    duration?: number
    calories?: number
}

interface Workout {
    id: string
    name: string
    type: string
    durationMinutes: number
    caloriesBurned: number
    exercises: Exercise[]
    completedAt: string
    createdAt: string
}

interface ProgressEntry {
    id: string
    weight: number | null
    bodyFatPercentage: number | null
    measurements: Record<string, number> | null
    recordedAt: string
}

// Mock data generators for demo purposes
const generateMockWorkouts = (): Workout[] => {
    const exercises: Exercise[] = [
        { name: 'squat', reps: 12, sets: 3, weight: 80 },
        { name: 'bench press', reps: 10, sets: 3, weight: 60 },
        { name: 'deadlift', reps: 8, sets: 3, weight: 100 },
        { name: 'pull-up', reps: 8, sets: 3 },
        { name: 'lunges', reps: 12, sets: 3, weight: 20 },
        { name: 'push-up', reps: 15, sets: 3 },
        { name: 'plank', duration: 60, sets: 3 },
    ]

    const workoutTypes = ['strength', 'hiit', 'cardio', 'flexibility']
    const now = new Date()
    const workouts: Workout[] = []

    // Generate 30 days of workout data
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)

        // Randomly decide if there's a workout that day (70% chance)
        if (Math.random() > 0.3) {
            const numExercises = Math.floor(Math.random() * 4) + 2
            const selectedExercises = exercises
                .sort(() => Math.random() - 0.5)
                .slice(0, numExercises)
                .map(ex => ({
                    ...ex,
                    reps: ex.reps ? Math.floor(ex.reps * (0.8 + Math.random() * 0.4)) : undefined,
                    weight: ex.weight ? Math.floor(ex.weight * (0.9 + Math.random() * 0.2)) : undefined,
                    duration: ex.duration ? Math.floor(ex.duration * (0.8 + Math.random() * 0.4)) : undefined
                }))

            workouts.push({
                id: `workout-${i}`,
                name: `${workoutTypes[Math.floor(Math.random() * workoutTypes.length)]} workout`,
                type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
                durationMinutes: Math.floor(30 + Math.random() * 60),
                caloriesBurned: Math.floor(200 + Math.random() * 400),
                exercises: selectedExercises,
                completedAt: date.toISOString(),
                createdAt: date.toISOString()
            })
        }
    }

    return workouts
}

const generateMockProgress = (): ProgressEntry[] => {
    const entries: ProgressEntry[] = []
    const now = new Date()
    let weight = 85

    for (let i = 12; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i * 7)

        weight -= Math.random() * 0.5
        entries.push({
            id: `progress-${i}`,
            weight: Math.round(weight * 10) / 10,
            bodyFatPercentage: Math.round((18 + Math.random() * 2) * 10) / 10,
            measurements: {
                chest: 100 + Math.random() * 2,
                waist: 80 + Math.random() * 2,
                hips: 95 + Math.random() * 2,
                arms: 35 + Math.random() * 1,
                thighs: 55 + Math.random() * 2
            },
            recordedAt: date.toISOString()
        })
    }

    return entries
}

// Recommendation type
interface Recommendation {
    id: string
    type: 'improvement' | 'suggestion' | 'achievement'
    title: string
    description: string
    icon: 'trending' | 'target' | 'flame' | 'clock' | 'dumbbell'
    color: string
}

// Calculate exercise progress over time
const calculateExerciseProgress = (workouts: Workout[], exerciseName: string) => {
    const exerciseData: { date: string; maxReps: number; maxWeight: number }[] = []

    workouts
        .filter(w => w.exercises?.some(e => e.name.toLowerCase().includes(exerciseName.toLowerCase())))
        .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
        .forEach(workout => {
            const exercise = workout.exercises.find(e =>
                e.name.toLowerCase().includes(exerciseName.toLowerCase())
            )
            if (exercise) {
                exerciseData.push({
                    date: new Date(workout.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    maxReps: exercise.reps || 0,
                    maxWeight: exercise.weight || 0
                })
            }
        })

    return exerciseData
}

// Generate personalized recommendations
const generateRecommendations = (
    workouts: Workout[],
    currentPeriod: { workouts: number; avgDuration: number; avgCalories: number },
    previousPeriod: { workouts: number; avgDuration: number; avgCalories: number }
): Recommendation[] => {
    const recommendations: Recommendation[] = []

    // Workout frequency comparison
    const workoutDiff = currentPeriod.workouts - previousPeriod.workouts
    if (workoutDiff > 0) {
        recommendations.push({
            id: '1',
            type: 'improvement',
            title: 'Workout Consistency Up!',
            description: `You completed ${workoutDiff} more workouts this ${currentPeriod.avgDuration > 28 ? 'month' : 'week'} compared to last. Keep it up!`,
            icon: 'trending',
            color: 'text-emerald-600'
        })
    } else if (workoutDiff < 0) {
        recommendations.push({
            id: '2',
            type: 'suggestion',
            title: 'Increase Workout Frequency',
            description: `Try to match or exceed your previous ${currentPeriod.avgDuration > 28 ? 'month' : 'week'} activity. Aim for 3-4 workouts per week.`,
            icon: 'target',
            color: 'text-amber-600'
        })
    }

    // Duration comparison
    const durationDiff = ((currentPeriod.avgDuration - previousPeriod.avgDuration) / previousPeriod.avgDuration) * 100
    if (durationDiff > 10) {
        recommendations.push({
            id: '3',
            type: 'improvement',
            title: 'Longer Workouts!',
            description: `Your average workout duration has increased by ${Math.round(durationDiff)}% this ${currentPeriod.avgDuration > 28 ? 'month' : 'week'}.`,
            icon: 'clock',
            color: 'text-blue-600'
        })
    }

    // Calculate exercise-specific improvements
    const exerciseNames = ['squat', 'bench press', 'deadlift']
    exerciseNames.forEach(exerciseName => {
        const progress = calculateExerciseProgress(workouts, exerciseName)
        if (progress.length >= 2) {
            const firstReps = progress[0].maxReps
            const lastReps = progress[progress.length - 1].maxReps
            const improvement = ((lastReps - firstReps) / firstReps) * 100

            if (improvement > 15) {
                recommendations.push({
                    id: `4-${exerciseName}`,
                    type: 'achievement',
                    title: `${exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1)} Progress!`,
                    description: `You improved ${exerciseName} by ${Math.round(improvement)}% this ${currentPeriod.avgDuration > 28 ? 'month' : 'week'}.`,
                    icon: 'dumbbell',
                    color: 'text-purple-600'
                })
            }
        }
    })

    // Check workout types
    const strengthWorkouts = workouts.filter(w => w.type === 'strength').length
    const cardioWorkouts = workouts.filter(w => w.type === 'cardio').length

    if (cardioWorkouts < strengthWorkouts * 0.3) {
        recommendations.push({
            id: '5',
            type: 'suggestion',
            title: 'Add More Cardio',
            description: 'Consider adding cardio sessions to support your fitness goals and improve heart health.',
            icon: 'flame',
            color: 'text-red-600'
        })
    }

    // Total workouts recommendation
    const totalWorkouts = workouts.length
    if (totalWorkouts >= 20) {
        recommendations.push({
            id: '6',
            type: 'achievement',
            title: 'Workout Milestone!',
            description: `You've completed ${totalWorkouts} workouts! That's impressive dedication.`,
            icon: 'trending',
            color: 'text-emerald-600'
        })
    }

    return recommendations.slice(0, 4)
}

export default function ProgressPage() {
    const { user, profile } = useAuth()
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('month')
    const [viewType, setViewType] = useState<'overview' | 'exercises'>('overview')
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [progressData, setProgressData] = useState<ProgressEntry[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try to fetch real data from API
                if (user?.id) {
                    const [workoutsRes, progressRes] = await Promise.all([
                        fetch(`/api/workouts?userId=${user.id}`),
                        fetch(`/api/progress?userId=${user.id}`)
                    ])

                    if (workoutsRes.ok) {
                        const workoutsData = await workoutsRes.json()
                        if (workoutsData.length > 0) {
                            setWorkouts(workoutsData)
                        }
                    }

                    if (progressRes.ok) {
                        const progressEntries = await progressRes.json()
                        if (progressEntries.length > 0) {
                            setProgressData(progressEntries)
                        }
                    }
                }
            } catch (error) {
                console.log('Using mock data for progress page')
            }

            // Use mock data if no real data available
            if (workouts.length === 0) {
                setWorkouts(generateMockWorkouts())
            }
            if (progressData.length === 0) {
                setProgressData(generateMockProgress())
            }
            setLoading(false)
        }

        fetchData()
    }, [user])

    // Calculate stats based on time range
    const stats = useMemo(() => {
        const now = new Date()
        const periodDays = timeRange === 'week' ? 7 : 30
        const previousPeriodDays = timeRange === 'week' ? 14 : 60

        const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
        const previousPeriodStart = new Date(now.getTime() - previousPeriodDays * 24 * 60 * 60 * 1000)
        const previousPeriodEnd = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

        // Current period workouts
        const periodWorkouts = workouts.filter(w =>
            new Date(w.completedAt) >= periodStart
        )

        // Previous period workouts for comparison
        const prevPeriodWorkouts = workouts.filter(w => {
            const date = new Date(w.completedAt)
            return date >= previousPeriodStart && date < previousPeriodEnd
        })

        // Calculate totals
        const totalWorkouts = periodWorkouts.length
        const totalReps = periodWorkouts.reduce((sum, w) =>
            sum + w.exercises?.reduce((s, e) => s + (e.reps || 0) * (e.sets || 1), 0) || 0
            , 0)
        const avgDuration = totalWorkouts > 0
            ? Math.round(periodWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0) / totalWorkouts)
            : 0
        const avgCalories = totalWorkouts > 0
            ? Math.round(periodWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) / totalWorkouts)
            : 0

        // Previous period stats
        const prevTotalWorkouts = prevPeriodWorkouts.length
        const prevAvgDuration = prevTotalWorkouts > 0
            ? Math.round(prevPeriodWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0) / prevTotalWorkouts)
            : 0
        const prevAvgCalories = prevTotalWorkouts > 0
            ? Math.round(prevPeriodWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) / prevTotalWorkouts)
            : 0

        // Progress comparison
        const workoutChange = prevTotalWorkouts > 0
            ? Math.round(((totalWorkouts - prevTotalWorkouts) / prevTotalWorkouts) * 100)
            : 0
        const durationChange = prevAvgDuration > 0
            ? Math.round(((avgDuration - prevAvgDuration) / prevAvgDuration) * 100)
            : 0

        return {
            totalWorkouts,
            totalReps,
            avgDuration,
            avgCalories,
            workoutChange,
            durationChange,
            currentPeriod: { workouts: totalWorkouts, avgDuration, avgCalories },
            previousPeriod: { workouts: prevTotalWorkouts, avgDuration: prevAvgDuration, avgCalories: prevAvgCalories }
        }
    }, [workouts, timeRange])

    // Generate recommendations
    const recommendations = useMemo(() =>
        generateRecommendations(workouts, stats.currentPeriod, stats.previousPeriod),
        [workouts, stats]
    )

    // Weight data for chart
    const weightChartData = useMemo(() => {
        return progressData
            .filter(p => p.weight)
            .map(p => ({
                date: new Date(p.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                weight: p.weight
            }))
    }, [progressData])

    // Weekly activity data
    const weeklyActivityData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay() + 1)

        return days.map((day, index) => {
            const date = new Date(weekStart)
            date.setDate(weekStart.getDate() + index)

            const dayWorkouts = workouts.filter(w => {
                const workoutDate = new Date(w.completedAt)
                return workoutDate.toDateString() === date.toDateString()
            })

            return {
                day,
                workouts: dayWorkouts.length,
                calories: dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
            }
        })
    }, [workouts])

    // Monthly activity data
    const monthlyActivityData = useMemo(() => {
        const months = []
        const now = new Date()

        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthWorkouts = workouts.filter(w => {
                const workoutDate = new Date(w.completedAt)
                return workoutDate.getMonth() === monthDate.getMonth() &&
                    workoutDate.getFullYear() === monthDate.getFullYear()
            })

            months.push({
                month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                workouts: monthWorkouts.length,
                calories: monthWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
                avgDuration: monthWorkouts.length > 0
                    ? Math.round(monthWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0) / monthWorkouts.length)
                    : 0
            })
        }

        return months
    }, [workouts])

    // Exercise progress data
    const exerciseProgressData = useMemo(() => {
        return calculateExerciseProgress(workouts, 'squat')
    }, [workouts])

    // Get icon component
    const getIcon = (iconName: string, className: string) => {
        switch (iconName) {
            case 'trending': return <TrendingUp className={className} />
            case 'target': return <Target className={className} />
            case 'flame': return <Flame className={className} />
            case 'clock': return <Clock className={className} />
            case 'dumbbell': return <Dumbbell className={className} />
            default: return <Activity className={className} />
        }
    }

    // Get recommendation card color
    const getRecommendationColor = (type: string) => {
        switch (type) {
            case 'improvement': return 'bg-emerald-50 border-emerald-200'
            case 'achievement': return 'bg-amber-50 border-amber-200'
            case 'suggestion': return 'bg-blue-50 border-blue-200'
            default: return 'bg-slate-50 border-slate-200'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Progress</h1>
                    <p className="text-slate-600 mt-1">Track your fitness journey and achievements</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Time Range Toggle */}
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setTimeRange('week')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === 'week'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setTimeRange('month')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === 'month'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Month
                        </button>
                    </div>
                    {/* View Type Toggle */}
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewType('overview')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewType === 'overview'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setViewType('exercises')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewType === 'exercises'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Exercises
                        </button>
                    </div>
                    <Button>
                        <Plus className="w-5 h-5 mr-2" />
                        Log Progress
                    </Button>
                </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    {timeRange === 'week' ? 'This Week' : 'This Month'} Workouts
                                </p>
                                <p className="text-3xl font-bold text-slate-900">{stats.totalWorkouts}</p>
                                <div className="flex items-center mt-1">
                                    {stats.workoutChange > 0 ? (
                                        <ArrowUp className="w-4 h-4 text-emerald-600" />
                                    ) : stats.workoutChange < 0 ? (
                                        <ArrowDown className="w-4 h-4 text-red-600" />
                                    ) : (
                                        <Minus className="w-4 h-4 text-slate-400" />
                                    )}
                                    <span className={`text-sm ${stats.workoutChange > 0 ? 'text-emerald-600' :
                                            stats.workoutChange < 0 ? 'text-red-600' : 'text-slate-400'
                                        }`}>
                                        {stats.workoutChange > 0 ? '+' : ''}{stats.workoutChange}% vs previous {timeRange}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Reps</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.totalReps.toLocaleString()}</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    across all exercises
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Avg Session Duration</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.avgDuration} min</p>
                                <div className="flex items-center mt-1">
                                    {stats.durationChange > 0 ? (
                                        <ArrowUp className="w-4 h-4 text-emerald-600" />
                                    ) : stats.durationChange < 0 ? (
                                        <ArrowDown className="w-4 h-4 text-red-600" />
                                    ) : (
                                        <Minus className="w-4 h-4 text-slate-400" />
                                    )}
                                    <span className={`text-sm ${stats.durationChange > 0 ? 'text-emerald-600' :
                                            stats.durationChange < 0 ? 'text-red-600' : 'text-slate-400'
                                        }`}>
                                        {stats.durationChange > 0 ? '+' : ''}{stats.durationChange}% vs previous {timeRange}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-100">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Avg Calories</p>
                                <p className="text-3xl font-bold text-slate-900">{stats.avgCalories}</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    per workout
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-red-100">
                                <Flame className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Personalized Recommendations */}
            {recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-emerald-600" />
                            Personalized Insights & Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendations.map((rec) => (
                                <div
                                    key={rec.id}
                                    className={`p-4 rounded-lg border ${getRecommendationColor(rec.type)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg bg-white/50 ${rec.color}`}>
                                            {getIcon(rec.icon, "w-5 h-5")}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                                            <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Overview View */}
            {viewType === 'overview' && (
                <>
                    {/* Activity Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {timeRange === 'week' ? 'Weekly' : 'Monthly'} Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    {timeRange === 'week' ? (
                                        <BarChart data={weeklyActivityData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                            <XAxis dataKey="day" stroke="#64748B" />
                                            <YAxis stroke="#64748B" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="workouts" fill="#3B82F6" name="Workouts" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="calories" fill="#F59E0B" name="Calories" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    ) : (
                                        <BarChart data={monthlyActivityData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                            <XAxis dataKey="month" stroke="#64748B" />
                                            <YAxis stroke="#64748B" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="workouts" fill="#3B82F6" name="Workouts" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="avgDuration" fill="#10B981" name="Avg Duration (min)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weight Progress */}
                    {weightChartData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Weight Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={weightChartData}>
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
                                                name="Weight (kg)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Exercises View */}
            {viewType === 'exercises' && (
                <>
                    {/* Exercise Progress Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-purple-600" />
                                Squat Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {exerciseProgressData.length > 0 ? (
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={exerciseProgressData}>
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
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="maxReps"
                                                stroke="#8B5CF6"
                                                strokeWidth={2}
                                                dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
                                                name="Max Reps"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="maxWeight"
                                                stroke="#10B981"
                                                strokeWidth={2}
                                                dot={{ fill: '#10B981', strokeWidth: 2 }}
                                                name="Max Weight (kg)"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-40 flex items-center justify-center text-slate-500">
                                    <p>No exercise data available yet. Complete some workouts to see your progress!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Exercise Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Strength Exercises</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {['squat', 'bench press', 'deadlift'].map((exercise) => {
                                        const progress = calculateExerciseProgress(workouts, exercise)
                                        const improvement = progress.length >= 2
                                            ? Math.round(((progress[progress.length - 1].maxReps - progress[0].maxReps) / progress[0].maxReps) * 100)
                                            : 0

                                        return (
                                            <div key={exercise} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium capitalize text-slate-900">{exercise}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {progress.length > 0
                                                            ? `${progress[progress.length - 1].maxReps} reps max`
                                                            : 'No data'}
                                                    </p>
                                                </div>
                                                {improvement !== 0 && (
                                                    <div className={`flex items-center gap-1 ${improvement > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {improvement > 0 ? (
                                                            <ArrowUp className="w-4 h-4" />
                                                        ) : (
                                                            <ArrowDown className="w-4 h-4" />
                                                        )}
                                                        <span className="text-sm font-medium">{Math.abs(improvement)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Cardio Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Cardio Sessions</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {workouts.filter(w => w.type === 'cardio').length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Total Calories Burned</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Avg Calories/Workout</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {Math.round(workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) / Math.max(workouts.length, 1))}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Workout Types</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {['strength', 'cardio', 'hiit', 'flexibility', 'yoga'].map((type) => {
                                        const count = workouts.filter(w => w.type === type).length
                                        const percentage = Math.round((count / Math.max(workouts.length, 1)) * 100)

                                        return (
                                            <div key={type} className="space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="capitalize text-slate-700">{type}</span>
                                                    <span className="text-slate-500">{count} ({percentage}%)</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${type === 'strength' ? 'bg-purple-500' :
                                                                type === 'cardio' ? 'bg-red-500' :
                                                                    type === 'hiit' ? 'bg-orange-500' :
                                                                        type === 'flexibility' ? 'bg-blue-500' :
                                                                            'bg-green-500'
                                                            }`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

            {/* Body Measurements */}
            {progressData.length > 0 && (
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
                                    {progressData.slice(0, 6).map((m, index) => (
                                        <tr key={index} className="border-b border-slate-100">
                                            <td className="py-3 px-4 text-slate-900">
                                                {new Date(m.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="py-3 px-4 text-slate-900">{m.weight} kg</td>
                                            <td className="py-3 px-4 text-slate-900">{m.bodyFatPercentage}%</td>
                                            <td className="py-3 px-4 text-slate-900">{m.measurements?.chest?.toFixed(1)}"</td>
                                            <td className="py-3 px-4 text-slate-900">{m.measurements?.waist?.toFixed(1)}"</td>
                                            <td className="py-3 px-4 text-slate-900">{m.measurements?.hips?.toFixed(1)}"</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
