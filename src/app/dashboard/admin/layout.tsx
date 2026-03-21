'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
    Shield,
    Users,
    Settings,
    BarChart3,
    Dumbbell,
    Utensils,
    Calendar
} from 'lucide-react'
import Link from 'next/link'

const adminLinks = [
    { href: '/dashboard/admin', label: 'Overview', icon: BarChart3 },
    { href: '/dashboard/admin/users', label: 'User Management', icon: Users },
    { href: '/dashboard/admin/trainers', label: 'Trainers', icon: Shield },
    { href: '/dashboard/admin/workouts', label: 'All Workouts', icon: Dumbbell },
    { href: '/dashboard/admin/meals', label: 'All Meals', icon: Utensils },
    { href: '/dashboard/admin/calendar', label: 'Calendar', icon: Calendar },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && (!profile || profile.role !== 'ADMIN')) {
            router.push('/dashboard')
        }
    }, [profile, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        )
    }

    if (!profile || profile.role !== 'ADMIN') {
        return null
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        <div>
                            <h1 className="text-lg font-bold">Admin Panel</h1>
                            <p className="text-xs text-slate-400">Nuxwell</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {adminLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {profile.fullName?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {profile.fullName || profile.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-emerald-400">ADMIN</p>
                        </div>
                    </div>
                </div>
            </aside>
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
