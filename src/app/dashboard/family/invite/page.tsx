'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

interface FamilyMember {
    id: string
    userId: string
    memberType: string
    user: {
        fullName: string | null
        email: string
    }
}

export default function InviteMemberPage() {
    const { profile } = useAuth()
    const [family, setFamily] = useState<{ id: string; name: string } | null>(null)
    const [members, setMembers] = useState<FamilyMember[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    
    const [email, setEmail] = useState('')
    const [memberType, setMemberType] = useState('child')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchFamily = async () => {
            try {
                const response = await fetch('/api/families?userId=' + profile?.id)
                if (response.ok) {
                    const data = await response.json()
                    if (data && data.length > 0) {
                        setFamily(data[0])
                        setMembers(data[0].members || [])
                    }
                }
            } catch (error) {
                console.error('Error fetching family:', error)
                setError('Failed to load family data')
            } finally {
                setLoading(false)
            }
        }
        if (profile?.id) {
            fetchFamily()
        }
    }, [profile?.id])

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch('/api/family-members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    familyId: family?.id,
                    email,
                    memberType,
                }),
            })

            if (res.ok) {
                const data = await res.json()
                setMembers([...members, data.member])
                setEmail('')
                setSuccess('Member added successfully!')
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to add member')
            }
        } catch {
            setError('Failed to add member')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        try {
            const res = await fetch(`/api/family-members?id=${memberId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                setMembers(members.filter(m => m.id !== memberId))
            } else {
                setError('Failed to remove member')
            }
        } catch {
            setError('Failed to remove member')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    if (!family) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <p className="text-slate-600">Please create a family account first</p>
                    <a href="/dashboard/family/create">
                        <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                            Create Family Account
                        </Button>
                    </a>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Family Members</h1>
                <p className="text-slate-600 mt-1">Manage your family members for shared wellness activities</p>
            </div>

            {/* Add Member Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-emerald-600" />
                        Invite New Member
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-600">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleAddMember} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Member Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter member's email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="memberType">Member Type</Label>
                                <select
                                    id="memberType"
                                    value={memberType}
                                    onChange={(e) => setMemberType(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="child">Child</option>
                                    <option value="senior">Senior</option>
                                </select>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {submitting ? 'Adding...' : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Member
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Current Members */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Current Members ({members.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {members.length === 0 ? (
                        <p className="text-slate-600 text-center py-8">No members added yet</p>
                    ) : (
                        <div className="space-y-4">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900">{member.user.fullName || member.user.email}</p>
                                        <p className="text-sm text-slate-500">{member.user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-1 rounded-full capitalize bg-emerald-100 text-emerald-700">
                                            {member.memberType}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="p-1 text-red-600 hover:text-red-700"
                                            title="Remove member"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}