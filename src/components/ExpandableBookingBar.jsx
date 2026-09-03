"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { useBooking } from "@/app/contexts/BookingContext";
import { merriweather } from "@/app/layout";

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h > 0 && `${h}h`, m > 0 && `${m}m`].filter(Boolean).join(" ");
}

export function ExpandableBookingBar({ actionLabel, onAction }) {
  const { selectedServices, totalPrice, totalDuration } = useBooking();
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  // Collapse when all services are removed
  useEffect(() => {
    if (selectedServices.length === 0) setExpanded(false);
  }, [selectedServices.length]);

  if (selectedServices.length === 0) return null;

  return (
    <div ref={ref} className="fixed bottom-0 left-0 right-0 z-40">
      {/* Expanded services panel */}
      <div
        className="bg-[#1a1208] border-t border-white/10 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: expanded ? "320px" : "0px" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <p className={`${merriweather.className} text-[10px] tracking-[0.2em] uppercase text-stone-400`}>
              Selected Services
            </p>
            <button
              onClick={() => setExpanded(false)}
              className="text-stone-400 hover:text-white transition-colors p-1"
              aria-label="Collapse"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
            {selectedServices.map((service, i) => (
              <div
                key={service.title}
                className={`flex items-center justify-between py-3 ${
                  i < selectedServices.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <p className="text-sm text-white font-medium truncate pr-4">{service.title}</p>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-stone-400">{formatDuration(service.duration)}</span>
                  <span className={`${merriweather.className} text-xs text-[#DDA15E]`}>
                    ₦{service.price.toLocaleString("en-US")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main bar. The safe-area padding keeps the action button clear of the
          iOS home indicator, which it otherwise sits underneath. */}
      <div
        className="bg-[#120D07] text-white shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          {/* Clickable summary — toggles panel */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-left flex-1 min-w-0 group"
          >
            <ChevronDown
              className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform duration-300 ${
                expanded ? "rotate-0" : "rotate-180"
              }`}
            />
            <div className="min-w-0">
              <p className={`${merriweather.className} text-sm font-bold`}>
                {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
              </p>
              <p className="text-stone-400 text-xs mt-0.5">
                ₦{totalPrice.toLocaleString("en-US")} • {formatDuration(totalDuration)}
              </p>
            </div>
          </button>

          {/* Action button */}
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            className={`${merriweather.className} text-[9px] tracking-widest uppercase bg-[#DDA15E] text-[#120D07] px-6 py-3 hover:bg-[#c8894a] transition-colors duration-200 flex-shrink-0`}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
