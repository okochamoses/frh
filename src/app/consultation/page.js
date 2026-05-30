"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { merriweather, Bagelan } from "@/app/layout"
import { motion, AnimatePresence, useInView } from "framer-motion"
import Link from "next/link"
import { ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react"

// ─── Brand tokens ────────────────────────────────────────────────────────────
const DARK   = "#120D07"
const GOLD   = "#DDA15E"
const RED    = "#BD2E2E"
const CREAM  = "#f5f5f0"

// ─── Data ────────────────────────────────────────────────────────────────────
const services = [
  {
    price: "₦50,000",
    priceLabel: "per session",
    link: "https://paystack.com/buy/1-on-1-hair-coaching-cqtffb",
    title: "1-on-1 Hair Coaching",
    description: "Personalized guidance built entirely around your texture, lifestyle, and goals. No generic advice — just your plan.",
    items: ["Full hair and scalp assessment", "Personalized product recommendations", "Custom routine plan", "Virtual or in-person"],
    perfectFor: "Best for: Women ready to stop guessing",
    cta: "Book Now",
  },
  {
    price: "₦30,000",
    priceLabel: "per session",
    link: "https://paystack.com/buy/scalp-care-consultation-ewdznz",
    title: "Scalp Care Consultation",
    description: "Itchy, flaky, or stalled growth? We identify the root cause and build a treatment plan that actually fixes it.",
    items: ["In-depth scalp analysis", "Tailored treatment plan", "Product recommendations", "Optional in-salon treatment"],
    perfectFor: "Best for: Dandruff, inflammation, buildup, slow growth",
    cta: "Book Now",
  },
  {
    price: "₦20,000",
    priceLabel: "per session",
    link: "https://paystack.com/buy/build-your-routine-session-vpzhbk",
    title: "Build-Your-Routine Session",
    description: "Cut through the noise. Walk away with a complete weekly and monthly regimen — simple, sustainable, and yours.",
    items: ["Weekly + monthly routine plan", "Product layering guidance", "Printable routine checklist", "Customized to your schedule"],
    perfectFor: "Best for: Busy women who need clarity, not more content",
    cta: "Book Now",
  },
  {
    price: "₦150,000",
    priceLabel: "3-month program",
    link: "https://paystack.com/buy/intensive-hair-growth-program-3-months-fdbjqq",
    title: "Intensive Hair Growth Program",
    description: "90 days of structured coaching, in-salon treatments, protective styling, and consistent expert support. Real transformation — not maintenance.",
    items: ["Full hair and scalp assessment", "Weekly coaching check-ins", "Monthly protective styles + deep treatments", "Growth tracking + progress photos", "Access to exclusive resources"],
    perfectFor: "Best for: Women serious about permanent transformation",
    cta: "Apply Now",
    featured: true,
  },
]

const painPoints = [
  "My hair breaks every time I touch it",
  "I've been natural for years and it still won't grow",
  "My scalp is always itchy, flaky, or inflamed",
  "I transitioned from relaxer but I don't know how to care for my hair",
  "I've spent serious money on products that delivered nothing",
  "Postpartum shedding has taken so much from me",
]

const credentials = ["Certified Hair Coach", "Salon Owner", "4C Hair Specialist", "Ayurvedic Hair Care", "Lagos Based"]

const whyCards = [
  { title: "Relaxers Compromise Your Scalp", description: "Harsh alkaline agents burn the scalp, weaken follicles, and cause damage that doesn't reverse. Your scalp deserves better." },
  { title: "Natural Hair Is Remarkably Strong", description: "Properly cared for, 4C hair unlocks length, density, and shine you didn't know was waiting." },
  { title: "One Session Replaces Years of Guessing", description: "Stop paying for products that don't work. One expert session gives you a routine built to last years." },
  { title: "Your Hair Shapes How You Move", description: "When your hair is thriving, you feel it everywhere. Healthy hair isn't vanity — it's self-care that shows." },
]

const testimonials = [
  { text: "I had been natural for three years and my hair still wasn't growing. After one session, Mariam gave me a routine that works. My edges are back and my hair is longer than it's ever been.", author: "Adaeze O.", detail: "Lagos Island · 1-on-1 Coaching" },
  { text: "After my second baby, my hair was shedding badly. Within six weeks of Mariam's plan, it stopped completely. She doesn't just coach hair — she genuinely cares.", author: "Fatimah B.", detail: "Surulere · Scalp Consultation" },
  { text: "My hair grew four inches. The protective styles were beautiful and the coaching kept me consistent. Worth every kobo. I've already referred three friends.", author: "Chisom N.", detail: "Lekki · 3-Month Program" },
]

const steps = [
  { title: "Send a WhatsApp", description: "Tell us your concerns and which service interests you. No forms, no waiting — just a conversation." },
  { title: "Confirm Your Session", description: "We lock in your date and time — virtual via video call or in-person at our Ago Palace Way salon, Isolo." },
  { title: "Pay Securely", description: "Pay via bank transfer, Paystack, or cash (in-person). Payment confirms your booking." },
  { title: "Start Flourishing", description: "Receive your personalized plan and watch your hair respond. We're with you every step." },
]

const faqs = [
  { question: "Can I book virtually if I'm not in Lagos?", answer: "Yes. All coaching sessions are available via video call. We have clients across Nigeria and in the diaspora." },
  { question: "I just transitioned from relaxer. Where do I start?", answer: "Start with 1-on-1 Hair Coaching. We'll assess your hair, explain your type and porosity, and build a simple routine for your newly natural hair." },
  { question: "Will you recommend expensive foreign products?", answer: "Never. We focus on affordable, accessible products in Nigeria — including our own Ayurvedic hair mask range made right here in Lagos." },
  { question: "How long before I see results?", answer: "Most clients notice a difference in 2–4 weeks. Significant length retention and growth typically shows within 3 months of consistency." },
  { question: "Do you work with men?", answer: "Yes. Scalp health is for everyone. Message us on WhatsApp to book." },
  { question: "What if I'm not satisfied with my session?", answer: "Reach out within 48 hours and we'll make it right — no conditions." },
]

const stats = [
  { value: 200, suffix: "+", label: "Women Helped" },
  { value: "4C", suffix: "", label: "Hair Specialist" },
  { value: 3, suffix: "+", label: "Years Experience" },
  { value: "Lagos", suffix: "", label: "Based + Virtual" },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Fade + slide up on scroll
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.24, 0.43, 0.15, 0.97] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated counter that counts up when it enters view
function AnimatedCount({ value, suffix = "" }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(typeof value === "number" ? 0 : value)

  useEffect(() => {
    if (!inView || typeof value !== "number") return
    let start = 0
    const end = value
    const duration = 1200
    const step = 16
    const increment = (end / duration) * step
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Consultation() {
  const [openFaq, setOpenFaq]     = useState(null)
  const [slide, setSlide]         = useState(0)
  const [direction, setDirection] = useState(1)

  const primaryLink = services[0].link

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setSlide((s) => (s - 1 + testimonials.length) % testimonials.length)
  }, [])

  const nextSlide = useCallback(() => {
    setDirection(1)
    setSlide((s) => (s + 1) % testimonials.length)
  }, [])

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i)

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <div className="flex flex-col items-center pt-20">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="w-full" style={{ background: DARK }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em]"
            style={{ borderColor: `${GOLD}50`, color: GOLD }}
          >
            Lagos' Premier Natural Hair Studio
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className={`${Bagelan.className} max-w-4xl text-5xl leading-tight text-white sm:text-6xl md:text-7xl`}
          >
            YOUR HAIR WAS NEVER<br className="hidden sm:block" /> THE PROBLEM.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className={`${merriweather.className} mt-5 max-w-2xl text-sm leading-7 sm:text-base`}
            style={{ color: "rgba(255,255,255,0.70)" }}
          >
            You've done everything right — and still, your hair isn't thriving.<br className="hidden sm:block" /> That changes today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.38 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href={primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-7 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: RED }}
            >
              Book Your Session
            </Link>
            <Link
              href="#services"
              className="rounded-md border px-7 py-3 text-sm font-semibold transition-all hover:bg-white/10"
              style={{ borderColor: `${GOLD}60`, color: GOLD }}
            >
              See All Services
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-6 border-t sm:grid-cols-4"
            style={{ borderColor: `${GOLD}25` }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="pt-6 text-center">
                <p className={`${merriweather.className} text-2xl font-semibold sm:text-3xl`} style={{ color: GOLD }}>
                  <AnimatedCount value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.50)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pain Points ───────────────────────────────────────────────────── */}
      <section className="w-full" style={{ background: CREAM }}>
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <p className={`${merriweather.className} mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]`} style={{ color: GOLD }}>
              Sound Familiar?
            </p>
            <h2 className={`${merriweather.className} text-3xl font-bold sm:text-4xl`} style={{ color: DARK }}>
              You're Not the Problem — Your Routine Is
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {painPoints.map((item, i) => (
              <Reveal key={item} delay={i * 0.07}>
                <div
                  className="group flex items-start gap-3 rounded-xl border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{ borderColor: `${GOLD}30` }}
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110"
                    style={{ background: RED }}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <p className="text-sm leading-6" style={{ color: DARK }}>{item}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3} className="mt-8 text-center">
            <p className={`${merriweather.className} text-base font-semibold`} style={{ color: DARK }}>
              You don't need more products. You need a plan built for your hair.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section className="w-full" style={{ background: DARK }}>
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
          <Reveal>
            <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${GOLD}30` }}>
              <img
                src="/ceo.png"
                alt="Mariam — hair coach"
                className="h-full min-h-[300px] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <p
              className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ background: `${GOLD}20`, color: GOLD }}
            >
              Meet Your Hair Coach
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold leading-tight text-white sm:text-4xl`}>
              I'm Mariam — I've Sat Exactly Where You're Sitting
            </h2>
            <p className="mt-4 text-sm leading-7" style={{ color: "rgba(255,255,255,0.75)" }}>
              I'm a certified hair coach, salon owner, and African woman who has personally lived through hair loss,
              dryness, and postpartum shedding.
            </p>
            <p className="mt-3 text-sm leading-7" style={{ color: "rgba(255,255,255,0.75)" }}>
              I built Flourish Roots because Nigerian women deserve expert, culturally rooted care — not generic
              tutorials or expensive imports.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {credentials.map((c) => (
                <span
                  key={c}
                  className="rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: `${GOLD}40`, color: GOLD }}
                >
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why Natural Hair Care ──────────────────────────────────────────── */}
      <section className="w-full" style={{ background: "#faf9f7" }}>
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p
              className={`${merriweather.className} mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]`}
              style={{ background: `${GOLD}20`, color: DARK }}
            >
              Hair Care is Health Care
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold sm:text-4xl`} style={{ color: DARK }}>
              Why This Work Matters
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {whyCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.1}>
                <div
                  className="group rounded-xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{ borderColor: `${GOLD}25` }}
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full" style={{ background: `${GOLD}20` }}>
                    <span className="text-sm font-bold" style={{ color: DARK }}>{i + 1}</span>
                  </div>
                  <h3 className={`${merriweather.className} text-base font-semibold`} style={{ color: DARK }}>
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{card.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="mx-auto mt-10 max-w-3xl rounded-xl p-8 text-center" style={{ background: DARK }}>
              <p className={`${merriweather.className} text-lg italic leading-relaxed text-white`}>
                "Hair care is not vanity — it is health care. Your scalp is skin. Your follicles are living organs.
                Treat them accordingly."
              </p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                — Mariam Okocha Ijeoma, Flourish Roots Hair Co.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section id="services" className="w-full bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p
              className={`${merriweather.className} mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]`}
              style={{ background: `${GOLD}15`, color: DARK }}
            >
              Our Services
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold sm:text-4xl`} style={{ color: DARK }}>
              Choose Your Hair Journey
            </h2>
            <p className="mt-3 text-sm text-stone-500">
              Every service is designed for the Nigerian woman — our hair, our climate, our reality.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <Reveal key={service.title} delay={i * 0.09}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    service.featured ? "ring-2" : ""
                  }`}
                  style={{
                    borderColor: service.featured ? GOLD : "#e5e7eb",
                    ...(service.featured ? { ringColor: GOLD } : {}),
                  }}
                >
                  {service.featured && (
                    <p
                      className="absolute -top-3 right-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow"
                      style={{ background: RED }}
                    >
                      Most Sought-After
                    </p>
                  )}

                  <div className="mb-4">
                    <span className="text-2xl font-bold" style={{ color: DARK }}>{service.price}</span>
                    <span className="ml-1.5 text-xs text-stone-400">{service.priceLabel}</span>
                  </div>

                  <h3 className={`${merriweather.className} text-base font-semibold leading-snug`} style={{ color: DARK }}>
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{service.description}</p>

                  <ul className="mt-4 space-y-2 text-sm">
                    {service.items.map((item) => (
                      <li key={item} className="flex items-start gap-2" style={{ color: DARK }}>
                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full" style={{ background: `${GOLD}25` }}>
                          <Check size={9} style={{ color: DARK }} strokeWidth={3} />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 text-xs text-stone-400">{service.perfectFor}</p>

                  <div className="mt-auto pt-5">
                    <Link
                      href={service.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-md py-2.5 text-center text-sm font-semibold transition-all hover:opacity-90"
                      style={
                        service.featured
                          ? { background: RED, color: "#fff" }
                          : { background: DARK, color: "#fff" }
                      }
                    >
                      {service.cta}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div
              className="mx-auto mt-8 max-w-2xl rounded-xl border p-4 text-center text-sm font-semibold"
              style={{ borderColor: `${RED}40`, background: `${RED}08`, color: RED }}
            >
              Only 5 spaces available this month for the Intensive Program.
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Testimonials (carousel) ────────────────────────────────────────── */}
      <section className="w-full overflow-hidden" style={{ background: CREAM }}>
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p
              className={`${merriweather.className} mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]`}
              style={{ background: `${GOLD}20`, color: DARK }}
            >
              Real Results
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold sm:text-4xl`} style={{ color: DARK }}>
              What Our Clients Are Saying
            </h2>
          </Reveal>

          <div className="relative mx-auto mt-10 max-w-2xl">
            <div className="overflow-hidden rounded-2xl border bg-white px-8 py-10 shadow-sm" style={{ borderColor: `${GOLD}25` }}>
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={slide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.24, 0.43, 0.15, 0.97] }}
                >
                  {/* Stars */}
                  <div className="mb-5 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="h-4 w-4" viewBox="0 0 20 20" fill={GOLD}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className={`${merriweather.className} text-base italic leading-8`} style={{ color: DARK }}>
                    "{testimonials[slide].text}"
                  </p>
                  <div className="mt-6">
                    <p className="font-semibold" style={{ color: DARK }}>{testimonials[slide].author}</p>
                    <p className="text-xs text-stone-400">{testimonials[slide].detail}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > slide ? 1 : -1); setSlide(i) }}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: i === slide ? "2rem" : "0.5rem", background: i === slide ? DARK : `${DARK}30` }}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevSlide}
                  className="flex h-9 w-9 items-center justify-center rounded-full border transition-all hover:bg-stone-100"
                  style={{ borderColor: `${DARK}25` }}
                  aria-label="Previous"
                >
                  <ChevronLeft size={16} style={{ color: DARK }} />
                </button>
                <button
                  onClick={nextSlide}
                  className="flex h-9 w-9 items-center justify-center rounded-full border transition-all hover:bg-stone-100"
                  style={{ borderColor: `${DARK}25` }}
                  aria-label="Next"
                >
                  <ChevronRight size={16} style={{ color: DARK }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="w-full" style={{ background: DARK }}>
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <h2 className={`${merriweather.className} text-3xl font-semibold text-white sm:text-4xl`}>
              Four Steps to the Hair You've Always Wanted
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm" style={{ color: "rgba(255,255,255,0.60)" }}>
              Getting started is as simple as sending a message.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="group flex flex-col items-center text-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold transition-transform duration-300 group-hover:scale-110"
                    style={{ background: GOLD, color: DARK }}
                  >
                    {i + 1}
                  </div>
                  <h3 className={`${merriweather.className} mt-5 text-base font-semibold text-white`}>{step.title}</h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: "rgba(255,255,255,0.65)" }}>{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p
              className={`${merriweather.className} mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]`}
              style={{ background: `${GOLD}15`, color: DARK }}
            >
              FAQ
            </p>
            <h2 className={`${merriweather.className} text-3xl font-semibold sm:text-4xl`} style={{ color: DARK }}>
              Your Questions, Answered
            </h2>
            <p className="mt-3 text-sm text-stone-500">Honest answers for Nigerian women who've heard it all before.</p>
          </Reveal>

          <div className="mx-auto mt-10 max-w-3xl divide-y" style={{ borderColor: "#e5e7eb" }}>
            {faqs.map((faq, i) => (
              <Reveal key={faq.question} delay={i * 0.05}>
                <button
                  onClick={() => toggleFaq(i)}
                  className="flex w-full items-start justify-between py-5 text-left"
                >
                  <h3
                    className={`${merriweather.className} pr-6 text-sm font-semibold leading-6 sm:text-base`}
                    style={{ color: DARK }}
                  >
                    {faq.question}
                  </h3>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: GOLD }}
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.24, 0.43, 0.15, 0.97] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-7 text-stone-500">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="w-full" style={{ background: DARK }}>
        <div className="mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className={`${Bagelan.className} text-5xl text-white sm:text-6xl md:text-7xl`}>
              YOUR HAIR JOURNEY<br className="hidden sm:block" /> STARTS TODAY
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className={`${merriweather.className} mx-auto mt-5 max-w-xl text-sm leading-7`} style={{ color: "rgba(255,255,255,0.65)" }}>
              Stop waiting for the right time. Your hair is ready when you are. Let's build your routine, restore your
              scalp, and grow the hair you've always wanted — together.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: RED }}
              >
                Book Your Session
              </Link>
              <Link
                href="#services"
                className="rounded-md border px-8 py-3 text-sm font-semibold transition-all hover:bg-white/10"
                style={{ borderColor: `${GOLD}60`, color: GOLD }}
              >
                View Services
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}