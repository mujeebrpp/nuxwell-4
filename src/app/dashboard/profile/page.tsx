'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Scale, Ruler, Target, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const fitnessGoals = [
    { id: 'weight_loss', label: 'Weight Loss', icon: '📉' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
    { id: 'maintenance', label: 'Maintain Weight', icon: '⚖️' },
    { id: 'endurance', label: 'Build Endurance', icon: '🏃' },
    { id: 'flexibility', label: 'Improve Flexibility', icon: '🧘' },
]

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        weight: '',
        height: '',
        fitnessGoal: 'maintenance',
    })
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                setProfile(prev => ({
                    ...prev,
                    fullName: user.user_metadata?.full_name || '',
                    email: user.email || '',
                }))
            }
        }
        getUser()
    }, [supabase])

    const handleSave = async () => {
        setSaving(true)
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSaving(false)
    }

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
                <p className="text-slate-600 mt-1">Manage your account and fitness preferences</p>
            </div>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                    </CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={profile.fullName}
                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Body Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="w-5 h-5" />
                        Body Metrics
                    </CardTitle>
                    <CardDescription>Track your physical measurements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Weight (kg)
                            </label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="number"
                                    value={profile.weight}
                                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                    placeholder="175"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Height (inches)
                            </label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="number"
                                    value={profile.height}
                                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                    placeholder="70"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fitness Goal */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Fitness Goal
                    </CardTitle>
                    <CardDescription>What do you want to achieve?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {fitnessGoals.map((goal) => (
                            <button
                                key={goal.id}
                                onClick={() => setProfile({ ...profile, fitnessGoal: goal.id })}
                                className={`p-4 rounded-lg border-2 transition-all text-left ${profile.fitnessGoal === goal.id
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <span className="text-2xl block mb-1">{goal.icon}</span>
                                <span className="font-medium text-slate-900">{goal.label}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-5 h-5 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    )
}
