'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
    Shield,
    Users,
    Dumbbell,
    Utensils,
    Calendar,
    BarChart3,
    MessageSquare
} from 'lucide-react'
import Link from 'next/link'

const trainerLinks = [
    { href: '/dashboard/trainer', label: 'Dashboard', icon: BarChart3 },
    { href: '/dashboard/trainer/clients', label: 'My Clients', icon: Users },
    { href: '/dashboard/trainer/workouts', label: 'Workout Plans', icon: Dumbbell },
    { href: '/dashboard/trainer/meals', label: 'Meal Plans', icon: Utensils },
    { href: '/dashboard/trainer/calendar', label: 'Schedule', icon: Calendar },
    { href: '/dashboard/trainer/messages', label: 'Messages', icon: MessageSquare },
]

export default function TrainerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && (!profile || (profile.role !== 'TRAINER' && profile.role !== 'ADMIN'))) {
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

    if (!profile || (profile.role !== 'TRAINER' && profile.role !== 'ADMIN')) {
        return null
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <aside className="fixed left-0 top-0 h-screen w-64 bg-emerald-900 text-white flex flex-col">
                <div className="p-6 border-b border-emerald-800">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-400" />
                        <div>
                            <h1 className="text-lg font-bold">Trainer Panel</h1>
                            <p className="text-xs text-emerald-400">Nuxwell</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {trainerLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100 hover:bg-emerald-800 transition-all"
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-emerald-800">
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
                            <p className="text-xs text-emerald-400">TRAINER</p>
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
