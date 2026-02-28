import Marquee from "react-fast-marquee";
import {gsap} from "gsap";
import {Bagelan, merriweather} from "@/app/layout";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {useEffect, useRef} from "react";

// Register the ScrollTrigger plugin if you haven't already
// gsap.registerPlugin(ScrollTrigger);

// Assuming this code snippet is within a React component or a module
// where you want to set up this ScrollTrigger animation.

// const setupScrollAnimation = () => {
  // const tl = gsap.timeline({
  //   scrollTrigger: {
  //     scrub: 1,
  //     pin: true,
  //     trigger: "#about-container",
  //     start: "50% 50%",
  //     endTrigger: "#pin-windmill-wrap",
  //     end: "bottom 50%",
  //     markers: true,
  //   },
  // });

  // tl.to("#about-container", {
  //   rotateZ: 900,
  //   // You can add more animation properties here if needed, e.g.:
  //   // duration: 2,
  //   ease: "power2.inOut",
  // });

  // Optional: You might want to return the timeline if you need to control it later
  // return tl;
// };

const About = () => {
  // const windmillSvgRef = useRef(null);
  // const aboutContainerRef = useRef(null);
  // const pinWindmillWrapRef = useRef(null);

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     // Ensure GSAP and ScrollTrigger are available in the browser
  //     if (gsap && ScrollTrigger) {
  //       const tl = setupScrollAnimation();
  //
  //       // Optional: Cleanup function to kill the timeline when the component unmounts
  //       return () => {
  //         tl.kill();
  //         ScrollTrigger.killAll(); // If you want to clean up all ScrollTriggers
  //       };
  //     } else {
  //       console.warn("GSAP or ScrollTrigger not loaded.");
  //     }
  //   }
  // }, []);


  return (
      <section id="about" className="flex flex-col items-center justify-between min-h-svh py-16 md:py-24 bg-[#faf9f7]">
        <Marquee className="pt-8" speed={30} style={{overflowY: "hidden"}}>
          <span className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-200 whitespace-nowrap`}>ABOUT ME</span>
        </Marquee>
        <div className="w-full flex text-center flex-col items-center justify-center px-4 flex-1">
          <span className={`${merriweather.className} text-sm uppercase tracking-widest text-[#BD2E2E] font-medium mb-2`}>Founder & Hair Coach</span>
          <h2 className={`${merriweather.className} sm:w-2/3 md:w-4/5 sm:text-5xl text-3xl sm:px-10 px-2 py-4 font-bold text-gray-900`}>About Me</h2>
          <img src="/ceo.png" alt="Mariam Okocha Ijeoma - Founder & Hair Coach" className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover my-6 shadow-lg flex-shrink-0" />
          <p className="sm:w-2/3 max-w-2xl p-5 text-lg text-gray-700 leading-relaxed">
            I&apos;m <strong>Mariam Okocha Ijeoma</strong> — certified hair coach, salon owner, and the founder of Flourish Roots Hair Co. I&apos;ve lived through the frustration of hair loss, dryness, and postpartum shedding, and I built this brand to help 4C queens like you finally understand, love, and grow their hair.
          </p>
          <p className="sm:w-2/3 max-w-2xl px-5 pb-5 text-gray-600 leading-relaxed">
            With a focus on personalized care and expert guidance, I provide the knowledge, tools, and support you need to embrace your natural beauty — from scalp health and simple routines to curated essentials that help your hair flourish from root to tip.
          </p>
        </div>
        <Marquee className="pt-8" speed={30} direction="right" style={{overflowY: "hidden"}}>
          <p className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-200 whitespace-nowrap`}>- ABOUT ME</p>
        </Marquee>
      </section>
  )
}

// <br/>
// <br/>
//
// With a focus on personalized care and expert guidance,
//     we’re here to help you unlock the full potential of your hair, one strand at a time.
// <br/>
// <br/>
// Whether you're battling scalp issues, seeking growth solutions,
// or looking for curated essentials, we provide the tools and
// guidance to help your hair flourish from root to tip.
export default About;