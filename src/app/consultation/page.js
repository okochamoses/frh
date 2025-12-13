"use client"

import React from "react"
import { Bagelan, merriweather } from "@/app/layout"
import Marquee from "react-fast-marquee"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import Link from "next/link";

const productsList = [
  {
    image: "/coaching.png",
    link: "https://paystack.com/buy/1-on-1-hair-coaching-cqtffb",
    title: "‍💻 1-on-1 Hair Coaching",
    description:
        "Personalized support designed for your unique texture, lifestyle, and goals. Get expert guidance, product recommendations, and coaching that meets you where you are — from beginner to advanced.",
    items: [
      "✅ Perfect for: Women ready to stop guessing and start growing.",
      "📍 Virtual or in-person sessions available.",
    ],
  },
  {
    image: "/scalp-issues.png",
    link: "https://paystack.com/buy/scalp-care-consultation-ewdznz",
    title: "🧖🏾‍ Scalp Care Consultation",
    description:
        "Is your scalp itchy, flaky, or holding you back from growth? We’ll do a scalp analysis and build a treatment plan to restore balance, reduce buildup, and bring life back to your roots.",
    items: [
      "✅ Includes tailored product suggestions and an optional treatment session.",
      "📍 Available virtually or with an in-salon care boost.",
    ],
  },
  {
    image: "/product.png",
    link: "https://paystack.com/buy/build-your-routine-session-vpzhbk",
    title: "‍🗂️ Build-Your-Routine Session",
    description:
        "Overwhelmed by information overload? Let’s simplify. We’ll build your complete weekly and monthly hair regimen — from wash day to protective styling — customized to your schedule, hair goals, and budget.",
    items: [
      "✅ Includes product layering guidance + printable routine checklist.",
      "📍 Ideal for busy mums, students, or professionals.",
    ],
  },
  {
    image: "/long-hair.png",
    link: "https://paystack.com/buy/intensive-hair-growth-program-fdbjqq",
    title: "🌿 Intensive Hair Growth Program (3 Months)",
    description:
        "This is for the woman who wants transformation — inside and out. Includes weekly hair coaching + in-salon treatments, protective styles, growth tracking, and full support for 90 days.",
    items: [
      "✅️ Hair + scalp assessment",
      "⚠️️ Monthly protective styles",
      "💆🏽‍♀️ In-salon deep treatments",
      "📋 Coaching, progress tracking & access to exclusive resources",
    ],
  },
]

export default function Consultation() {
  const handleBook = (title) => {
    const message = encodeURIComponent(`Hi, I'd like to book a consultation for ${title}.`)
    const phone = "2348123456789" // ← replace with your WhatsApp business number (no +)
    const url = `https://wa.me/${phone}?text=${message}`
    window.open(url, "_blank")
  }

  return (
      <div className="flex flex-col items-center pt-24">
        {/* Intro Section */}
        <section className="text-center flex flex-col items-center justify-center px-4 max-w-3xl">
          <h3
              className={`${merriweather.className} text-4xl sm:text-6xl py-4 font-bold`}
          >
            🌿 Ready to Flourish From the Root Up?
          </h3>
          <p className="text-muted-foreground pt-16 py-3">
            You’ve tried it all — oils, YouTube routines, and product after
            product… but your hair still isn’t thriving. You’re not alone — and
            that’s exactly why I’m here.
          </p>
          <p className="text-muted-foreground">
            I’m Mariam Okocha Ijeoma, certified hair coach, salon owner, and a
            woman who has lived through the frustration of hair loss, dryness, and
            postpartum shedding. At Flourish Roots Hair Co., I help 4C queens like
            you finally understand, love, and grow their hair with expert care,
            simple routines, and real results.
          </p>
        </section>

        {/* Marquee */}
        <Marquee className="pt-16" speed={30}>
        <span
            className={`${Bagelan.className} text-[4em] md:text-[10em] text-gray-100 whitespace-nowrap`}
        >
          CONSULTATIONS •&nbsp;
        </span>
        </Marquee>

        {/* Products */}
        <section className="w-full max-w-6xl py-16 px-4 grid gap-16">
          {productsList.map((product, index) => (
              <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
              >
                <Card className="grid sm:grid-cols-2 gap-6 items-center overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all">
                  <div
                      className="h-[300px] sm:h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${product.image ?? "/placholder.png"})` }}
                  />
                  <CardContent className="p-8">
                    <h3
                        className={`${merriweather.className} font-bold text-2xl sm:text-3xl mb-4`}
                    >
                      {product.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {product.description}
                    </p>
                    <ul className="space-y-2 mb-6 text-sm">
                      {product.items.map((item, i) => (
                          <li key={i}>{item}</li>
                      ))}
                    </ul>
                    {/*<Button*/}
                    {/*    onClick={() => handleBook(product.title)}*/}
                    {/*    className="w-full sm:w-auto text-base"*/}
                    {/*>*/}
                    {/*  Book Consultation*/}
                    {/*</Button>*/}
                    <Link href={product.link}><Button dark>Book a session</Button></Link>
                  </CardContent>
                </Card>
                {/*<Separator className="my-8" />*/}
              </motion.div>
          ))}
        </section>

        <Marquee className="pt-8 pb-16" speed={30}>
        <span
            className={`${Bagelan.className} text-[4em] md:text-[10em] text-gray-100 whitespace-nowrap`}
        >
          CONSULTATIONS •&nbsp;
        </span>
        </Marquee>
      </div>
  )
}
