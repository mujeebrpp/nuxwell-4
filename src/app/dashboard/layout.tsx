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
    const { user, profile, loading, hasRole } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (!loading && user && profile) {
            const pathname = window.location.pathname

            if (hasRole(['ADMIN', 'SUPERADMIN', 'MANAGER'])) {
                if (!pathname.startsWith('/dashboard/admin') && !pathname.startsWith('/dashboard/family')) {
                    router.push('/dashboard/admin')
                }
            } else if (profile.role === 'TRAINER') {
                if (!pathname.startsWith('/dashboard/trainer') && !pathname.startsWith('/dashboard/family')) {
                    router.push('/dashboard/trainer')
                }
            } else if (profile.role === 'LIFEGUARD') {
                if (!pathname.startsWith('/dashboard/lifeguard') && !pathname.startsWith('/dashboard/family')) {
                    router.push('/dashboard/lifeguard')
                }
            } else if (profile.role === 'MEMBER' || profile.role === 'USER') {
                if (!pathname.startsWith('/dashboard/member') && !pathname.startsWith('/dashboard/family')) {
                    router.push('/dashboard/member')
                }
            }
        }
    }, [user, profile, loading, router, hasRole])

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
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]" suppressHydrationWarning>
            <Sidebar />
            <main className="min-h-screen lg:pl-72">
                <div className="px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}