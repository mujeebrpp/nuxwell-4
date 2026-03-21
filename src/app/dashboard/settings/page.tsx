'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Lock, Bell, Shield, Save, Eye, EyeOff, Scale, Target, Moon, Sun, Camera, Monitor, Settings as SettingsIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

const fitnessGoals = [
    { id: 'weight_loss', label: 'Weight Loss', icon: '📉', description: 'Lose weight through calorie deficit and cardio' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪', description: 'Build muscle through strength training' },
    { id: 'endurance', label: 'Endurance', icon: '🏃', description: 'Improve cardiovascular stamina' },
    { id: 'flexibility', label: 'Flexibility', icon: '🧘', description: 'Increase range of motion and flexibility' },
    { id: 'general_fitness', label: 'General Fitness', icon: '⚖️', description: 'Maintain overall health and wellness' },
]

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [darkMode, setDarkMode] = useState(false)
    const [cameraGuideExpanded, setCameraGuideExpanded] = useState(false)

    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        weight: '',
        weightUnit: 'kg',
        fitnessGoal: 'general_fitness',
    })

    const [notifications, setNotifications] = useState({
        emailWorkouts: true,
        emailMeals: true,
        emailProgress: true,
        pushNotifications: true,
        weeklyReport: false,
    })

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
                    weight: user.user_metadata?.weight?.toString() || '',
                    weightUnit: user.user_metadata?.weight_unit || 'kg',
                    fitnessGoal: user.user_metadata?.fitness_goal || 'general_fitness',
                }))

                // Load dark mode preference from localStorage
                const savedDarkMode = localStorage.getItem('darkMode')
                if (savedDarkMode) {
                    setDarkMode(savedDarkMode === 'true')
                    applyDarkMode(savedDarkMode === 'true')
                }
            }
        }
        getUser()
    }, [supabase])

    const applyDarkMode = (isDark: boolean) => {
        if (isDark) {
            document.documentElement.style.setProperty('--background', '#0F172A')
            document.documentElement.style.setProperty('--foreground', '#F1F5F9')
            document.documentElement.style.setProperty('--surface', '#1E293B')
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.style.setProperty('--background', '#F8FAFC')
            document.documentElement.style.setProperty('--foreground', '#1E293B')
            document.documentElement.style.setProperty('--surface', '#FFFFFF')
            document.documentElement.classList.remove('dark')
        }
    }

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode
        setDarkMode(newDarkMode)
        localStorage.setItem('darkMode', newDarkMode.toString())
        applyDarkMode(newDarkMode)
    }

    const handleProfileSave = async () => {
        setSaving(true)
        setSuccessMessage('')

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: profile.fullName,
                    weight: profile.weight ? parseFloat(profile.weight) : null,
                    weight_unit: profile.weightUnit,
                    fitness_goal: profile.fitnessGoal,
                }
            })

            if (error) throw error

            // Also update in database via API
            if (user) {
                await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        fullName: profile.fullName,
                        weight: profile.weight ? parseFloat(profile.weight) : null,
                        weightUnit: profile.weightUnit,
                        height: null,
                        fitnessGoal: profile.fitnessGoal,
                    }),
                })
            }

            setSuccessMessage('Profile updated successfully!')
        } catch (error) {
            console.error('Error updating profile:', error)
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        if (profile.newPassword !== profile.confirmPassword) {
            alert('Passwords do not match!')
            return
        }

        if (profile.newPassword.length < 6) {
            alert('Password must be at least 6 characters!')
            return
        }

        setSaving(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: profile.newPassword
            })

            if (error) throw error

            setProfile(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }))
            setSuccessMessage('Password changed successfully!')
        } catch (error) {
            console.error('Error changing password:', error)
            alert('Failed to change password')
        } finally {
            setSaving(false)
        }
    }

    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {successMessage}
                </div>
            )}

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Update your personal information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Enter your full name"
                                value={profile.fullName}
                                onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                disabled
                                className="pl-10 bg-muted"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <Button onClick={handleProfileSave} disabled={saving} className="mt-4">
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardContent>
            </Card>

            {/* Body Metrics & Fitness Goal */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        Body Metrics & Fitness Goals
                    </CardTitle>
                    <CardDescription>
                        Required for calorie calculations and personalized recommendations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Weight Input */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Weight</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="weight"
                                    type="number"
                                    placeholder={profile.weightUnit === 'kg' ? '70' : '154'}
                                    value={profile.weight}
                                    onChange={(e) => setProfile(prev => ({ ...prev, weight: e.target.value }))}
                                    className="pl-10"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={profile.weightUnit}
                                    onChange={(e) => setProfile(prev => ({ ...prev, weightUnit: e.target.value }))}
                                    className="h-10 px-3 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Used for calorie calculations. Your weight is stored securely.
                        </p>
                    </div>

                    {/* Fitness Goal Selection */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Fitness Goal</label>
                        <div className="relative">
                            <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <select
                                value={profile.fitnessGoal}
                                onChange={(e) => setProfile(prev => ({ ...prev, fitnessGoal: e.target.value }))}
                                className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                {fitnessGoals.map((goal) => (
                                    <option key={goal.id} value={goal.id}>
                                        {goal.icon} {goal.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {fitnessGoals.find(g => g.id === profile.fitnessGoal)?.description || 'Select your primary fitness goal'}
                        </p>
                    </div>

                    {/* Fitness Goal Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {fitnessGoals.map((goal) => (
                            <button
                                key={goal.id}
                                type="button"
                                onClick={() => setProfile(prev => ({ ...prev, fitnessGoal: goal.id }))}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${profile.fitnessGoal === goal.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <span className="text-xl block mb-1">{goal.icon}</span>
                                <span className="font-medium text-sm">{goal.label}</span>
                            </button>
                        ))}
                    </div>

                    <Button onClick={handleProfileSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Fitness Settings'}
                    </Button>
                </CardContent>
            </Card>

            {/* Dark Mode Toggle */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Moon className="h-5 w-5" />
                        Appearance
                    </CardTitle>
                    <CardDescription>
                        Customize the look and feel of the application
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {darkMode ? (
                                <Moon className="h-5 w-5 text-primary" />
                            ) : (
                                <Sun className="h-5 w-5 text-yellow-500" />
                            )}
                            <div>
                                <p className="font-medium">Dark Mode</p>
                                <p className="text-sm text-muted-foreground">
                                    {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`w-14 h-7 rounded-full transition-colors relative ${darkMode ? 'bg-primary' : 'bg-muted'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow absolute top-0.5 transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-0.5'
                                }`}>
                                {darkMode ? (
                                    <Moon className="w-3 h-3 text-primary absolute top-1.5 left-1.5" />
                                ) : (
                                    <Sun className="w-3 h-3 text-yellow-500 absolute top-1.5 left-1.5" />
                                )}
                            </div>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                value={profile.newPassword}
                                onChange={(e) => setProfile(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="pl-10 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                value={profile.confirmPassword}
                                onChange={(e) => setProfile(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Button onClick={handlePasswordChange} disabled={saving || !profile.newPassword}>
                        <Shield className="h-4 w-4 mr-2" />
                        {saving ? 'Changing...' : 'Change Password'}
                    </Button>
                </CardContent>
            </Card>

            {/* Camera Permissions Guide */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Camera Permissions
                    </CardTitle>
                    <CardDescription>
                        How to enable camera access for workout tracking
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <button
                        onClick={() => setCameraGuideExpanded(!cameraGuideExpanded)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <div>
                            <p className="font-medium">Camera Access Guide</p>
                            <p className="text-sm text-muted-foreground">
                                Click to learn how to enable camera permissions
                            </p>
                        </div>
                        {cameraGuideExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                    </button>

                    {cameraGuideExpanded && (
                        <div className="mt-4 space-y-4 border-t pt-4">
                            {/* Chrome */}
                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Monitor className="h-4 w-4" />
                                    Google Chrome
                                </h4>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Click the lock or camera icon in the address bar</li>
                                    <li>Select "Allow" for camera access</li>
                                    <li>Refresh the page if needed</li>
                                </ol>
                            </div>

                            {/* Safari */}
                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Monitor className="h-4 w-4" />
                                    Safari
                                </h4>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Go to Safari → Preferences → Websites</li>
                                    <li>Click on "Camera" in the left sidebar</li>
                                    <li>Find nuxwell and allow camera access</li>
                                </ol>
                            </div>

                            {/* Firefox */}
                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Monitor className="h-4 w-4" />
                                    Firefox
                                </h4>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Click the shield icon in the address bar</li>
                                    <li>Disable "Enhanced Tracking Protection" for the site</li>
                                    <li>Or go to Permissions → Camera → Allow</li>
                                </ol>
                            </div>

                            {/* Mobile */}
                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                    <SettingsIcon className="h-4 w-4" />
                                    Mobile (iOS/Android)
                                </h4>
                                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Go to Settings → Apps → Browser (Chrome/Safari)</li>
                                    <li>Tap on Permissions → Camera</li>
                                    <li>Select "Allow"</li>
                                </ol>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Camera access is only used during workout sessions to track your movements.
                                    No video is stored or uploaded to any server.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>
                        Choose how you want to be notified
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Workout Reminders</p>
                            <p className="text-sm text-muted-foreground">Receive email notifications about your workouts</p>
                        </div>
                        <button
                            onClick={() => handleNotificationChange('emailWorkouts')}
                            className={`w-12 h-6 rounded-full transition-colors ${notifications.emailWorkouts ? 'bg-primary' : 'bg-muted'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.emailWorkouts ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Meal Planning</p>
                            <p className="text-sm text-muted-foreground">Receive email notifications about meals</p>
                        </div>
                        <button
                            onClick={() => handleNotificationChange('emailMeals')}
                            className={`w-12 h-6 rounded-full transition-colors ${notifications.emailMeals ? 'bg-primary' : 'bg-muted'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.emailMeals ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Progress Updates</p>
                            <p className="text-sm text-muted-foreground">Receive email notifications about your progress</p>
                        </div>
                        <button
                            onClick={() => handleNotificationChange('emailProgress')}
                            className={`w-12 h-6 rounded-full transition-colors ${notifications.emailProgress ? 'bg-primary' : 'bg-muted'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.emailProgress ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                        </div>
                        <button
                            onClick={() => handleNotificationChange('pushNotifications')}
                            className={`w-12 h-6 rounded-full transition-colors ${notifications.pushNotifications ? 'bg-primary' : 'bg-muted'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Weekly Report</p>
                            <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
                        </div>
                        <button
                            onClick={() => handleNotificationChange('weeklyReport')}
                            className={`w-12 h-6 rounded-full transition-colors ${notifications.weeklyReport ? 'bg-primary' : 'bg-muted'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.weeklyReport ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>

                    <Button className="mt-4">
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
