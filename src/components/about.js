"use client"

import { Bagelan, merriweather } from "@/app/layout";
import Link from "next/link";
import ParallaxImage from "./ParallaxImage";

const CREDENTIALS = [
  "Certified Hair Coach",
  "Natural Hair Specialist",
  "Salon Owner",
  "Lagos, Nigeria",
]

const About = () => {
  return (
    <section id="about" className="bg-[#faf9f7] py-0 overflow-hidden">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 min-h-[85vh]">

        {/* ── Left: Portrait ── */}
        <ParallaxImage
          src="/ceo.png"
          alt="Mariam Okocha Ijeoma — Founder & Hair Coach"
          sizes="(max-width: 768px) 100vw, 50vw"
          strength={55}
          priority
          className="w-full h-[420px] md:h-auto md:min-h-0 bg-stone-200"
        >
          {/* Bottom gradient for name tag on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden pointer-events-none" />
          <div className="absolute bottom-6 left-6 md:hidden">
            <p className={`${Bagelan.className} text-4xl text-white leading-none`}>MARIAM</p>
            <p className={`${merriweather.className} text-white/70 text-xs tracking-widest uppercase mt-1`}>Founder & Hair Coach</p>
          </div>
        </ParallaxImage>

        {/* ── Right: Content ── */}
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-16 md:py-20">

          {/* Label */}
          <p className={`${merriweather.className} text-[#BD2E2E] text-xs tracking-[0.3em] uppercase mb-6`}>
            About the Founder
          </p>

          {/* Name — desktop only */}
          <h2 className={`${Bagelan.className} hidden md:block text-[clamp(3rem,6vw,5rem)] text-stone-900 leading-none mb-6`}>
            MARIAM<br />OKOCHA<br />IJEOMA
          </h2>

          {/* Divider */}
          <div className="w-12 h-px bg-[#DDA15E] mb-8" />

          {/* Bio */}
          <p className={`${merriweather.className} text-stone-700 text-base leading-relaxed mb-5`}>
            I&apos;m a certified hair coach, salon owner, and the founder of Flourish Roots Hair Co. I&apos;ve lived through the frustration of hair loss, dryness, and postpartum shedding — and I built this brand to help 4C queens like you finally understand, love, and grow their hair.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mb-10">
            With a focus on personalised care and expert guidance, I provide the knowledge, tools, and support you need to embrace your natural beauty — from scalp health and simple routines to curated essentials that help your hair flourish from root to tip.
          </p>

          {/* Credential tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CREDENTIALS.map((c) => (
              <span
                key={c}
                className={`${merriweather.className} text-[10px] tracking-widest uppercase border border-stone-300 text-stone-500 px-3 py-1.5`}
              >
                {c}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-6">
            <Link
              href="/consultation"
              className={`${merriweather.className} inline-flex items-center gap-3 bg-[#120D07] text-white text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-[#BD2E2E] transition-colors duration-300`}
            >
              Work With Me
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/about#story"
              className={`${merriweather.className} text-xs tracking-widest uppercase text-stone-400 hover:text-stone-800 transition-colors duration-200 border-b border-transparent hover:border-stone-800 pb-0.5`}
            >
              Our Story
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}

export default About;
