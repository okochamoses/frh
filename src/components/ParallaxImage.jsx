"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"

/**
 * Scroll-driven parallax image.
 *
 * The inner image extends `strength`px beyond the container on all sides so
 * translating it never reveals a gap. Drop into any container that has a
 * defined height — overflow:hidden is applied internally.
 *
 * Props:
 *   src, alt, sizes, priority — passed to next/image
 *   strength  — px of travel (default 60); keep ≤80 for "light" feel
 *   className — applied to the outer wrapper (set height here, e.g. "h-full")
 *   children  — rendered above the image (overlays, text, etc.)
 */
export default function ParallaxImage({
  src,
  alt,
  sizes,
  priority,
  strength = 60,
  className = "",
  children,
  id,
}) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength])

  return (
    <div id={id} ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute left-0 right-0"
        style={{
          top: -strength,
          bottom: -strength,
          y,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
        />
      </motion.div>

      {/* Overlays sit above the parallax layer */}
      {children && <div className="absolute inset-0 z-10">{children}</div>}
    </div>
  )
}
