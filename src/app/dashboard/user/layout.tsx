'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
    User,
    Dumbbell,
    Utensils,
    TrendingUp,
    HelpCircle,
    Star
} from 'lucide-react'
import Link from 'next/link'

const userLinks = [
    { href: '/dashboard/user', label: 'Dashboard', icon: TrendingUp },
    { href: '/dashboard/user/workouts', label: 'Workouts', icon: Dumbbell },
    { href: '/dashboard/user/meals', label: 'Meals', icon: Utensils },
    { href: '/dashboard/user/upgrade', label: 'Upgrade to Pro', icon: Star },
    { href: '/dashboard/user/help', label: 'Help & Support', icon: HelpCircle },
]

export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && (!profile || profile.role !== 'USER')) {
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

    if (!profile || profile.role !== 'USER') {
        return null
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-800 text-white flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-slate-400" />
                        <div>
                            <h1 className="text-lg font-bold">My Dashboard</h1>
                            <p className="text-xs text-slate-400">Nuxwell</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {userLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-all"
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {profile.fullName?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {profile.fullName || profile.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-slate-400">FREE USER</p>
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
