'use client'

import { useState } from 'react'
import { Utensils, Plus, Calendar, Flame, Trash2, Edit, Apple } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'bg-amber-100 text-amber-600' },
    { id: 'lunch', label: 'Lunch', icon: '☀️', color: 'bg-orange-100 text-orange-600' },
    { id: 'dinner', label: 'Dinner', icon: '🌙', color: 'bg-blue-100 text-blue-600' },
    { id: 'snack', label: 'Snack', icon: '🍎', color: 'bg-green-100 text-green-600' },
]

const mockMeals = [
    { id: 1, name: 'Oatmeal with Berries', type: 'breakfast', calories: 350, protein: 12, carbs: 55, fats: 8, date: '2026-02-15' },
    { id: 2, name: 'Grilled Chicken Salad', type: 'lunch', calories: 450, protein: 40, carbs: 25, fats: 18, date: '2026-02-15' },
    { id: 3, name: 'Protein Shake', type: 'snack', calories: 150, protein: 25, carbs: 5, fats: 3, date: '2026-02-15' },
    { id: 4, name: 'Salmon with Vegetables', type: 'dinner', calories: 520, protein: 45, carbs: 20, fats: 28, date: '2026-02-15' },
    { id: 5, name: 'Greek Yogurt', type: 'snack', calories: 120, protein: 15, carbs: 8, fats: 0, date: '2026-02-14' },
]

export default function MealsPage() {
    const [showAddForm, setShowAddForm] = useState(false)
    const [meals, setMeals] = useState(mockMeals)
    const [selectedType, setSelectedType] = useState<string | null>(null)

    const filteredMeals = selectedType
        ? meals.filter(m => m.type === selectedType)
        : meals

    const totalCalories = filteredMeals.reduce((acc, m) => acc + (m.calories || 0), 0)
    const totalProtein = filteredMeals.reduce((acc, m) => acc + (m.protein || 0), 0)
    const totalCarbs = filteredMeals.reduce((acc, m) => acc + (m.carbs || 0), 0)
    const totalFats = filteredMeals.reduce((acc, m) => acc + (m.fats || 0), 0)

    // Daily goal
    const dailyCalorieGoal = 2000

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Meals</h1>
                    <p className="text-slate-600 mt-1">Track your nutrition and meal intake</p>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Log Meal
                </Button>
            </div>

            {/* Daily Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Calories</p>
                                <p className="text-2xl font-bold text-slate-900">{totalCalories.toLocaleString()}</p>
                                <p className="text-sm text-slate-400">of {dailyCalorieGoal} goal</p>
                            </div>
                            <div className="p-3 rounded-xl bg-orange-100">
                                <Flame className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min((totalCalories / dailyCalorieGoal) * 100, 100)}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Protein</p>
                                <p className="text-2xl font-bold text-slate-900">{totalProtein}g</p>
                            </div>
                            <div className="p-3 rounded-xl bg-red-100">
                                <Utensils className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Carbs</p>
                                <p className="text-2xl font-bold text-slate-900">{totalCarbs}g</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-100">
                                <Apple className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Fats</p>
                                <p className="text-2xl font-bold text-slate-900">{totalFats}g</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Utensils className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter by Type */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Meal Type</CardTitle>
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
                        {mealTypes.map((type) => (
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

            {/* Meal List */}
            <div className="grid gap-4">
                {filteredMeals.map((meal) => {
                    const typeInfo = mealTypes.find(t => t.id === meal.type)
                    return (
                        <Card key={meal.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${typeInfo?.color || 'bg-slate-100'}`}>
                                            <Utensils className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{meal.name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {meal.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Flame className="w-4 h-4" />
                                                    {meal.calories} kcal
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Macros</p>
                                            <p className="text-sm font-medium">
                                                P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {filteredMeals.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No meals found</h3>
                        <p className="text-slate-500 mb-4">Start logging your meals to see them here</p>
                        <Button onClick={() => setShowAddForm(true)}>
                            <Plus className="w-5 h-5 mr-2" />
                            Log Your First Meal
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
