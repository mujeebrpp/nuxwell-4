'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Dumbbell, Menu, X, LogOut, LayoutDashboard, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { user, signOut } = useAuth()

    const isAuthPage = pathname?.startsWith('/auth') || pathname === '/login' || pathname === '/register'
    const isDashboard = pathname?.startsWith('/dashboard')


    const handleSignOut = async () => {
        await signOut()
        router.push('/')
        router.refresh()
    }

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/#features', label: 'Features' },
        { href: '/#pricing', label: 'Pricing' },
    ]

    if (isAuthPage || isDashboard) {
        return null
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-16 items-center justify-between gap-3 py-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 shadow-lg shadow-emerald-500/20">
                            <Dumbbell className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <span className="block text-base font-semibold tracking-tight text-slate-950">Nuxwell</span>
                            <span className="hidden text-xs text-slate-500 sm:block">Minimal wellness tracking</span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" className="rounded-full px-4">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button variant="outline" size="sm" onClick={() => {
                                                setIsMenuOpen(false)
                                                handleSignOut()
                                            }} className="rounded-full px-4">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="rounded-full px-4">Sign In</Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="rounded-full px-5">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="border-t border-slate-200/80 bg-white/95 px-4 pb-6 pt-4 shadow-xl shadow-slate-200/40 backdrop-blur md:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3">
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950"
                                >
                                    <span>{link.label}</span>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </Link>
                            ))}
                        </div>

                        <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-lg shadow-slate-300/30">
                            <p className="text-sm font-medium text-white/70">
                                {user ? 'Continue your progress' : 'Start with a clean, focused wellness dashboard'}
                            </p>
                            <div className="mt-4 space-y-3">
                                {user ? (
                                    <>
                                        <Link href="/dashboard" className="block" onClick={() => setIsMenuOpen(false)}>
                                            <Button className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Open Dashboard
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            onClick={handleSignOut}
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/register" className="block" onClick={() => setIsMenuOpen(false)}>
                                            <Button className="w-full rounded-2xl">Get Started</Button>
                                        </Link>
                                        <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="outline" className="w-full rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                                                Sign In
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
