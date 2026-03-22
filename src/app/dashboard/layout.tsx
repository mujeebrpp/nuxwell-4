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

    useEffect(() => {
        if (!loading && user && profile) {
            const currentPath = window.location.pathname

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
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]">
            <Sidebar />
            <main className="min-h-screen lg:pl-72">
                <div className="px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
