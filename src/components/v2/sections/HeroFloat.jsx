"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/*
 * The tools of the trade — pick, dryer, shears, oils — drifting past the
 * wordmark at different speeds as the page scrolls, each turning a little as
 * it goes. Cut-outs from `public/assets/toolkit`, so they sit straight on the
 * hero glow with no frame.
 *
 * Placed round the edges so the wordmark and the Book button stay clear; a
 * phone shows the five marked `phone`, smaller. `speed` is how far an object
 * moves per pixel scrolled (negative rises faster than the page) and `spin`
 * how many degrees it turns per 100px.
 *
 * Plain <img>: these are small transparent PNGs (≤405px) with no pre-rendered
 * widths for the custom next/image loader to map onto.
 */
const TOOLS = [
  { src: "afro-pick-purple.png", speed: -0.4, spin: 2.5, rot: -18, phone: true, cls: "left-[3%] top-[3%] w-[16vw] md:left-[6%] md:top-[14%] md:w-[9vw]" },
  { src: "hair-dryer.png", speed: -0.2, spin: -1.5, rot: 12, phone: true, cls: "right-[2%] top-[6%] w-[26vw] md:right-[4%] md:top-[10%] md:w-[15vw]" },
  { src: "shears.png", speed: -0.55, spin: 4, rot: 25, phone: true, cls: "left-[4%] bottom-[4%] w-[22vw] md:left-[10%] md:bottom-[12%] md:w-[11vw]" },
  { src: "hair-butter-gold.png", speed: -0.3, spin: -2, rot: -8, phone: true, cls: "right-[5%] bottom-[6%] w-[22vw] md:right-[12%] md:bottom-[10%] md:w-[10vw]" },
  { src: "leaves.png", speed: -0.65, spin: 3, rot: 10, phone: true, cls: "left-[40%] bottom-[1%] w-[14vw] md:left-auto md:right-[26%] md:bottom-auto md:top-[6%] md:w-[6vw]" },
  { src: "serum-dropper.png", speed: -0.45, spin: -3, rot: 22, cls: "hidden md:block md:left-[22%] md:top-[5%] md:w-[5.5vw]" },
  { src: "spray-bottle-pink.png", speed: -0.25, spin: 1.5, rot: -12, cls: "hidden md:block md:left-[2%] md:top-[48%] md:w-[6vw]" },
  { src: "satin-bonnet.png", speed: -0.35, spin: -2.5, rot: 8, cls: "hidden md:block md:right-[2%] md:top-[46%] md:w-[10vw]" },
  { src: "oil-drop.png", speed: -0.75, spin: 0, rot: 0, cls: "hidden lg:block lg:left-[26%] lg:bottom-[6%] lg:w-[2.5vw]" },
  { src: "scrunchie.png", speed: -0.5, spin: 5, rot: 0, cls: "hidden lg:block lg:right-[28%] lg:bottom-[4%] lg:w-[6vw]" },
];

export default function HeroFloat() {
  const layer = useRef(null);

  useEffect(() => {
    const el = layer.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = [...el.querySelectorAll("[data-speed]")];
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // Past the hero there is nothing left to move.
      if (y > window.innerHeight * 1.5) return;
      for (const item of items) {
        const { speed, spin } = item.dataset;
        item.style.transform = `translate3d(0, ${y * Number(speed)}px, 0) rotate(${(y / 100) * Number(spin)}deg)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={layer} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {TOOLS.map((t) => (
        <div
          key={t.src}
          data-speed={t.speed}
          data-spin={t.spin}
          className={cn("absolute will-change-transform", !t.phone && "hidden", t.cls)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/assets/toolkit/${t.src}`}
            alt=""
            loading="lazy"
            decoding="async"
            className="v2-float-in h-auto w-full drop-shadow-[0_18px_22px_rgba(40,24,10,0.28)]"
            style={{ rotate: `${t.rot}deg` }}
          />
        </div>
      ))}
    </div>
  );
}
