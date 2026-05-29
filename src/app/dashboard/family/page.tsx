'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus, Crown, UserPlus, Award, Calendar } from 'lucide-react'

interface FamilyMember {
    userId: string
    fullName: string
    email: string
    memberType: string
}

interface FamilyData {
    id: string
    name: string
    primaryGuardianId: string
    members: FamilyMember[]
    sharedRewards: { points: number }[]
}

export default function FamilyPage() {
    const { profile } = useAuth()
    const [family, setFamily] = useState<FamilyData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFamily = async () => {
            try {
                const response = await fetch('/api/families?userId=' + profile?.id)
                if (response.ok) {
                    const data = await response.json()
                    setFamily(data[0] || null)
                }
            } catch (error) {
                console.error('Error fetching family:', error)
            } finally {
                setLoading(false)
            }
        }
        if (profile?.id) {
            fetchFamily()
        }
    }, [profile?.id])

    const totalPoints = family?.sharedRewards?.reduce((sum, r) => sum + r.points, 0) || 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Family</h1>
                    <p className="text-slate-600 mt-1">Manage family members and shared wellness</p>
                </div>
                <a href="/dashboard/family/invite">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                    </Button>
                </a>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="p-12">
                        <div className="h-48 bg-slate-200 rounded-lg animate-pulse" />
                    </CardContent>
                </Card>
            ) : !family ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="font-semibold text-slate-900 mb-2">No Family Account</h3>
                        <p className="text-slate-600 mb-4">Create a family account to share wellness with loved ones</p>
                        <a href="/dashboard/family/create">
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Family Account
                            </Button>
                        </a>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Family Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-amber-500" />
                                {family.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <Award className="h-10 w-10 text-emerald-600" />
                                <div>
                                    <p className="text-sm text-slate-600">Shared Reward Points</p>
                                    <p className="text-3xl font-bold text-slate-900">{totalPoints} pts</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Family Members */}
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Family Members</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {family.members.map((member) => (
                                <Card key={member.userId} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                                <span className="font-medium text-emerald-700">
                                                    {member.fullName?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{member.fullName}</p>
                                                <p className="text-sm text-slate-500 capitalize">{member.memberType}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Family Wellness Score */}
                    <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-slate-900">Family Wellness Score</h3>
                                    <p className="text-sm text-slate-600">Combined weekly score</p>
                                </div>
                                <span className="text-3xl font-bold text-emerald-600">84</span>
                            </div>
                            <div className="h-3 bg-white rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full" style={{ width: '84%' }} />
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}