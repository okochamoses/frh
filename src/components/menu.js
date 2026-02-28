"use client"

import Image from "next/image";
import Link from "next/link";
import { Bagelan } from "@/app/layout";

export function Menu({ showMenu, handleMenuClick }) {
  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Salon Services", href: "/services" },
    { name: "Help coaching services", href: "/consultation" },
  ];

  return (
      <div
          className={`flex flex-col items-center justify-center text-center ${Bagelan.className} h-svh w-full z-50 fixed bg-[#BD2E2E] transition-transform duration-300 ${
              showMenu ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        {/* Top bar */}
        <div className="fixed top-0 w-full h-20 flex justify-between items-center px-4 z-50">
          <button
              onClick={handleMenuClick}
              aria-label="Close menu"
              className="text-2xl text-white hover:opacity-80 transition"
          >
            ✕
          </button>

          <Image
              src="/logo.svg"
              alt="FRH"
              width={45}
              height={45}
              className="self-center absolute left-1/2 -translate-x-1/2"
          />
          <span></span>
        </div>

        {/* Menu items */}
        <div className="flex flex-col items-center justify-center mt-24 space-y-6">
          {menuItems.map((item) => (
              <Link
                  key={item.name}
                  href={item.href}
                  className="sm:text-9xl text-5xl text-white w-svw leading-relaxed hover:opacity-80 transition"
                  onClick={handleMenuClick}
              >
                {item.name}
              </Link>
          ))}
        </div>
      </div>
  );
}
