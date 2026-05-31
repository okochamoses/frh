"use client"

import React from "react";
import { FaInstagram, FaFacebook, FaWhatsapp, FaTiktok } from "react-icons/fa6";
import { merriweather, Bagelan } from "@/app/layout";
import Link from "next/link";

const socials = [
  { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/frh_naturals/" },
  { icon: FaFacebook, label: "Facebook", href: "https://www.facebook.com/people/FRH-Flourish-Roots-Hair-Co/61570171119138/#" },
  { icon: FaWhatsapp, label: "WhatsApp", href: "https://wa.me/2348110215014" },
  { icon: FaTiktok, label: "TikTok", href: "https://www.tiktok.com/@frhnaturals" },
];

export default function Footer() {
  return (
    <footer id="footer" className="w-full bg-[#120D07] text-white overflow-hidden">

      {/* ── Giant wordmark ── */}
      <div className="relative pt-16 pb-6 px-6 border-b border-white/10">
        <p className={`${merriweather.className} text-xs tracking-[0.3em] uppercase text-[#DDA15E] mb-4 pl-1`}>
          Est. Lagos, Nigeria
        </p>
        <h2
          className={`${Bagelan.className} leading-none text-[clamp(3.5rem,14vw,11rem)] text-[#DDA15E] select-none`}
          aria-label="Flourish Roots Hair"
        >
          FLOURISH
          <br />
          ROOTS HAIR
        </h2>
        <p className={`${merriweather.className} text-white/50 text-sm mt-5 pl-1 max-w-xs`}>
          Promoting healthier hair — from root to tip.
        </p>
      </div>

      {/* ── Info grid ── */}
      <div className="grid md:grid-cols-3 grid-cols-1 gap-10 px-6 py-14 border-b border-white/10 max-w-screen-xl mx-auto w-full">

        <div>
          <h6 className={`${merriweather.className} text-[#DDA15E] text-xs tracking-widest uppercase mb-5`}>
            Quick Links
          </h6>
          {[
            { label: "About", href: "/#about" },
            { label: "Salon Services", href: "/services" },
            { label: "Hair Coaching", href: "/consultation" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="block text-white/70 hover:text-[#DDA15E] transition-colors duration-200 py-1.5 text-sm"
            >
              {label}
            </Link>
          ))}
        </div>

        <div>
          <h6 className={`${merriweather.className} text-[#DDA15E] text-xs tracking-widest uppercase mb-5`}>
            Contact
          </h6>
          <p className="text-white/70 text-sm py-1.5">+234-81-1021-5014</p>
          <p className="text-white/70 text-sm py-1.5">+234-81-6167-2820</p>
          <a
            href="mailto:flourishnaturalsinfo@gmail.com"
            className="block text-white/70 hover:text-[#DDA15E] transition-colors duration-200 text-sm py-1.5 break-all"
          >
            flourishnaturalsinfo@gmail.com
          </a>
        </div>

        <div>
          <h6 className={`${merriweather.className} text-[#DDA15E] text-xs tracking-widest uppercase mb-5`}>
            Visit Us
          </h6>
          <p className="text-white/70 text-sm leading-relaxed">
            Shop 303, Destiny Plaza,<br />
            Ago Palace Way,<br />
            beside Market Square Supermarket,<br />
            Lagos
          </p>
          <Link
            href="/services"
            className="inline-block mt-5 text-xs tracking-widest uppercase border border-[#DDA15E] text-[#DDA15E] hover:bg-[#DDA15E] hover:text-[#120D07] transition-all duration-200 px-5 py-2.5"
          >
            Book a Salon Visit →
          </Link>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 px-6 py-6 max-w-screen-xl mx-auto w-full">

        <p className="text-white/30 text-xs tracking-wide order-2 sm:order-1">
          © {new Date().getFullYear()} Flourish Roots Hair Co. All rights reserved.
        </p>

        <div className="flex items-center gap-3 order-1 sm:order-2">
          {socials.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow us on ${label}`}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-[#DDA15E] hover:text-[#DDA15E] transition-all duration-200"
            >
              <Icon size={15} />
            </Link>
          ))}
        </div>

      </div>

    </footer>
  );
}
