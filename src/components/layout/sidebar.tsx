'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Dumbbell,
    LayoutDashboard,
    Calendar,
    Utensils,
    TrendingUp,
    User,
    Settings,
    LogOut
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRouter } from 'next/navigation'

const sidebarLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/workouts', label: 'Workouts', icon: Calendar },
    { href: '/dashboard/meals', label: 'Meals', icon: Utensils },
    { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
    const pathname = usePathname()
    const { signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-200">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900">Nuxwell</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href ||
                        (link.href !== '/dashboard' && pathname?.startsWith(link.href))

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                ${isActive
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }
              `}
                        >
                            <link.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-200 space-y-1">
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                    <Settings className="w-5 h-5 text-slate-400" />
                    Settings
                </Link>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all w-full"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
