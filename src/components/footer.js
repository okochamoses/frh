import React, { useState } from "react";
import { FaArrowRight, FaEnvelope, FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import {merriweather} from "@/app/layout";

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
            <h6 className={`${merriweather.className} text-lg max-w-72`}>Phone / Whatsapp</h6>
            <span className="flex py-2 items-center">+234-81-6167-2820</span>
          </div>
          <div className="">
            <h6 className={`${merriweather.className} text-lg max-w-72`}>Email</h6>
            <span className="flex py-2 items-center">info@flourishrootshair.com</span>
          </div>
          <div className="mb-12">
            <h6 className={`${merriweather.className} text-lg max-w-72`}>Address</h6>
            <a className="flex py-2 items-center">Shop 33, Destiny Plaza, Ago Palace Way, beside market square supermarket</a>
          </div>
        </div>

        <div className="w-full max-w-screen-xl grid md:grid-cols-4 grid-cols-2 md:gap-12 gap-x-12 bg-black p-10 md:rounded-full rounded-lg text-white">

          <a className="flex py-2 justify-center items-center border-b-[1px] border-black"><FaInstagram size={20} className="pr-1" /> Instagram</a>
          <a className="flex py-2 justify-center items-center border-b-[1px] border-black"><FaFacebook size={20} className="pr-1" /> Facebook</a>
          <a className="flex py-2 justify-center items-center border-b-[1px] border-black"><FaWhatsapp size={20} className="pr-1" /> Whatsapp</a>
          <a className="flex py-2 justify-center items-center border-b-[1px] border-black"><FaTiktok size={20} className="pr-1" /> TikTok</a>

        </div>



        {/*<p className="max-w-lg">*/}
        {/*        ® 2025*/}
        {/*    </p>*/}
      </section>
  )
}