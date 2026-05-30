'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Plus } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

export default function CreateFamilyPage() {
    const router = useRouter()
    const { user, profile } = useAuth()
    const [familyName, setFamilyName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault()
         setLoading(true)
         setError(null)

         if (!user?.id) {
             setError('User not authenticated')
             setLoading(false)
             return
         }

         try {
             const res = await fetch('/api/families', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     name: familyName,
                     primaryGuardianId: user.id,
                 }),
             })

             if (res.ok) {
                 router.push('/dashboard/family')
             } else {
                 const data = await res.json()
                 setError(data.error || 'Failed to create family account')
             }
         } catch {
             setError('Failed to create family account')
         } finally {
             setLoading(false)
         }
     }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-slate-600">Please log in to create a family account</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Create Family Account</h1>
                <p className="text-slate-600 mt-1">Set up your family group for shared wellness activities</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Family Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="familyName">Family Name</Label>
                            <Input
                                id="familyName"
                                placeholder="Enter your family name (e.g., Smith Family)"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                required
                            />
                            <p className="text-xs text-slate-500">
                                This will be used to identify your family account
                            </p>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-lg">
                            <h4 className="font-medium text-emerald-900 mb-2">What you can do with Family Booking:</h4>
                            <ul className="text-sm text-emerald-700 space-y-1 list-disc list-inside">
                                <li>Book pool sessions for 4-8 family members</li>
                                <li>Reserve tea tables for family gatherings</li>
                                <li>Access shared workout facilities</li>
                                <li>Optionally request a dedicated trainer (shared with other families)</li>
                                <li>Earn and share reward points together</li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !familyName.trim()}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? 'Creating...' : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Family Account
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}