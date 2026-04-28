'use client'
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Bagelan, merriweather } from "@/app/layout";
import ServiceCard from "../components/serviceCard";
import Marquee from "react-fast-marquee";
import Button from "../components/button";
import Testimonials from "../components/Testimonials";
import HowItWorks from "../components/HowItWorks";
import ParallaxImage from "../components/ParallaxImage";
import Link from "next/link";
import { subscribe } from "@/lib/firebase/newsletterService";

const About = dynamic(() => import("../components/about"), { ssr: true });

const Checkmark = ({text, style, className}) => {
  return (
      <div className="flex justify-center align-middle">
        <span>{text}</span>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            width="20px"
            fill="#ffffff"
            viewBox="0 0 24 24"
            id="check-mark-circle"
            className={`icon line ${className || ''}`} // Spread existing className and allow overrides
            style={style} // Allow inline style overrides
        >
          <path
              id="primary"
              d="M12,21h0a9,9,0,0,1-9-9H3a9,9,0,0,1,9-9h0a9,9,0,0,1,9,9h0A9,9,0,0,1,12,21ZM8,11.5l3,3,5-5"
              style={{
                fill: 'none',
                stroke: 'rgb(255, 255, 255)',
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: '1.5',
              }}
          />
        </svg>
      </div>
  );
};

export default function Home() {
    const [url, setUrl] = useState("/hero-bg.webp");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const updateBackground = () => {
            if(window.innerWidth > window.innerHeight) {
                setUrl("/hero-bg.webp");
            }
            else if (window.innerWidth < 768) {
                setUrl("/hero-bg-phone.webp"); // Image for small screens
            } else if (window.innerWidth < 1024) {
                setUrl("/hero-bg.webp"); // Image for medium screens
            } else {
                setUrl("/hero-bg.webp"); // Default image for large screens
            }
        };

        updateBackground(); // Set initial background
        window.addEventListener("resize", updateBackground);

        return () => window.removeEventListener("resize", updateBackground);
    }, []);

    const handleForm = async (e) => {
      if (submitted) return;
      setLoading(true);
      setError(null);
      e.preventDefault();
      const form = e.target;
      const name = e.target.name.value?.trim() || "";
      const email = e.target.email.value?.trim() || "";

      if (!email) {
        setError("Please enter your email address.");
        setLoading(false);
        return;
      }
      if (!email.includes("@")) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      e.target.elements.name.disabled = true;
      e.target.elements.email.disabled = true;

      try {
        await subscribe(email, name);
        form.reset();
        setSubmitted(true);
      } catch (err) {
        console.error("Error submitting form:", err);
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        e.target.elements.name.disabled = false;
        e.target.elements.email.disabled = false;
        setLoading(false);
      }
    };
    return (
        <>
            <ParallaxImage
                id="hero"
                src={url}
                alt="Flourish Roots Hair salon"
                sizes="100vw"
                strength={80}
                priority
                className="flex justify-center items-end w-full h-svh"
            >
                <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                <div className="absolute inset-0 flex items-end justify-center p-10">
                  <div className="flex items-center flex-col w-2/3 text-center text-white">
                      <h1 className={`${Bagelan.className} text-6xl md:text-9xl`}>FLOURISH ROOTS HAIR</h1>
                      <p className={`${merriweather.className} w-full my-6 text-xl font-medium`}>PROMOTING HEALTHIER HAIR</p>
                      <Link href="/services">
                        <button className="bg-[#BD2E2E] text-white text-sm py-5 px-10 rounded-md">Book A Session</button>
                      </Link>
                  </div>
                </div>
            </ParallaxImage>

            <section id="intro" className={`${merriweather.className} flex flex-col items-center text-center py-24 sm:mx-12`}>
                <h4 className="w-2/3 text-center text-xl py-5">Holistic haircare designed to nurture your natural beauty</h4>

              <span className="text-center leading-10 text-3xl md:text-6xl py-5">
                Discover personalized solutions, expert guidance, and curated essentials to help your hair flourish from root to tip.
              </span>
                {/*<spCoan className="text-center leading-10 text-3xl md:text-6xl py-5">*/}
                {/*  <span className="relative">Discover personalized</span>*/}
                {/*  <span className="absolute">*/}
                {/*    <Image className="inline-icon" src={"/inline-img-1.png"} alt={"FRH"} width={120} height={45} />*/}
                {/*  </span>*/}
                {/*  <span className="relative ml-[2em]">*/}
                {/*  solutions, expert guidance, and curated essentials to help your hair flourish*/}
                {/*  </span>*/}
                {/*  <span className="absolute">*/}
                {/*    <Image className="inline-icon" src={"/logo.svg"} alt={"FRH"} width={120} height={45} />*/}
                {/*  </span>*/}
                {/*  <span className="relative ml-[2em]">from root to tip.*/}
                {/*  </span>*/}
                {/*</span>*/}
            </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 w-full h-full">
            <ServiceCard image="/hair-coaching.jpeg" url={"/consultation"} title="Hair coaching services" />
            {/*<ServiceCard image="/starter.webp" title="Curated Starter Kit" />*/}
            <ServiceCard image="/salon.webp" title="Salon Services" />
          </section>

          <HowItWorks />

          <Suspense fallback={<section id="about" className="min-h-svh py-16 md:py-24 bg-[#faf9f7]" />}>
            <About />
          </Suspense>

          <Testimonials />

          <section className="grid grid-cols-1 md:grid-cols-2 w-full">
            {/* Image — desktop left */}
            <ParallaxImage
              src="/newsletter-large.webp"
              alt="Natural hair care"
              sizes="50vw"
              strength={60}
              className="hidden md:block min-h-[640px]"
            />

            {/* Form — right */}
            <div className="bg-[#DDA15E] px-8 md:px-14 lg:px-20 py-20 md:py-28 flex flex-col justify-center">
              <p className={`${merriweather.className} text-[10px] tracking-[0.3em] uppercase text-[#120D07]/50 mb-6`}>
                Newsletter
              </p>
              <h2 className={`${merriweather.className} text-3xl md:text-4xl font-bold text-[#120D07] leading-tight mb-4`}>
                Hair tips, straight<br />to your inbox.
              </h2>
              <p className="text-[#120D07]/60 text-sm leading-relaxed mb-10 max-w-xs">
                Expert advice on natural hair care, growth tips, and updates from Mariam — delivered directly to you.
              </p>

              <form className="flex flex-col gap-0" onSubmit={handleForm}>
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-transparent border-b border-[#120D07]/30 focus:border-[#120D07] py-3 mb-5 text-sm text-[#120D07] placeholder-[#120D07]/40 outline-none transition-colors duration-200"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-transparent border-b border-[#120D07]/30 focus:border-[#120D07] py-3 mb-8 text-sm text-[#120D07] placeholder-[#120D07]/40 outline-none transition-colors duration-200"
                />
                {error && <p className="text-red-800 text-xs mb-4">{error}</p>}
                <Button onSubmit={handleForm} loading={loading} wFull dark text={submitted ? <Checkmark text="SUBSCRIBED" /> : "SUBSCRIBE"} />
              </form>

              <p className="text-[10px] text-[#120D07]/35 mt-5 tracking-wide">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </section>

        </>
    );
}