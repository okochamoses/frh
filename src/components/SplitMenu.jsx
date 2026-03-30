"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

// ---------------------------------------------------------------------------
// Nav data — swap image paths for real project assets later
// ---------------------------------------------------------------------------
const NAV_LINKS = [
  // Column A
  {
    id: "home",
    label: "Home",
    href: "/",
    col: "A",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
  },
  {
    id: "services",
    label: "Salon Services",
    href: "/services",
    col: "A",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
  },
  {
    id: "coaching",
    label: "Hair Coaching",
    href: "/consultation",
    col: "A",
    image: "https://images.unsplash.com/photo-1582095133179-bfd08e2fb6b8?w=1200&q=80",
  },
  {
    id: "about",
    label: "About Us",
    href: "/#about",
    col: "A",
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1200&q=80",
  },
  // Column B
  {
    id: "book",
    label: "Book A Session",
    href: "https://www.fresha.com/a/flourish-roots-hair-co-lagos-ago-palace-way-bxvf8kef/booking?allOffer=true&menu=true&pId=1427796",
    col: "B",
    external: true,
    image: "/salon.webp",
  },
  {
    id: "story",
    label: "Our Story",
    href: "/#story",
    col: "B",
    image: "https://images.unsplash.com/photo-1720010944710-01161d017608?q=80&w=3165&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "gallery",
    label: "Gallery",
    href: "/#gallery",
    col: "B",
    image: "/gallery.avif",
  },
  {
    id: "contact",
    label: "Contact",
    href: "/#contact",
    col: "B",
    image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&q=80",
  },
]

const DEFAULT_IMAGE = NAV_LINKS[0].image

// Menu slide-in easing
const MENU_EASE = [0.24, 0.43, 0.15, 0.97]

// Image crossfade easing — "Professional/Smooth": fast start, gentle deceleration
const IMAGE_EASE = [0.4, 0, 0.2, 1]

