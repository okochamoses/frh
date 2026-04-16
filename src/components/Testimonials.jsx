"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { merriweather, Bagelan } from "@/app/layout"

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "The ambience was calm, clean, and beautifully arranged — the kind of space that makes you relax the moment you step in. The stylists were absolutely perfect. They understood exactly what I wanted, handled my locs with so much care, and the retie came out neat and flawless. Beyond their skill, they were warm, attentive, and genuinely professional. Overall, it was a great visit, and I'll definitely be returning.",
    name: "Verified Client",
    tag: "Google Review · Salon Client",
  },
  {
    id: 2,
    quote:
      "Literally one of the best natural hair salons I've visited in Lagos, the service is top notch! They handled my hair with such care, I had zero complaints. My hair felt so good and healthy after, I'm definitely making you guys my go to hair salon.",
    name: "Adaugo Ugochukwu",
    tag: "Google Review · Salon Client",
  },
  {
    id: 3,
    quote:
      "Such an amazing experience! My hair was handled with such delicate care — I absolutely loved it. Hands down, the best natural hair salon!",
    name: "Amira",
    tag: "Google Review · Salon Client",
  },
  {
    id: 4,
    quote:
      "Experience is 10/10. Professionalism is top notch. Definitely earned a returning customer and referrals.",
    name: "Jovita Dim-Nzekwe",
    tag: "Google Review · Salon Client",
  },
  {
    id: 5,
    quote:
      "I had a great experience. I loved how my hair was nurtured and cared for as well as the amazing transformation.",
    name: "Francisca A.",
    tag: "Fresha Review · Salon Client",
  },
]

const Stars = () => (
  <div className="flex items-center gap-1 justify-center mb-8">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className="w-4 h-4 text-[#DDA15E]" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  const go = useCallback(
    (index) => {
      setDirection(index > active ? 1 : -1)
      setActive(index)
    },
    [active]
  )

  const next = useCallback(() => {
    const index = (active + 1) % TESTIMONIALS.length
    setDirection(1)
    setActive(index)
  }, [active])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, paused])

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  }

  return (
    <section
      className="relative bg-[#120D07] overflow-hidden py-24 md:py-32 px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Decorative large quote mark */}
      <div
        className={`${Bagelan.className} absolute top-0 left-1/2 -translate-x-1/2 text-[20rem] leading-none text-white/[0.03] select-none pointer-events-none`}
        aria-hidden="true"
      >
        "
      </div>

      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">

        {/* Label */}
        <p className={`${merriweather.className} text-[#DDA15E] text-xs tracking-[0.3em] uppercase mb-12`}>
          What Our Clients Say
        </p>

        {/* Testimonial carousel */}
        <div className="w-full min-h-[280px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="w-full"
            >
              <Stars />

              <blockquote
                className={`${merriweather.className} text-white/80 text-lg md:text-xl lg:text-2xl font-light leading-relaxed italic mb-10`}
              >
                &ldquo;{TESTIMONIALS[active].quote}&rdquo;
              </blockquote>

              <div className="flex flex-col items-center gap-1">
                <span className={`${Bagelan.className} text-[#DDA15E] text-2xl tracking-wide`}>
                  {TESTIMONIALS[active].name}
                </span>
                <span className="text-white/30 text-xs tracking-widest uppercase">
                  {TESTIMONIALS[active].tag}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center gap-3 mt-12">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 h-1.5 bg-[#DDA15E]"
                  : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
