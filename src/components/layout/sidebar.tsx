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
    X,
    Waves,
    Coffee,
    Award,
    Users,
    QrCode,
    BarChart3,
    Activity,
    Target,
    ArrowLeftRight,
    Shield,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'

const sidebarLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/workouts', label: 'Workouts', icon: Dumbbell },
    { href: '/dashboard/posture', label: 'Posture', icon: Target },
    { href: '/dashboard/mobility', label: 'Mobility', icon: Activity },
    { href: '/dashboard/balance', label: 'Balance', icon: ArrowLeftRight },
    { href: '/dashboard/swimming', label: 'Swimming', icon: Waves },
    { href: '/dashboard/pools', label: 'Pool Booking', icon: Waves },
    { href: '/dashboard/tea', label: 'Tea Hub', icon: Coffee },
    { href: '/dashboard/family', label: 'My Family', icon: Users },
    { href: '/dashboard/rewards', label: 'Rewards', icon: Award },
    { href: '/dashboard/qr', label: 'QR Self-Service', icon: QrCode },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/meals', label: 'Meals', icon: Utensils },
    { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, profile, signOut, hasRole } = useAuth()
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
                        <Waves className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="font-semibold tracking-tight text-slate-950">Nuxwell</p>
                        <p className="text-xs text-slate-500">Wellness & Tea Hub</p>
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
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                        >
                            <link.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            {hasRole(['ADMIN', 'SUPERADMIN']) && (
                <nav className="flex-1 space-y-1 p-4">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Panel</div>
                    <Link
                        href="/dashboard/admin"
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all ${pathname === '/dashboard/admin' || pathname?.startsWith('/dashboard/admin')
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                            : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                    >
                        <Shield className="h-5 w-5" />
                        Admin Panel
                    </Link>
                </nav>
            )}

            <div className="border-t border-slate-200 p-4 space-y-2">
                {user && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                            <span className="text-sm font-medium text-white">
                                {profile?.fullName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                                {profile?.fullName || user.email?.split('@')[0]}
                            </p>
                            <p className="truncate text-xs text-slate-500 capitalize">
                                {profile?.role?.toLowerCase()} member
                            </p>
                        </div>
                    </div>
                )}
                <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-slate-600 transition-all hover:bg-emerald-50 hover:text-emerald-700"
                >
                    <Settings className="h-5 w-5 text-emerald-500" />
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
            <div className="sticky top-0 z-40 border-b border-emerald-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
                <div className="flex items-center justify-between gap-3">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600">
                            <Waves className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-950">Nuxwell</p>
                            <p className="text-xs text-slate-500">Wellness Hub</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-700 shadow-sm"
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

            <aside className={`fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-72 flex-col border-r border-emerald-200 bg-white shadow-2xl transition-transform duration-300 lg:w-72 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:z-30`}>
                {sidebarContent}
            </aside>
        </>
    )
}