// ---------------------------------------------------------------------------
// Main SplitMenu component
// ---------------------------------------------------------------------------
export function SplitMenu({ isOpen, onClose }) {
  const [hoveredImage, setHoveredImage] = useState(null)

  const scheduleHover = useCallback((image) => {
    setHoveredImage(image)
  }, [])

  const colA = NAV_LINKS.filter((l) => l.col === "A")
  const colB = NAV_LINKS.filter((l) => l.col === "B")
  const activeImage = hoveredImage ?? DEFAULT_IMAGE

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30"
          />

          {/* Menu panel */}
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.42, ease: MENU_EASE }}
            className="fixed inset-0 z-50 flex"
          >
            {/* ── Left Pane: bottom-to-top reveal image (desktop only ≥1024px) ── */}
            <ImagePane activeImage={activeImage} />

            {/* ── Right Pane: navigation ── */}
            <div className="w-full lg:w-1/2 h-full bg-[#f5f5f0] flex flex-col overflow-y-auto">

              {/* Top bar */}
              <div className="flex items-center justify-between px-8 py-6 flex-shrink-0">
                <Link href="/" onClick={onClose} className="opacity-80 hover:opacity-100 transition-opacity">
                  <Image src="/logo.svg" alt="FRH" width={40} height={40} priority />
                </Link>

                {/* Close — two lines that spin apart on hover */}
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="relative w-10 h-10 flex items-center justify-center group"
                >
                  <span className="absolute block w-6 h-px bg-stone-800 rotate-45 transition-transform duration-300 group-hover:rotate-[135deg]" />
                  <span className="absolute block w-6 h-px bg-stone-800 -rotate-45 transition-transform duration-300 group-hover:rotate-45" />
                </button>
              </div>

              {/* Navigation grid
                  Desktop: 2 columns | Mobile: single column, no image transitions */}
              <nav
                className="flex-1 px-8 pt-6 pb-4"
                onMouseLeave={() => scheduleHover(null)}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                  <div className="flex flex-col">
                    {colA.map((link, i) => (
                      <NavLink
                        key={link.id}
                        link={link}
                        index={i}
                        onHover={scheduleHover}
                        onClick={onClose}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col">
                    {colB.map((link, i) => (
                      <NavLink
                        key={link.id}
                        link={link}
                        index={i + colA.length}
                        onHover={scheduleHover}
                        onClick={onClose}
                      />
                    ))}
                  </div>
                </div>
              </nav>

              {/* Footer — contact + socials */}
              <div className="px-8 py-6 border-t border-stone-200 flex-shrink-0">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-3">
                  Contact Us
                </p>
                <div className="flex flex-col gap-1 mb-5">
                  <a
                    href="mailto:hello@flourishroots.com"
                    className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    hello@flourishroots.com
                  </a>
                  <a
                    href="tel:+2340000000000"
                    className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    +234 000 000 0000
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <SocialIcon href="#" label="Instagram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
                    </svg>
                  </SocialIcon>

                  <SocialIcon href="#" label="Facebook">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </SocialIcon>

                  <SocialIcon href="#" label="WhatsApp">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                  </SocialIcon>

                  <SocialIcon href="#" label="TikTok">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.45a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.01-8.83a8.2 8.2 0 0 0 4.79 1.52V4.56a4.85 4.85 0 0 1-1.02-.13z" />
                    </svg>
                  </SocialIcon>

                  <SocialIcon href="#" label="YouTube">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20.06 12 20.06 12 20.06s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98l5.75 3.02-5.75 3.02z" />
                    </svg>
                  </SocialIcon>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Image pane — unlimited simultaneous reveals.
//
//  Layer 0 (bottom): last fully-settled image. Static, never clips.
//  Layers 1…N:       each hover pushes a new independent reveal layer.
//                    All animate concurrently — 10 hovers = 10 layers.
//
//  When a layer completes:
//    • Its image becomes the new bottom.
//    • All layers below it (id ≤ completed id) are removed — they are
//      now permanently covered by the settled bottom image.
//    • Layers above it (id > completed id) keep animating unaffected.
// ---------------------------------------------------------------------------
function ImagePane({ activeImage }) {
  const [bottomImage, setBottomImage] = useState(activeImage)
  const [reveals, setReveals]         = useState([]) // [{ id, image }, ...]

  const bottomRef = useRef(activeImage)
  const counterRef = useRef(0)

  useEffect(() => {
    if (!activeImage || activeImage === bottomRef.current) return
    const id = counterRef.current++
    setReveals(prev => [...prev, { id, image: activeImage }])
  }, [activeImage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRevealComplete = useCallback((id, image) => {
    bottomRef.current = image
    setBottomImage(image)
    // Remove this layer and every layer beneath it (now covered by settled bottom)
    setReveals(prev => prev.filter(r => r.id > id))
  }, [])

  return (
    <div className="hidden lg:flex relative w-1/2 h-full overflow-hidden bg-stone-900 select-none">
      {/* Bottom layer — outgoing image, never animated, always visible */}
      <div className="absolute inset-0">
        <Image
          src={bottomImage}
          alt="Menu visual"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
      </div>

      {/* Reveal layers — each hover spawns one; all animate independently */}
      {reveals.map(({ id, image }) => (
        <motion.div
          key={id}
          className="absolute inset-0"
          initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.05 }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)",   scale: 1    }}
          transition={{
            clipPath: { duration: 0.6, ease: IMAGE_EASE },
            scale:    { duration: 1.5, ease: [0.25, 1, 0.5, 1] },
          }}
          onAnimationComplete={() => handleRevealComplete(id, image)}
        >
          <Image
            src={image}
            alt="Menu visual"
            fill
            className="object-cover"
            sizes="50vw"
          />
        </motion.div>
      ))}

      {/* Persistent dark veil above both layers */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none z-10" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Individual nav link
// Mobile: only text/arrow animation fires — no image side effects (left pane
// is hidden via CSS, so scheduleHover calls are harmless no-ops visually)
// ---------------------------------------------------------------------------
function NavLink({ link, index, onHover, onClick }) {
  const [hovered, setHovered] = useState(false)

  const Tag = link.external ? "a" : Link
  const extraProps = link.external
    ? { href: link.href, target: "_blank", rel: "noopener noreferrer" }
    : { href: link.href }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 + index * 0.045, ease: MENU_EASE }}
    >
      <Tag
        {...extraProps}
        onClick={onClick}
        onMouseEnter={() => { setHovered(true); onHover(link.image) }}
        onMouseLeave={() => { setHovered(false) }}
        className="group flex items-center gap-2 py-3 border-b border-stone-200/60 last:border-0"
      >
        {/* Arrow — slides in from left on hover */}
        <motion.span
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -8 }}
          transition={{ duration: 0.18 }}
          className="text-[#BD2E2E] flex-shrink-0"
        >
          <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
        </motion.span>

        {/* Label nudges right on hover */}
        <motion.span
          initial={false}
          animate={{ x: hovered ? 4 : 0 }}
          transition={{ duration: 0.2, ease: MENU_EASE }}
          className="text-2xl lg:text-3xl font-light tracking-tight text-stone-800 group-hover:text-stone-900"
        >
          {link.label}
        </motion.span>
      </Tag>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Social icon button
// ---------------------------------------------------------------------------
function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-300 text-stone-400 hover:border-stone-800 hover:text-stone-800 transition-colors duration-200"
    >
      {children}
    </a>
  )
}