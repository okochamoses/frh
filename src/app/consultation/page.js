"use client"

import React from 'react';
import {Bagelan, merriweather} from "@/app/layout";
import {motion} from "framer-motion"
import Button from "@/components/button";
import Marquee from "react-fast-marquee";
import Link from "next/link";

const productsList = [
  {
    image: "/coaching.png",
    link: "https://paystack.com/buy/1-on-1-hair-coaching-ygkkif",
    title: "‍💻 1-on-1 Hair Coaching",
    description: "Personalized support designed for your unique texture, lifestyle, and goals. Get expert guidance, product recommendations, and coaching that meets you where you are — from beginner to advanced.",
    items: [
      "✅ Perfect for: Women ready to stop guessing and start growing.",
      "📍 Virtual or in-person sessions available.",
    ]
  },
  {
    image: "/scalp-issues.png",
    link: "https://paystack.com/buy/scalp-care-consultation",
    title: "🧖🏾‍ Scalp Care Consultation",
    description: "Is your scalp itchy, flaky, or holding you back from growth? We’ll do a scalp analysis and build a treatment plan to restore balance, reduce buildup, and bring life back to your roots.",
    items: [
      "✅ Includes tailored product suggestions and an optional treatment session.",
      "📍 Available virtually or with an in-salon care boost.",
    ]
  },
  {
    image: "/image 7.png",
    link: "https://paystack.com/buy/build-your-routine-session",
    title: "‍🗂️ Build-Your-Routine Session",
    description: "Overwhelmed by information overload? Let’s simplify. We’ll build your complete weekly and monthly hair regimen — from wash day to protective styling — customized to your schedule, hair goals, and budget.",
    items: [
      "✅ Includes product layering guidance + printable routine checklist.",
      "📍 Ideal for busy mums, students, or professionals.",
    ]
  },
  {
    image: "/long-hair.png",
    link: "https://paystack.com/buy/intensive-hair-growth-program",
    title: "🌿 Intensive Hair Growth Program (3 Months)",
    description: "This is for the woman who wants transformation — inside and out. Includes weekly hair coaching + in-salon treatments, protective styles, growth tracking, and full support for 90 days.",
    items: [
      "✅️ Hair + scalp assessment",
      "⚠️️ Monthly protective styles",
      "💆🏽‍♀️ In-salon deep treatments",
      "📋 Coaching, progress tracking & access to exclusive resources",
    ]
  },
]

const Consultation = (props) => {
  return (
      <>
        <section className="h-full flex flex-col items-center justify-center pt-24">
          <div className="w-full h-full flex text-center flex-col items-center justify-center">
            <h3 className={`${merriweather.className} sm:w-2/3 md:w-5/6 sm:text-7xl text-4xl sm:px-10 px-2 py-5`}>
              🌿 Ready to Flourish From the Root Up?
            </h3>
            <p className="sm:w-1/2 p-5">
              You’ve tried it all — oils, YouTube routines, and product after
              product… but your hair still isn’t thriving.
              You’re not alone — and that’s exactly why I’m here.
            </p>
            <p className="sm:w-1/2 p-5">
              I’m Mariam Okocha Ijeoma, certified hair coach, salon owner, and a
              woman who has lived through the frustration of hair loss, dryness,
              and postpartum shedding.
              At Flourish Roots Hair Co., I help 4C queens like you finally
              understand, love, and grow their hair with expert care, simple
              routines, and real results.
            </p>
          </div>
        </section>
        <section className="">
          <Marquee className="pt-8" speed={30} style={{overflowY: "hidden"}}>
            <span
                className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>CONSULTATIONS •&nbsp;</span>
          </Marquee>
          {productsList.map((product, index) => <Product key={index}
                                                         index={index} {...product} />)}
          <Marquee className="pt-8" speed={30} style={{overflowY: "hidden"}}>
            <span
                className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>CONSULTATIONS •&nbsp;</span>
          </Marquee>
        </section>
      </>
  );
}

const Product = ({image, link, title, description, items, index}) => (
    <>
      <hr/>

      <div className="grid grid-cols-12 gap-8 w-5/6 sm:mx-10 my-16">
        <div
            className={`sm:col-span-4 sm:block hidden h-full w-full order-${index
            / 2 === 1 ? 1
                : 2}`} style={{backgroundImage: `url("${image}")`, backgroundSize: "cover", backgroundPosition: "center"}}>
        </div>
        <div
            className={`sm:col-span-8 col-span-12 sm:mx-0 mx-5 py-6 order-${index
            / 2 === 0 ? 2 : 2}`}>
          <h3 className={`${merriweather.className} font-bold sm:w-2/3 sm:text-3xl text-3xl pb-6`}>{title}</h3>
          <p className="pb-5">{description}</p>
          <ol className="pb-8">
            {items.map((item, index) => <li key={index}>{item}</li>)}
          </ol>
          <Link href={link}><Button dark text="Book a session"/></Link>
        </div>
      </div>
    </>
)

export default Consultation;