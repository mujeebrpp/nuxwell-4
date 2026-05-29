'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export type Role = 'ADMIN' | 'TRAINER' | 'LIFEGUARD' | 'MANAGER' | 'SUPERADMIN' | 'MEMBER' | 'USER'

type AuthContextType = {
    user: User | null
    profile: { id: string; role: Role; fullName: string | null; email: string } | null
    loading: boolean
    role: Role | null
    familyMembers: any[]
    families: any[]
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, fullName: string, role?: Role) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    hasRole: (roles: Role | Role[]) => boolean
    isAdmin: () => boolean
    isTrainer: () => boolean
    isMember: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<{ id: string; role: Role; fullName: string | null; email: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [familyMembers, setFamilyMembers] = useState<any[]>([])
    const [families, setFamilies] = useState<any[]>([])
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
        try {
            const response = await fetch(`/api/profile?userId=${userId}`)
            if (response.ok) {
                const data = await response.json()
                if (data.profile) {
                    setProfile({
                        id: data.profile.userId,
                        role: data.profile.role || 'MEMBER',
                        fullName: data.profile.fullName,
                        email: data.profile.email
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const fetchFamilyData = async (userId: string) => {
        try {
            const res = await fetch(`/api/families?userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data) && data.length > 0) {
                    const userFamilies = data.map((family: any) => ({
                        id: family.id,
                        name: family.name,
                        primaryGuardianId: family.primaryGuardianId
                    }))
                    setFamilies(userFamilies)
                    setFamilyMembers(data[0].members || [])
                }
            }
        } catch (error) {
            console.error('Error fetching family data:', error)
        }
    }

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                await fetchProfile(user.id)
                await fetchFamilyData(user.id)
            }
            setLoading(false)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null
            setUser(currentUser)
            if (currentUser) {
                await fetchProfile(currentUser.id)
                await fetchFamilyData(currentUser.id)
            } else {
                setProfile(null)
                setFamilyMembers([])
                setFamilies([])
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error }
    }

    const signUp = async (email: string, password: string, fullName: string, role: Role = 'MEMBER') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role },
            },
        })

        if (!error && data.user) {
            // Create profile in database via API
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: data.user.id,
                    email,
                    fullName,
                    role,
                }),
            })

            if (!response.ok) {
                console.error('Failed to create profile')
            }
        }

        return { error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setProfile(null)
    }

    const hasRole = (roles: Role | Role[]): boolean => {
        if (!profile) return false
        if (Array.isArray(roles)) {
            return roles.includes(profile.role)
        }
        return profile.role === roles
    }

    const isAdmin = (): boolean => hasRole('ADMIN') || hasRole('SUPERADMIN')
    const isTrainer = (): boolean => hasRole('TRAINER')
    const isMember = (): boolean => hasRole('MEMBER') || hasRole('USER')

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            role: profile?.role || null,
            familyMembers,
            families,
            signIn,
            signUp,
            signOut,
            hasRole,
            isAdmin,
            isTrainer,
            isMember
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Role-based access control helper
export function useRoleAccess() {
    const { hasRole, isAdmin, isTrainer, isMember, profile } = useAuth()

    return {
        // Check if user has any of the specified roles
        canAccess: (roles: Role | Role[]) => hasRole(roles),

        // Admin only functions
        isAdminUser: isAdmin,
        isTrainerUser: isTrainer,
        isMemberUser: isMember,

        // Role hierarchy checks
        canManageUsers: isAdmin(),
        canManageTrainers: isAdmin() || isTrainer(),
        canViewAllProgress: isAdmin() || isTrainer(),
        canCreateWorkouts: isAdmin() || isTrainer() || isMember(),

        // Current role
        currentRole: profile?.role || null,
    }
}