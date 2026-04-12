"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { merriweather, Bagelan } from "@/app/layout"
import ParallaxImage from "./ParallaxImage"

const STEPS = [
  {
    number: "01",
    title: "Book a\nConsultation",
    description:
      "Start with a discovery session where we get to know your hair story — your history, struggles, and goals.",
    image: "/hair-coaching.jpeg",
    alt: "Hair coaching consultation",
  },
  {
    number: "02",
    title: "Assess Your\nHair & Scalp",
    description:
      "We take a deep look at your hair type, scalp health, porosity, and current routine to understand exactly what your hair needs.",
    image: "/scalp-issues.webp",
    alt: "Hair and scalp assessment",
  },
  {
    number: "03",
    title: "Get Your\nPersonal Plan",
    description:
      "You receive a fully tailored hair care plan — products, techniques, and routines built specifically for your hair.",
    image: "/comb.webp",
    alt: "Personalised hair care plan",
  },
  {
    number: "04",
    title: "Watch Your\nHair Flourish",
    description:
      "With ongoing check-ins and expert support, you'll see real, lasting results — retention, growth, and confidence.",
    image: "/long-hair.webp",
    alt: "Hair transformation results",
  },
]

function Step({ step, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Image */}
      <ParallaxImage
        src={step.image}
        alt={step.alt}
        sizes="(max-width: 768px) 100vw, 25vw"
        strength={40}
        className="w-full aspect-[4/5] rounded-sm bg-stone-100"
      >
        {/* Step number overlay */}
        <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
          <div className="h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <span
          className={`${Bagelan.className} absolute bottom-4 left-4 text-5xl text-white/90 leading-none`}
        >
          {step.number}
        </span>
      </ParallaxImage>

      {/* Text */}
      <div>
        <h3
          className={`${merriweather.className} text-xl font-bold text-stone-900 leading-snug mb-2 whitespace-pre-line`}
        >
          {step.title}
        </h3>
        <p className="text-stone-500 text-sm leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  )
}

export default function HowItWorks() {
  const headingRef = useRef(null)
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" })

  return (
    <section className="bg-[#faf9f7] py-24 md:py-32 px-6">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <p className={`${merriweather.className} text-[#BD2E2E] text-xs tracking-[0.3em] uppercase mb-3`}>
              The Coaching Journey
            </p>
            <h2
              className={`${merriweather.className} text-4xl md:text-5xl font-bold text-stone-900 leading-tight max-w-md`}
            >
              How Hair Coaching Works
            </h2>
          </div>
          <p className="text-stone-500 max-w-xs text-sm leading-relaxed md:text-right">
            A structured, personalised process designed to help you understand and grow your natural hair — for good.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {STEPS.map((step, i) => (
            <Step key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="mt-16 flex justify-center"
        >
          <Link
            href="/consultation"
            className={`${merriweather.className} inline-flex items-center gap-3 bg-[#120D07] text-white text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-[#BD2E2E] transition-colors duration-300`}
          >
            Start Your Hair Journey
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
