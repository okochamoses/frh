"use client"

import React, { useState } from "react";
import { FaArrowRight, FaEnvelope, FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import {merriweather} from "@/app/layout";
import Link from "next/link";

export default function Footer() {
  return (
      <section id="footer" className="w-full bg-[#DDA15E] flex flex-col items-center md:pt-20 py-10 px-5">

        <div className="w-full max-w-screen-xl grid m:grid-cols-2 pb-10 border-b-[1px] border-black">
          <div>
            <h6 className={`${merriweather.className} m:text-6xl text-4xl max-w-full font-semibold`}>Want to get in touch?</h6>
          </div>
          <div className="flex items-end justify-end">
            <span className={`${merriweather.className} flex justify-center items-center m:relative hidden`}>Let's talk! <FaArrowRight className="ml-2" /></span>
          </div>
        </div>


        <div className="w-full max-w-screen-xl grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 md:gap-12 pt-6 text-sm ">
          <div className="">
            <h6 className={`${merriweather.className} text-lg max-w-72`}>Quick links</h6>
            <Link href="/#about" className="flex py-2 items-center hover:underline">About Me</Link>
            <Link href="/services" className="flex py-2 items-center hover:underline">Salon Services</Link>
            <Link href="/consultation" className="flex py-2 items-center hover:underline">Help coaching</Link>
          </div>
          <div className="">
            <h6 className={`${merriweather.className} text-lg max-w-72`}>Phone / Whatsapp</h6>
            <span className="flex py-2 items-center">+234-81-1021-5014</span>
            <span className="flex py-2 items-center">+234-81-6167-2820</span>
          </div>
          <div className="">
            <h6 className={`${merriweather.className} text-lg max-w-72`}>Email</h6>
            <span className="flex py-2 items-center">flourishnaturalsinfo@gmail.com
            </span>
          </div>
          <div className="mb-12">
            <h6 className={`${merriweather.className} text-lg max-w-72`}>Address</h6>
            <a className="flex py-2 items-center">Shop 303, Destiny Plaza, Ago Palace Way, beside market square supermarket</a>
          </div>
        </div>

        <div className="w-full max-w-screen-xl grid md:grid-cols-4 grid-cols-2 md:gap-12 gap-x-12 bg-black p-10 md:rounded-full rounded-lg text-white">
          <Link href="https://www.instagram.com/frh_naturals/" className="flex py-2 justify-center items-center border-b-[1px] border-black hover:text-yellow-500"><FaInstagram size={20} className="pr-1" /> Instagram</Link>
          <Link href="https://www.facebook.com/people/FRH-Flourish-Roots-Hair-Co/61570171119138/#" className="flex py-2 justify-center items-center border-b-[1px] border-black hover:text-yellow-500"><FaFacebook size={20} className="pr-1" /> Facebook</Link>
          <Link href="https://wa.me/2348110215014" className="flex py-2 justify-center items-center border-b-[1px] border-black hover:text-yellow-500"><FaWhatsapp size={20} className="pr-1" /> Whatsapp</Link>
          <Link href="https://www.tiktok.com/@frhnaturals" className="flex py-2 justify-center items-center border-b-[1px] border-black hover:text-yellow-500"><FaTiktok size={20} className="pr-1" /> TikTok</Link>
        </div>



        {/*<p className="max-w-lg">*/}
        {/*        ® 2025*/}
        {/*    </p>*/}
      </section>
  )
}