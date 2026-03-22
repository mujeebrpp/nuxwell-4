'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Dumbbell,
    LayoutDashboard,
    Calendar,
    Utensils,
    TrendingUp,
    User,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'

const sidebarLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/workouts', label: 'Workouts', icon: Calendar },
    { href: '/dashboard/meals', label: 'Meals', icon: Utensils },
    { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, signOut } = useAuth()
    const router = useRouter()
    const [isMobileOpen, setIsMobileOpen] = useState(false)


    const handleSignOut = async () => {
        await signOut()
        router.push('/')
        router.refresh()
    }

    const sidebarContent = (
        <>
            <div className="border-b border-slate-200 px-4 py-4">
                <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-1">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 shadow-lg shadow-emerald-500/20">
                        <Dumbbell className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="font-semibold tracking-tight text-slate-950">Nuxwell</p>
                        <p className="text-xs text-slate-500">Wellness control center</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href ||
                        (link.href !== '/dashboard' && pathname?.startsWith(link.href))

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all ${isActive
                                ? 'bg-slate-950 text-white shadow-lg shadow-slate-300/40'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                                }`}
                        >
                            <link.icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="border-t border-slate-200 p-4 space-y-2">
                {user && (
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
                            <span className="text-sm font-medium text-white">
                                {user.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                                {user.email?.split('@')[0]}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                                {user.email}
                            </p>
                        </div>
                    </div>
                )}
                <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950"
                >
                    <Settings className="h-5 w-5 text-slate-400" />
                    Settings
                </Link>
                <button
                    onClick={() => {
                        setIsMobileOpen(false)
                        handleSignOut()
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-medium text-red-600 transition-all hover:bg-red-50"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </>
    )

    return (
        <>
            <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
                <div className="flex items-center justify-between gap-3">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950">
                            <Dumbbell className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-950">Nuxwell</p>
                            <p className="text-xs text-slate-500">Dashboard</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
                        aria-label="Toggle sidebar"
                        aria-expanded={isMobileOpen}
                    >
                        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {isMobileOpen && (
                <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-72 flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 lg:w-72 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:z-30`}>
                {sidebarContent}
            </aside>
        </>
    )
}
