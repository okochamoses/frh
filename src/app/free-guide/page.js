"use client"

import * as React from "react"
import Link from "next/link"
import { merriweather, Bagelan, figtree } from "@/app/layout"
import { Check, ArrowRight, Star, MapPin, Video } from "lucide-react"

// ─── Brand tokens ──────────────────────────────────────────────────────────────
const DARK  = "#120D07"
const GOLD  = "#DDA15E"
const RED   = "#BD2E2E"
const CREAM = "#f5f5f0"

// ─── Copy ──────────────────────────────────────────────────────────────────────
const BADGE     = "Free Download"
const HEADLINE  = "Finally Grow Longer, Healthier 4C Hair For Free"
const SUBHEAD   = "Download the guide trusted by Nigerian women to stop breakage, retain length and build a simple routine that actually works."

const STATS = [
  { value: "7", label: "Proven Secrets" },
  { value: "Free", label: "100% Free" },
  { value: "4C", label: "Specific" },
]

const KEY_FEATURES = [
  "Moisture Made Easy",
  "Detangling Blueprint",
  "Nighttime Routine",
  "Growth Secrets",
  "Protective Styles",
  "Product Decoder",
]

const FORM_TITLE    = "Get Your Free Guide Instantly"
const FORM_SUBTITLE = "Enter your details below and we'll send it straight to your inbox."
const CTA_LABEL     = "Send Me the Free Guide"
const PRIVACY_NOTE  = "No spam. Unsubscribe anytime. Your details are safe with us."
const SUCCESS_MSG   = "You're in! Check your inbox for your free guide. Welcome to the FRH family, Queen!"

const VALUE_PROPS = [
  { title: "Stop Breakage",    body: "The real reason your hair snaps and how to fix it." },
  { title: "Retain Length",    body: "Simple habits that keep every inch you grow." },
  { title: "Save Money",       body: "Stop wasting ₦ on products that don't work." },
  { title: "Ayurvedic Tips",   body: "Natural, Nigerian-friendly hair care secrets." },
]

const TESTIMONIALS = [
  {
    quote: "Literally one of the best natural hair salons I've visited in Lagos. The service is top notch! My hair felt so good and healthy after — I'm definitely making you guys my go-to hair salon.",
    name: "Adaugo Ugochukwu",
    detail: "Lagos, Nigeria",
  },
  {
    quote: "I had been struggling with breakage for 2 years. After my consultation with Mariam, I finally understood my hair. Three months later my edges are back and I'm retaining length for the first time in years!",
    name: "Temi N.",
    detail: "Lagos, Nigeria",
  },
]

// ─── Book mockup ───────────────────────────────────────────────────────────────
function BookMockup() {
  return (
    <div className="relative flex items-center justify-center" style={{ perspective: "900px" }}>
      <div
        className="relative rounded-r-lg"
        style={{
          width: 190,
          height: 255,
          background: `linear-gradient(135deg, ${DARK} 0%, #2a1f12 55%, #1a1108 100%)`,
          transform: "rotateY(-16deg) rotateX(3deg)",
          transformStyle: "preserve-3d",
          boxShadow: `10px 14px 44px rgba(0,0,0,0.6), 2px 0 0 rgba(255,255,255,0.04) inset`,
        }}
      >
        {/* Spine */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-l"
          style={{ width: 18, background: "linear-gradient(to right, #0a0804, #1e1509)", borderRight: `1px solid rgba(255,255,255,0.06)` }}
        />

        {/* Cover */}
        <div className="absolute inset-0 flex flex-col items-center justify-between px-5 pt-7 pb-5 ml-4">
          <div className="w-full h-px" style={{ background: GOLD, opacity: 0.6 }} />

          <p
            className={`${merriweather.className} text-center mt-2`}
            style={{ color: GOLD, fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.85 }}
          >
            Free Download
          </p>

          <div className="flex-1 flex flex-col items-center justify-center gap-2 mt-2">
            <p
              className={`${merriweather.className} text-center`}
              style={{ color: "rgba(221,161,94,0.7)", fontSize: 8.5, letterSpacing: "0.15em", textTransform: "uppercase" }}
            >
              7 Proven Secrets
            </p>
            <p
              className={`${Bagelan.className} text-center leading-tight`}
              style={{ color: "#fff", fontSize: 17, lineHeight: 1.22 }}
            >
              The Ultimate 4C Hair Survival Guide
            </p>
          </div>

          <div className="w-8 h-px my-2" style={{ background: GOLD, opacity: 0.45 }} />

          <p
            className={`${merriweather.className} text-center mb-1`}
            style={{ color: "rgba(255,255,255,0.4)", fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase" }}
          >
            Flourish Roots Hair
          </p>
          <div className="w-full h-px" style={{ background: GOLD, opacity: 0.6 }} />
        </div>

        {/* Page edge */}
        <div
          className="absolute right-0 top-1 bottom-1 rounded-sm"
          style={{ width: 6, background: "linear-gradient(to right, #e8e0d4, #f5f0e8)", boxShadow: "inset -1px 0 2px rgba(0,0,0,0.12)" }}
        />
      </div>

      {/* Shadow */}
      <div
        className="absolute"
        style={{
          bottom: -6, left: "50%",
          width: 145, height: 16,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.38) 0%, transparent 72%)",
          transform: "translateX(-40%)",
          filter: "blur(5px)",
        }}
      />
    </div>
  )
}

// ─── Stars ─────────────────────────────────────────────────────────────────────
function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} fill={GOLD} style={{ color: GOLD }} />
      ))}
    </div>
  )
}

