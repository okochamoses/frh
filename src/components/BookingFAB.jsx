"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CalendarDays, X, ClipboardList, Scissors } from "lucide-react";

export function BookingFAB() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) { setVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

      {/* Dropdown card */}
      <div
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
          pointerEvents: open ? "auto" : "none",
        }}
        className="bg-[#F4EDE2] border border-stone-200 rounded-2xl shadow-2xl overflow-hidden w-56"
      >
        <p className="px-5 pt-4 pb-2 text-[10px] tracking-[0.2em] uppercase text-stone-400 font-medium">
          Book with us
        </p>

        <div className="flex flex-col pb-3">
          <Link
            href="/consultation"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 px-5 py-3 hover:bg-stone-100/70 transition-colors"
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 group-hover:bg-[#BD2E2E]/10 flex items-center justify-center transition-colors">
              <ClipboardList className="w-4 h-4 text-stone-500 group-hover:text-[#BD2E2E] transition-colors" />
            </span>
            <div>
              <p className="text-[13px] font-medium text-stone-800 leading-tight">Consultation</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Hair health assessment</p>
            </div>
          </Link>

          <div className="mx-5 h-px bg-stone-200/70" />

          <Link
            href="/services"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3 px-5 py-3 hover:bg-stone-100/70 transition-colors"
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 group-hover:bg-[#BD2E2E]/10 flex items-center justify-center transition-colors">
              <Scissors className="w-4 h-4 text-stone-500 group-hover:text-[#BD2E2E] transition-colors" />
            </span>
            <div>
              <p className="text-[13px] font-medium text-stone-800 leading-tight">Salon Visit</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Get your hair styled</p>
            </div>
          </Link>
        </div>
      </div>

      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Book an appointment"
        style={{ pointerEvents: "auto" }}
        className="w-12 h-12 rounded-full bg-[#BD2E2E] hover:bg-[#9e2626] text-white flex items-center justify-center shadow-lg transition-colors duration-200 focus:outline-none"
      >
        {open
          ? <X className="w-5 h-5" />
          : <CalendarDays className="w-5 h-5" />
        }
      </button>
    </div>
  );
}
