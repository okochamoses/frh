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
      <section id='about-container' className="flex flex-col items-center justify-between h-svh">
        <Marquee className="pt-8" speed={30} style={{overflowY: "hidden"}}>
          <span className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>FLOURISH ROOTS HAIR</span>
        </Marquee>
        <div className="w-full flex text-center flex-col items-center justify-center">
          <h3 className={`${merriweather.className} sm:w-2/3 md:w-5/6 sm:text-7xl text-4xl sm:px-10 px-2 py-5`}>Promoting Healthier Natural Hair</h3>
          <p className="sm:w-1/2 p-5">
            Flourish Roots Hair Co. is a holistic haircare brand. We are dedicated to empowering your hair
            journey by providing the knowledge, tools, and support needed to help you embrace and nurture
            your natural beauty.
          </p>
        </div>
        <Marquee className="pt-8" speed={30} direction="right" style={{overflowY: "hidden"}}>
          <p className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>- FLOURISH ROOTS HAIR</p>
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