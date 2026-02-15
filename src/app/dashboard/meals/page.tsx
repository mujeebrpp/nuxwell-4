'use client'

import { useState } from 'react'
import { Utensils, Plus, Calendar, Flame, Trash2, Edit, Apple, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

interface MealFormData {
    name: string
    type: string
    calories: string
    protein: string
    carbs: string
    fats: string
    date: string
}

const initialFormData: MealFormData = {
    name: '',
    type: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    date: new Date().toISOString().split('T')[0]
}

export default function MealsPage() {
    const [showAddForm, setShowAddForm] = useState(false)
    const [meals, setMeals] = useState(mockMeals)
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [editingMealId, setEditingMealId] = useState<number | null>(null)
    const [formData, setFormData] = useState<MealFormData>(initialFormData)

    const filteredMeals = selectedType
        ? meals.filter(m => m.type === selectedType)
        : meals

    const totalCalories = filteredMeals.reduce((acc, m) => acc + (m.calories || 0), 0)
    const totalProtein = filteredMeals.reduce((acc, m) => acc + (m.protein || 0), 0)
    const totalCarbs = filteredMeals.reduce((acc, m) => acc + (m.carbs || 0), 0)
    const totalFats = filteredMeals.reduce((acc, m) => acc + (m.fats || 0), 0)

    // Daily goal
    const dailyCalorieGoal = 2000

    const handleEditClick = (meal: typeof mockMeals[0]) => {
        setEditingMealId(meal.id)
        setFormData({
            name: meal.name,
            type: meal.type,
            calories: meal.calories.toString(),
            protein: meal.protein?.toString() || '',
            carbs: meal.carbs?.toString() || '',
            fats: meal.fats?.toString() || '',
            date: meal.date
        })
        setShowAddForm(true)
    }

    const handleDeleteClick = (mealId: number) => {
        if (confirm('Are you sure you want to delete this meal?')) {
            setMeals(meals.filter(m => m.id !== mealId))
        }
    }

    const handleAddClick = () => {
        setEditingMealId(null)
        setFormData(initialFormData)
        setShowAddForm(true)
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const mealData = {
            name: formData.name,
            type: formData.type,
            calories: parseInt(formData.calories) || 0,
            protein: parseFloat(formData.protein) || 0,
            carbs: parseFloat(formData.carbs) || 0,
            fats: parseFloat(formData.fats) || 0,
            date: formData.date
        }

        if (editingMealId) {
            // Update existing meal
            setMeals(meals.map(m =>
                m.id === editingMealId ? { ...m, ...mealData } : m
            ))
        } else {
            // Add new meal
            const newMeal = {
                id: Math.max(...meals.map(m => m.id), 0) + 1,
                ...mealData
            }
            setMeals([newMeal, ...meals])
        }

        // Reset form
        setShowAddForm(false)
        setEditingMealId(null)
        setFormData(initialFormData)
    }

    const handleCancelForm = () => {
        setShowAddForm(false)
        setEditingMealId(null)
        setFormData(initialFormData)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Meals</h1>
                    <p className="text-slate-600 mt-1">Track your nutrition and meal intake</p>
                </div>
                <Button onClick={handleAddClick}>
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
                                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(meal)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(meal.id)}>
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
                        <Button onClick={handleAddClick}>
                            <Plus className="w-5 h-5 mr-2" />
                            Log Your First Meal
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Add/Edit Meal Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{editingMealId ? 'Edit Meal' : 'Log New Meal'}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={handleCancelForm}>
                                <X className="w-5 h-5" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Meal Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="e.g., Oatmeal with Berries"
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Meal Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        {mealTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.icon} {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Input
                                    label="Date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleFormChange}
                                    required
                                />

                                <Input
                                    label="Calories"
                                    name="calories"
                                    type="number"
                                    value={formData.calories}
                                    onChange={handleFormChange}
                                    placeholder="e.g., 350"
                                    required
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <Input
                                        label="Protein (g)"
                                        name="protein"
                                        type="number"
                                        value={formData.protein}
                                        onChange={handleFormChange}
                                        placeholder="e.g., 12"
                                    />
                                    <Input
                                        label="Carbs (g)"
                                        name="carbs"
                                        type="number"
                                        value={formData.carbs}
                                        onChange={handleFormChange}
                                        placeholder="e.g., 55"
                                    />
                                    <Input
                                        label="Fats (g)"
                                        name="fats"
                                        type="number"
                                        value={formData.fats}
                                        onChange={handleFormChange}
                                        placeholder="e.g., 8"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="flex-1">
                                        {editingMealId ? 'Update Meal' : 'Log Meal'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleCancelForm}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