// ─── Form ──────────────────────────────────────────────────────────────────────
function LeadForm({ onSuccess }) {
  const [email, setEmail]               = React.useState("")
  const [firstName, setFirstName]       = React.useState("")
  const [status, setStatus]             = React.useState("idle")
  const [errorMessage, setErrorMessage] = React.useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    setErrorMessage("")
    try {
      const res  = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), firstName: firstName.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setErrorMessage(data.error || "Something went wrong. Please try again.")
        return
      }
      onSuccess()
    } catch {
      setStatus("error")
      setErrorMessage("Something went wrong. Please try again.")
      setStatus("idle")
    }
  }

  const inputBase = {
    background: "rgba(18,13,7,0.04)",
    border: `1.5px solid rgba(18,13,7,0.15)`,
    color: DARK,
    borderRadius: 8,
    width: "100%",
    padding: "12px 16px",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.18s",
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Value props */}
      <ul className="space-y-2.5 mb-5">
        {VALUE_PROPS.map(({ title, body }, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(18,13,7,0.07)", border: `1px solid rgba(18,13,7,0.15)` }}
            >
              <Check size={10} style={{ color: DARK }} strokeWidth={3} />
            </span>
            <span className="text-sm leading-snug" style={{ color: "rgba(18,13,7,0.75)" }}>
              <strong style={{ color: DARK, fontWeight: 600 }}>{title}:</strong>{" "}{body}
            </span>
          </li>
        ))}
      </ul>

      {/* First name */}
      <div className="space-y-1.5">
        <label
          htmlFor="fg-firstname"
          className={`${merriweather.className} block text-xs font-semibold uppercase tracking-widest`}
          style={{ color: DARK }}
        >
          First Name
        </label>
        <input
          id="fg-firstname"
          type="text"
          placeholder="e.g. Adaeze"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={status === "loading"}
          autoComplete="given-name"
          style={inputBase}
          onFocus={(e) => (e.target.style.borderColor = DARK)}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(18,13,7,0.15)")}
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="fg-email"
          className={`${merriweather.className} block text-xs font-semibold uppercase tracking-widest`}
          style={{ color: DARK }}
        >
          Email Address
        </label>
        <input
          id="fg-email"
          type="email"
          placeholder="e.g. adaeze@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
          autoComplete="email"
          style={inputBase}
          onFocus={(e) => (e.target.style.borderColor = DARK)}
          onBlur={(e)  => (e.target.style.borderColor = "rgba(18,13,7,0.15)")}
        />
      </div>

      {errorMessage && (
        <p className="text-sm font-medium" style={{ color: RED }}>{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        className="w-full rounded-lg py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: RED }}
      >
        {status === "loading" ? "Sending…" : (
          <>{CTA_LABEL} <ArrowRight size={15} strokeWidth={2.5} /></>
        )}
      </button>

      <p className="text-xs text-center" style={{ color: "rgba(18,13,7,0.4)" }}>
        {PRIVACY_NOTE}
      </p>
    </form>
  )
}

// ─── Success ───────────────────────────────────────────────────────────────────
function SuccessCard() {
  return (
    <div className="flex flex-col items-center text-center py-2 space-y-5">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "rgba(18,13,7,0.07)", border: `1.5px solid rgba(18,13,7,0.15)` }}
      >
        <Check size={28} style={{ color: DARK }} strokeWidth={2.5} />
      </div>
      <p
        className={`${merriweather.className} text-base font-light leading-relaxed`}
        style={{ color: "rgba(18,13,7,0.7)" }}
      >
        {SUCCESS_MSG}
      </p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function FreeGuidePage() {
  const [submitted, setSubmitted] = React.useState(false)

  return (
    <main style={{ background: CREAM, minHeight: "100vh" }}>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: DARK }}>
        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 65% 55% at 25% 50%, rgba(221,161,94,0.08) 0%, transparent 70%)` }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Left — value prop */}
          <div className="flex flex-col space-y-7 md:pt-4">

            {/* Badge */}
            <div className="flex">
              <span
                className={`${merriweather.className} inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest`}
                style={{ background: "rgba(221,161,94,0.12)", color: GOLD, border: `1px solid rgba(221,161,94,0.28)` }}
              >
                {BADGE}
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className={`${Bagelan.className} text-4xl md:text-5xl lg:text-[3.1rem] leading-[1.08] text-white`}>
                {HEADLINE}
              </h1>
              <p
                className={`${merriweather.className} text-base md:text-lg font-light leading-relaxed`}
                style={{ color: "rgba(255,255,255,0.58)" }}
              >
                {SUBHEAD}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 flex-wrap">
              {STATS.map(({ value, label }, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col">
                    <span
                      className={`${Bagelan.className} text-2xl leading-none`}
                      style={{ color: GOLD }}
                    >
                      {value}
                    </span>
                    <span
                      className={`${merriweather.className} text-xs mt-0.5`}
                      style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STATS.length - 1 && (
                    <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Key features grid */}
            <div>
              <p
                className={`${merriweather.className} text-xs uppercase tracking-[0.25em] mb-4`}
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                What's inside
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {KEY_FEATURES.map((feat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.07)` }}
                  >
                    <span
                      className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: "rgba(221,161,94,0.18)" }}
                    >
                      <Check size={8} style={{ color: GOLD }} strokeWidth={3} />
                    </span>
                    <span
                      className={`${merriweather.className} text-xs font-light`}
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — book + form */}
          <div className="flex flex-col items-center">
            <div className="mb-10">
              <BookMockup />
            </div>

            <div
              className="w-full max-w-sm rounded-2xl p-7 shadow-2xl"
              style={{ background: "#fff", border: `1px solid rgba(18,13,7,0.06)` }}
            >
              {submitted ? (
                <SuccessCard />
              ) : (
                <>
                  <div className="mb-6 space-y-1.5">
                    <h2
                      className={`${merriweather.className} text-lg font-semibold`}
                      style={{ color: DARK }}
                    >
                      {FORM_TITLE}
                    </h2>
                    <p className="text-sm" style={{ color: "rgba(18,13,7,0.5)" }}>
                      {FORM_SUBTITLE}
                    </p>
                  </div>
                  <LeadForm onSuccess={() => setSubmitted(true)} />
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <p
            className={`${merriweather.className} text-sm font-light`}
            style={{ color: "rgba(18,13,7,0.5)" }}
          >
            Already loving your hair?{" "}
            <span style={{ color: DARK, fontWeight: 600 }}>Book a session.</span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Salon */}
          <div
            className="rounded-2xl p-7 flex flex-col gap-5"
            style={{ background: "#fff", border: `1px solid rgba(18,13,7,0.07)` }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(18,13,7,0.07)" }}
            >
              <MapPin size={18} style={{ color: DARK }} strokeWidth={1.8} />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3
                className={`${merriweather.className} font-semibold text-base`}
                style={{ color: DARK }}
              >
                Salon Services
              </h3>
              <p className="text-sm" style={{ color: "rgba(18,13,7,0.55)" }}>
                Ago Palace Way, Isolo Lagos
              </p>
            </div>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: DARK }}
            >
              Book Now <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Coaching */}
          <div
            className="rounded-2xl p-7 flex flex-col gap-5"
            style={{ background: DARK, border: `1px solid rgba(255,255,255,0.06)` }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(221,161,94,0.15)" }}
            >
              <Video size={18} style={{ color: GOLD }} strokeWidth={1.8} />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3
                className={`${merriweather.className} font-semibold text-base text-white`}
              >
                Hair Coaching
              </h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                Virtual or In-Person
              </p>
            </div>
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: GOLD, color: DARK }}
            >
              Book a Session <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: DARK }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 60% 70% at 50% 110%, rgba(221,161,94,0.06) 0%, transparent 65%)` }}
          aria-hidden="true"
        />
        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-24">
          <div className="text-center mb-12">
            <p
              className={`${merriweather.className} text-xs uppercase tracking-[0.3em] mb-3`}
              style={{ color: GOLD }}
            >
              What Nigerian women are saying
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map(({ quote, name, detail }, i) => (
              <div
                key={i}
                className="rounded-2xl p-7 flex flex-col gap-5"
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.07)` }}
              >
                <Stars />
                <blockquote
                  className={`${merriweather.className} text-sm font-light leading-relaxed italic flex-1`}
                  style={{ color: "rgba(255,255,255,0.72)" }}
                >
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <div>
                  <p className={`${Bagelan.className} text-base`} style={{ color: GOLD }}>
                    {name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer strip ───────────────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{ background: "#0c0905", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <p className={`${Bagelan.className} text-lg`} style={{ color: "#fff" }}>
              Flourish Roots Hair Co.
            </p>
            <p
              className={`${merriweather.className} text-xs font-light`}
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Promoting Healthier Hair
            </p>
          </div>

          <div
            className={`${merriweather.className} text-xs font-light space-y-1.5 text-right`}
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <p>Shop 303, Destiny Plaza, Ago Palace Way, Isolo Lagos</p>
            <p>
              <a
                href="https://instagram.com/frh_naturals"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity"
              >
                @frh_naturals
              </a>
              {" · "}
              <a
                href="mailto:flourishnaturalsinfo@gmail.com"
                className="hover:opacity-70 transition-opacity"
              >
                flourishnaturalsinfo@gmail.com
              </a>
            </p>
          </div>
        </div>
      </footer>

    </main>
  )
}