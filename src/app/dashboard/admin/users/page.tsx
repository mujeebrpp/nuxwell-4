'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Shield,
    UserCheck,
    Search,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

type Profile = {
    userId: string
    email: string
    fullName: string
    role: string
}

const roleConfig = {
    SUPERADMIN: { color: 'bg-purple-100 text-purple-800', icon: Shield },
    ADMIN: { color: 'bg-blue-100 text-blue-800', icon: Shield },
    MANAGER: { color: 'bg-emerald-100 text-emerald-800', icon: UserCheck },
    TRAINER: { color: 'bg-orange-100 text-orange-800', icon: UserCheck },
    LIFEGUARD: { color: 'bg-teal-100 text-teal-800', icon: Shield },
    MEMBER: { color: 'bg-slate-100 text-slate-800', icon: Users },
    USER: { color: 'bg-gray-100 text-gray-800', icon: Users },
}

const roleOrder = ['SUPERADMIN', 'ADMIN', 'MANAGER', 'TRAINER', 'LIFEGUARD', 'MEMBER', 'USER']

export default function AdminUsersPage() {
    const { profile } = useAuth()
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState<string>('all')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            })
            setUsers(users.map(u => u.userId === userId ? { ...u, role: newRole } : u))
        } catch (error) {
            console.error('Error updating role:', error)
        }
    }

    const handleDeactivate = async (userId: string) => {
        try {
            await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isActive: false }),
            })
            setUsers(users.filter(u => u.userId !== userId))
        } catch (error) {
            console.error('Error deactivating user:', error)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' || user.role === filterRole
        return matchesSearch && matchesRole
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                <p className="text-slate-600 mt-2">Manage user roles and permissions</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="rounded-lg border-slate-200 px-3 py-2 text-sm"
                >
                    <option value="all">All Roles</option>
                    {roleOrder.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No users found</div>
                        ) : (
                            filteredUsers.map((user) => {
                                const roleInfo = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.MEMBER
                                const isSuperadmin = profile?.role === 'SUPERADMIN'
                                
                                return (
                                    <div key={user.userId} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                                                <span className="text-white font-medium">
                                                    {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{user.fullName || 'Unknown'}</p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className={roleInfo.color}>
                                                {user.role}
                                            </Badge>
                                            {isSuperadmin && user.role !== 'SUPERADMIN' && (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                                                        className="text-xs rounded border-slate-200 px-2 py-1"
                                                        value={user.role}
                                                    >
                                                        {roleOrder.map(role => (
                                                            <option key={role} value={role}>{role}</option>
                                                        ))}
                                                    </select>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeactivate(user.userId)}
                                                    >
                                                        Deactivate
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}