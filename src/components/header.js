"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu as MenuIcon, X } from "lucide-react"
import { Menu } from "@/components/menu"

export function Header() {
    const [isVisible, setIsVisible] = useState(true)
    const [showMenu, setShowMenu] = useState(false)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            setIsVisible(currentScrollY < lastScrollY)
            setLastScrollY(currentScrollY)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [lastScrollY])

    const handleMenuClick = () => setShowMenu(!showMenu)

    return (
        <>
            <header
                className={`fixed top-0 w-full h-20 flex items-center justify-between px-6 z-50 backdrop-blur-sm bg-white/10 transition-transform duration-300 ${
                    isVisible ? "translate-y-0" : "-translate-y-full"
                }`}
            >
                {/* Left: Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/logo.svg" alt="FRH" width={45} height={45} priority />
                </Link>

                {/* Right: Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8 text-gray-700 font-medium text-sm">
                    <Link
                        href="/"
                        className="hover:text-gray-900 transition-colors"
                    >
                        • HOME
                    </Link>
                    <Link
                        href="/services"
                        className="hover:text-gray-900 transition-colors"
                    >
                        • SALON SERVICES
                    </Link>
                    <Link
                        href="/consultation"
                        className="hover:text-gray-900 transition-colors"
                    >
                        • CONSULTATIONS
                    </Link>
                </nav>

                {/* Right: Mobile Hamburger */}
                <button
                    onClick={handleMenuClick}
                    className="md:hidden flex items-center justify-center focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    {showMenu ? (
                        <X className="h-7 w-7 text-gray-800" />
                    ) : (
                        <MenuIcon className="h-7 w-7 text-gray-800" />
                    )}
                </button>
            </header>

            {/* Slide-in Mobile Menu */}
            <Menu showMenu={showMenu} handleMenuClick={handleMenuClick}>
                <div className="flex flex-col space-y-4 text-lg font-medium text-gray-800 p-6">
                    <Link
                        href="/services"
                        onClick={handleMenuClick}
                        className="hover:text-[#BD2E2E] transition-colors"
                    >
                        Salon Services
                    </Link>
                    <Link
                        href="/consultation"
                        onClick={handleMenuClick}
                        className="hover:text-[#BD2E2E] transition-colors"
                    >
                        Consultation Services
                    </Link>
                </div>
            </Menu>
        </>
    )
}
