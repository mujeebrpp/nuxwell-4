'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuth } from '@/lib/hooks/use-auth'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    // Redirect to role-specific dashboard
    useEffect(() => {
        if (!loading && user && profile) {
            const currentPath = window.location.pathname

            // Only redirect if not already on role-specific dashboard
            if (profile.role === 'ADMIN' && !currentPath.startsWith('/dashboard/admin')) {
                router.push('/dashboard/admin')
            } else if (profile.role === 'TRAINER' && !currentPath.startsWith('/dashboard/trainer')) {
                router.push('/dashboard/trainer')
            } else if (profile.role === 'MEMBER' && !currentPath.startsWith('/dashboard/member')) {
                router.push('/dashboard/member')
            } else if (profile.role === 'USER' && !currentPath.startsWith('/dashboard/user')) {
                router.push('/dashboard/user')
            }
        }
    }, [user, profile, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <main className="pl-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
