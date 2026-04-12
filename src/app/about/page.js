"use client"

import About from "@/components/about"
import ParallaxImage from "@/components/ParallaxImage"
import { Bagelan, merriweather } from "@/app/layout"

const STORY_TAGS = ["Est. Lagos, Nigeria", "Natural Hair", "Root to Tip"]

export default function AboutPage() {
  return (
    <>
      {/* ── Mariam bio — reuse existing component ── */}
      <About />

      {/* ── Our Story ── */}
      <section id="story" className="bg-[#120D07] overflow-hidden">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 min-h-[85vh]">

          {/* Left: image */}
          <ParallaxImage
            src="/story.webp"
            alt="Flourish Roots Hair — Our Story"
            sizes="(max-width: 768px) 100vw, 50vw"
            strength={55}
            className="w-full min-h-[60vw] md:min-h-0"
          />

          {/* Right: content */}
          <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-16 md:py-24">

            <p className={`${merriweather.className} text-[#BD2E2E] text-xs tracking-[0.3em] uppercase mb-6`}>
              Our Story
            </p>

            <h2 className={`${Bagelan.className} text-[clamp(3rem,6vw,5rem)] text-white leading-none mb-6`}>
              BORN FROM<br />LIVED<br />EXPERIENCE
            </h2>

            <div className="w-12 h-px bg-[#DDA15E] mb-8" />

            <p className={`${merriweather.className} text-white/80 text-base leading-relaxed mb-5`}>
              Flourish Roots Hair Co. was built from the inside out. After years of struggling with hair loss, breakage, and advice that never worked for 4C hair, Mariam decided to become the expert she needed — and to share that expertise with every woman facing the same battle.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mb-10">
              What began as a personal journey became a Lagos-based movement: a salon and coaching practice rooted in science, culture, and genuine care. Every client who walks through our doors leaves knowing exactly how to care for their crown — from root to tip.
            </p>

            <div className="flex flex-wrap gap-2">
              {STORY_TAGS.map((tag) => (
                <span
                  key={tag}
                  className={`${merriweather.className} text-[10px] tracking-widest uppercase border border-white/20 text-white/40 px-3 py-1.5`}
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
