"use client"

import { useState } from "react"
import { Bagelan, merriweather } from "@/app/layout"

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/frh_naturals/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/FRH-Flourish-Roots-Hair-Co/61570171119138/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/2348110215014",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@frhnaturals",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.45a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.01-8.83a8.2 8.2 0 0 0 4.79 1.52V4.56a4.85 4.85 0 0 1-1.02-.13z" />
      </svg>
    ),
  },
]

const inputClass = `w-full bg-transparent border-b border-stone-300 focus:border-[#120D07] py-3 text-sm text-stone-800 placeholder-stone-400 outline-none transition-colors duration-200`

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const text = encodeURIComponent(
      `Hi, I'm ${form.name}.\nEmail: ${form.email}${form.phone ? `\nPhone: ${form.phone}` : ""}\n\n${form.message}`
    )
    window.open(`https://wa.me/2348110215014?text=${text}`, "_blank")
    setSent(true)
    setForm({ name: "", email: "", phone: "", message: "" })
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <>
      {/* ── Hero ── */}
      <div className="bg-[#120D07] pt-36 pb-16 px-6 text-center">
        <p className={`${merriweather.className} text-[#DDA15E] text-xs tracking-[0.3em] uppercase mb-4`}>
          We&apos;d love to hear from you
        </p>
        <h1 className={`${Bagelan.className} text-[clamp(3.5rem,12vw,8rem)] text-white leading-none`}>
          CONTACT US
        </h1>
      </div>

      {/* ── Main: form left, map right ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[700px]">

        {/* Left — form + contact details */}
        <div className="bg-[#faf9f7] px-8 md:px-12 lg:px-16 py-14 flex flex-col justify-between">

          {/* Form */}
          <div>
            <p className={`${merriweather.className} text-xs tracking-[0.3em] uppercase text-[#BD2E2E] mb-8`}>
              Send a Message
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
              <div>
                <label className={`${merriweather.className} text-[10px] tracking-widest uppercase text-stone-400 block mb-1`}>
                  Full Name <span className="text-[#BD2E2E]">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`${merriweather.className} text-[10px] tracking-widest uppercase text-stone-400 block mb-1`}>
                  Email <span className="text-[#BD2E2E]">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`${merriweather.className} text-[10px] tracking-widest uppercase text-stone-400 block mb-1`}>
                  Phone <span className="text-stone-300">(optional)</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+234 — —"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={`${merriweather.className} text-[10px] tracking-widest uppercase text-stone-400 block mb-1`}>
                  Message <span className="text-[#BD2E2E]">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                className={`${merriweather.className} inline-flex items-center justify-center gap-3 bg-[#120D07] text-white text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-[#BD2E2E] transition-colors duration-300 self-start`}
              >
                {sent ? "Message Sent ✓" : (
                  <>
                    Send via WhatsApp
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact details strip */}
          <div className="mt-14 pt-10 border-t border-stone-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <p className={`${merriweather.className} text-[10px] tracking-widest uppercase text-stone-400 mb-2`}>Address</p>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Shop 303, Destiny Plaza,<br />
                  Ago Palace Way, Lagos
                </p>
              </div>
              <div>
                <p className={`${merriweather.className} text-[10px] tracking-widest uppercase text-stone-400 mb-2`}>Contact</p>
                <a href="tel:+2348110215014" className="block text-stone-600 hover:text-stone-900 text-sm transition-colors">+234 81 1021 5014</a>
                <a href="tel:+2348161672820" className="block text-stone-600 hover:text-stone-900 text-sm transition-colors">+234 81 6167 2820</a>
                <a href="mailto:flourishnaturalsinfo@gmail.com" className="block text-stone-600 hover:text-stone-900 text-sm transition-colors break-all mt-1">
                  flourishnaturalsinfo@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {SOCIALS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-stone-300 text-stone-400 hover:border-stone-800 hover:text-stone-800 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Right — Google Map */}
        <div className="min-h-[400px] md:min-h-0 w-full h-full">
          <iframe
            title="Flourish Roots Hair Co. location"
            src="https://maps.google.com/maps?q=Destiny+Plaza,+Ago+Palace+Way,+Lagos,+Nigeria&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "400px", display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

      </div>
    </>
  )
}
