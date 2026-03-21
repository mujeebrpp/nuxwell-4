'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Lock, Bell, Shield, Save, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
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
                }))
            }
        }
        getUser()
    }, [supabase])

    const handleProfileSave = async () => {
        setSaving(true)
        setSuccessMessage('')

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: profile.fullName,
                }
            })

            if (error) throw error
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
