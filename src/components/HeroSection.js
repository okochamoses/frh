'use client'

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { Bagelan, merriweather } from "@/app/layout";

export default function HeroSection() {
  const containerRef  = useRef(null);
  const img1Ref       = useRef(null);   // primary image
  const img2Ref       = useRef(null);   // secondary image
  const gradientRef   = useRef(null);
  const brandRef      = useRef(null);
  const textLeftRef   = useRef(null);
  const textRightRef  = useRef(null);
  const ctaRef        = useRef(null);
  const accentPathRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(accentPathRef.current, { strokeDasharray: 220, strokeDashoffset: 220 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Stage 1 — images slide up from below, staggered speeds
      tl.from(img1Ref.current, {
          y: "18vh",
          opacity: 0,
          duration: 1.6,
        }, 0)
        .from(img2Ref.current, {
          y: "24vh",
          opacity: 0,
          duration: 1.9,
        }, 0.1)

        // Stage 3 — background gradient bloom
        .fromTo(
          gradientRef.current,
          { opacity: 0, scale: 0.2 },
          { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" },
          0.55
        )

        // Stage 4a — brand name: fade + letter-spacing collapse
        .fromTo(
          brandRef.current,
          { opacity: 0, letterSpacing: "0.55em", y: -12 },
          { opacity: 1, letterSpacing: "0.22em", y: 0, duration: 1.1 },
          0.85
        )

        // Stage 4b — side text slides outward from center
        .from(textLeftRef.current, {
          opacity: 0,
          x: 24,
          duration: 0.85,
        }, 1.15)
        .from(textRightRef.current, {
          opacity: 0,
          x: -24,
          duration: 0.85,
        }, 1.25)

        // Stage 5 — CTA
        .from(ctaRef.current, {
          opacity: 0,
          y: 16,
          duration: 0.7,
        }, 1.55)

        // Stage 5 — accent line sweep
        .to(accentPathRef.current, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 1.3,
          ease: "power2.inOut",
        }, 1.65);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      id="hero"
      className="relative flex items-center justify-center w-full overflow-hidden"
      style={{ height: "100svh", backgroundColor: "#F4EDE2" }}
    >
      {/* Radial gradient bloom — "lit from within" golden-hour glow */}
      <div
        ref={gradientRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 58% 62% at 50% 58%, rgba(204,118,68,0.32) 0%, rgba(221,155,100,0.16) 48%, transparent 72%)",
        }}
      />

      {/* Brand name — top center */}
      <div
        ref={brandRef}
        className="absolute top-28 left-0 right-0 flex justify-center z-30 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <h1
          className={`${Bagelan.className} text-xl sm:text-2xl md:text-3xl text-stone-700`}
          style={{ letterSpacing: "0.22em" }}
        >
          FLOURISH ROOTS HAIR
        </h1>
      </div>

      {/* Left tagline */}
      <div
        ref={textLeftRef}
        className={`${merriweather.className} absolute left-6 sm:left-10 md:left-16 top-1/2 -translate-y-1/2 z-20 pointer-events-none`}
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col items-end gap-3 text-right">
          <span className="text-[0.6rem] sm:text-xs tracking-[0.35em] text-stone-500 uppercase">
            Promoting
          </span>
          <span
            className="block w-6 border-t border-stone-400"
            style={{ borderTopWidth: "0.5px" }}
          />
          <span className="text-[0.6rem] sm:text-xs tracking-[0.35em] text-stone-500 uppercase">
            Natural
          </span>
        </div>
      </div>

      {/* Portrait images — centered, slightly overlapping */}
      <div className="relative flex items-end justify-center gap-2 sm:gap-3 z-10 w-full h-full pt-28 pb-24 px-4">
        {/* Secondary image — shorter, left-leaning */}
        <div
          ref={img2Ref}
          className="relative flex-shrink-0 rounded-xl overflow-hidden shadow-lg"
          style={{
            width: "clamp(110px, 22vw, 220px)",
            height: "clamp(200px, 52vh, 560px)",
            opacity: 0,
          }}
        >
          <Image
            src="/long-hair.webp"
            alt=""
            fill
            sizes="(max-width: 768px) 22vw, 220px"
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Primary image — tallest, center anchor */}
        <div
          ref={img1Ref}
          className="relative flex-shrink-0 rounded-xl overflow-hidden shadow-2xl z-20"
          style={{
            width: "clamp(130px, 26vw, 260px)",
            height: "clamp(240px, 64vh, 680px)",
            opacity: 0,
          }}
        >
          <Image
            src="/ceo.webp"
            alt="Flourish Roots Hair"
            fill
            sizes="(max-width: 768px) 26vw, 260px"
            className="object-cover object-top"
            priority
          />
        </div>
      </div>

      {/* Right tagline */}
      <div
        ref={textRightRef}
        className={`${merriweather.className} absolute right-6 sm:right-10 md:right-16 top-1/2 -translate-y-1/2 z-20 pointer-events-none`}
        style={{ opacity: 0 }}
      >
        <div className="flex flex-col items-start gap-3">
          <span className="text-[0.6rem] sm:text-xs tracking-[0.35em] text-stone-500 uppercase">
            Healthier
          </span>
          <span
            className="block w-6 border-t border-stone-400"
            style={{ borderTopWidth: "0.5px" }}
          />
          <span className="text-[0.6rem] sm:text-xs tracking-[0.35em] text-stone-500 uppercase">
            Hair
          </span>
        </div>
      </div>

      {/* CTA — bottom center */}
      <div
        ref={ctaRef}
        className="absolute bottom-10 sm:bottom-12 left-0 right-0 flex justify-center z-30"
        style={{ opacity: 0 }}
      >
        <Link href="/services">
          <button className="bg-[#BD2E2E] hover:bg-[#9e2626] text-white text-[0.65rem] py-4 px-10 tracking-[0.25em] uppercase transition-colors duration-300">
            Book a Salon Visit
          </button>
        </Link>
      </div>

      {/* Geometric accent — sweeping curve, bottom-left */}
      <div className="absolute bottom-10 sm:bottom-12 left-6 sm:left-10 z-30 pointer-events-none">
        <svg
          width="140"
          height="48"
          viewBox="0 0 140 48"
          fill="none"
          overflow="visible"
          aria-hidden="true"
        >
          <path
            ref={accentPathRef}
            d="M4 40 C 28 40, 48 8, 80 12 S 118 20, 136 6"
            stroke="#BD2E2E"
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="round"
            style={{ opacity: 0 }}
          />
        </svg>
      </div>
    </div>
  );
}
