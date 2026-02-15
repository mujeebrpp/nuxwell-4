'use client'

import { useState } from 'react'
import { Dumbbell, Plus, Calendar, Clock, Flame, Trash2, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const workoutTypes = [
    { id: 'cardio', label: 'Cardio', icon: '🏃', color: 'bg-blue-100 text-blue-600' },
    { id: 'strength', label: 'Strength', icon: '🏋️', color: 'bg-red-100 text-red-600' },
    { id: 'yoga', label: 'Yoga', icon: '🧘', color: 'bg-purple-100 text-purple-600' },
    { id: 'hiit', label: 'HIIT', icon: '⚡', color: 'bg-amber-100 text-amber-600' },
    { id: 'flexibility', label: 'Flexibility', icon: '🤸', color: 'bg-green-100 text-green-600' },
]

const mockWorkouts = [
    { id: 1, name: 'Morning Cardio', type: 'cardio', duration: 30, calories: 250, exercises: ['Running', 'Jumping Jacks', 'Burpees'], date: '2026-02-15' },
    { id: 2, name: 'Upper Body Strength', type: 'strength', duration: 45, exercises: ['Bench Press', 'Pull-ups', 'Rows'], date: '2026-02-14' },
    { id: 3, name: 'Yoga Flow', type: 'yoga', duration: 60, exercises: ['Sun Salutation', 'Warrior Pose', 'Tree Pose'], date: '2026-02-13' },
    { id: 4, name: 'HIIT Session', type: 'hiit', duration: 20, exercises: ['Sprints', 'Mountain Climbers', 'Jump Squats'], date: '2026-02-12' },
    { id: 5, name: 'Lower Body', type: 'strength', duration: 40, exercises: ['Squats', 'Lunges', 'Deadlifts'], date: '2026-02-11' },
]

export default function WorkoutsPage() {
    const [showAddForm, setShowAddForm] = useState(false)
    const [workouts, setWorkouts] = useState(mockWorkouts)
    const [selectedType, setSelectedType] = useState<string | null>(null)

    const filteredWorkouts = selectedType
        ? workouts.filter(w => w.type === selectedType)
        : workouts

    const totalDuration = filteredWorkouts.reduce((acc, w) => acc + w.duration, 0)
    const totalCalories = filteredWorkouts.reduce((acc, w) => acc + (w.calories || 0), 0)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Workouts</h1>
                    <p className="text-slate-600 mt-1">Track and manage your workout sessions</p>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Log Workout
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Workouts</p>
                                <p className="text-2xl font-bold text-slate-900">{filteredWorkouts.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-100">
                                <Dumbbell className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Duration</p>
                                <p className="text-2xl font-bold text-slate-900">{totalDuration} min</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Calories</p>
                                <p className="text-2xl font-bold text-slate-900">{totalCalories.toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-orange-100">
                                <Flame className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter by Type */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedType(null)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${!selectedType
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            All
                        </button>
                        {workoutTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedType === type.id
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {type.icon} {type.label}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Workout List */}
            <div className="grid gap-4">
                {filteredWorkouts.map((workout) => {
                    const typeInfo = workoutTypes.find(t => t.id === workout.type)
                    return (
                        <Card key={workout.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${typeInfo?.color || 'bg-slate-100'}`}>
                                            <Dumbbell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{workout.name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {workout.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {workout.duration} min
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Flame className="w-4 h-4" />
                                                    {workout.calories} kcal
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                {workout.exercises && workout.exercises.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-sm font-medium text-slate-700 mb-2">Exercises:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {workout.exercises.map((exercise, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm"
                                                >
                                                    {exercise}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {filteredWorkouts.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No workouts found</h3>
                        <p className="text-slate-500 mb-4">Start logging your workouts to see them here</p>
                        <Button onClick={() => setShowAddForm(true)}>
                            <Plus className="w-5 h-5 mr-2" />
                            Log Your First Workout
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
