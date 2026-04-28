"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { SplitMenu } from "@/components/SplitMenu"
import { useAuth } from "@/app/contexts/AuthContext"
import { merriweather } from "@/app/layout"

export function Header() {
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            setIsVisible(currentScrollY < lastScrollY || currentScrollY < 10)
            setLastScrollY(currentScrollY)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [lastScrollY])

    // Lock body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [isMenuOpen])

    return (
        <>
            <header
                className={`fixed top-0 w-full h-20 flex items-center justify-between px-6 z-40 backdrop-blur-sm bg-slate-500/40 transition-transform duration-300 ${
                    isVisible ? "translate-y-0" : "-translate-y-full"
                }`}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image src="/logo.svg" alt="FRH" width={45} height={45} priority />
                </Link>

                {/* Right side: Book CTA + User avatar + Hamburger */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/services"
                        className="hidden md:inline-flex bg-[#BD2E2E] text-white text-sm px-4 py-2 rounded-md hover:bg-[#a02626] transition-colors"
                    >
                        Book A Session
                    </Link>

                    {/* User avatar — only shown when logged in */}
                    <UserMenu />

                    {/* Hamburger — visible on all screen sizes */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open menu"
                        className="flex flex-col gap-[5px] w-8 items-end group"
                    >
                        <span
                            className={`block h-px bg-gray-100 transition-all duration-300 ${
                                isMenuOpen ? "w-6 rotate-45 translate-y-[7px]" : "w-6"
                            }`}
                        />
                        <span
                            className={`block h-px bg-gray-100 transition-all duration-300 ${
                                isMenuOpen ? "w-6 opacity-0" : "w-4 group-hover:w-6"
                            }`}
                        />
                        <span
                            className={`block h-px bg-gray-100 transition-all duration-300 ${
                                isMenuOpen ? "w-6 -rotate-45 -translate-y-[7px]" : "w-6"
                            }`}
                        />
                    </button>
                </div>
            </header>

            {/* Split-screen menu overlay */}
            <SplitMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    )
}

// ── User menu ─────────────────────────────────────────────────────────────────

const MENU_ITEMS = [
    { label: "My Bookings",  href: "/bookings",  icon: CalendarIcon  },
    { label: "Settings",     href: "/settings",  icon: SettingsIcon  },
]

function UserMenu() {
    const { user, isAuthenticated, hydrated, logout, openAuthModal } = useAuth()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    // Close when clicking outside the menu
    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Don't render until Firebase has confirmed the session state
    if (!hydrated) return null

    // Not logged in — show a minimal sign-in button
    if (!isAuthenticated) {
        return (
            <button
                onClick={openAuthModal}
                className={`${merriweather.className} hidden md:inline-flex text-[9px] tracking-widest uppercase text-white/80 hover:text-white transition-colors`}
            >
                Sign in
            </button>
        )
    }

    const initials = getInitials(user)
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email

    return (
        <div ref={ref} className="relative">
            {/* Avatar button */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Account menu"
                aria-expanded={open}
                className="flex items-center gap-2 group"
            >
                <Avatar initials={initials} photoUrl={user?.photoURL} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-[calc(100%+12px)] w-64 bg-white rounded-sm shadow-xl border border-stone-100 overflow-hidden z-50">

                    {/* User identity */}
                    <div className="px-4 py-4 border-b border-stone-100 flex items-center gap-3">
                        <Avatar initials={initials} photoUrl={user?.photoURL} size="lg" />
                        <div className="min-w-0">
                            <p className={`${merriweather.className} text-sm font-bold text-stone-900 truncate`}>
                                {fullName}
                            </p>
                            <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
                        </div>
                    </div>

                    {/* Nav items */}
                    <nav className="py-1">
                        {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                            >
                                <Icon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Sign out */}
                    <div className="border-t border-stone-100 py-1">
                        <button
                            onClick={() => { logout(); setOpen(false) }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <SignOutIcon className="w-4 h-4 flex-shrink-0" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ initials, photoUrl, size = "sm" }) {
    const dim = size === "lg" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs"

    if (photoUrl) {
        return (
            <div className={`${dim} rounded-full overflow-hidden ring-2 ring-white/30`}>
                <Image src={photoUrl} alt="Profile" width={40} height={40} className="object-cover w-full h-full" />
            </div>
        )
    }

    return (
        <div className={`${dim} rounded-full bg-[#DDA15E] text-[#120D07] font-bold flex items-center justify-center ring-2 ring-white/20 flex-shrink-0`}>
            {initials}
        </div>
    )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(user) {
    if (!user) return "?"
    const first = user.firstName?.[0] ?? ""
    const last  = user.lastName?.[0]  ?? ""
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "?"
}

// ── Inline SVG icons (no extra package) ──────────────────────────────────────

function CalendarIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    )
}

function SettingsIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    )
}

function SignOutIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    )
}