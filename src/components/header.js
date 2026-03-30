"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { SplitMenu } from "@/components/SplitMenu"

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

                {/* Right side: Book CTA (desktop) + Hamburger */}
                <div className="flex items-center gap-6">
                    <a
                        href="https://www.fresha.com/a/flourish-roots-hair-co-lagos-ago-palace-way-bxvf8kef/booking?allOffer=true&menu=true&pId=1427796"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:inline-flex bg-[#BD2E2E] text-white text-sm px-4 py-2 rounded-md hover:bg-[#a02626] transition-colors"
                    >
                        Book A Session
                    </a>

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