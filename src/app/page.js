'use client'
import {useEffect, useState} from "react";
import {Bagelan, merriweather} from "@/app/layout";
import Image from "next/image";
import ServiceCard from "../components/serviceCard";
import Marquee from "react-fast-marquee";
import Button from "../components/button";
import About from "../components/about";
import axios from "axios";
import Link from "next/link";

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
    const [url, setUrl] = useState("./hero-bg.png");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const updateBackground = () => {
            if(window.innerWidth > window.innerHeight) {
                setUrl("./hero-bg.png");
            }
            else if (window.innerWidth < 768) {
                setUrl("./hero-bg-phone.png"); // Image for small screens
            } else if (window.innerWidth < 1024) {
                setUrl("./hero-bg.png"); // Image for medium screens
            } else {
                setUrl("./hero-bg.png"); // Default image for large screens
            }
        };

        updateBackground(); // Set initial background
        window.addEventListener("resize", updateBackground);

        return () => window.removeEventListener("resize", updateBackground);
    }, []);

    const handleForm = async (e) => {
      if(submitted) return;
      setLoading(true)
      e.preventDefault();
      const form = e.target;
      const name = e.target.name.value;
      const email = e.target.email.value;
      e.target.elements.name.disabled = true;
      e.target.elements.email.disabled = true;

      try {
        const res = await axios.post("http://localhost:3000/api/newsletter", {name, email});
        console.log(res)
        form.reset();
      } catch (error) {
        console.error("Error submitting form:", error);

      }
      setLoading(false)
      setSubmitted(true)
    };
    return (
        <>
            <div
                id="hero"
                className="flex justify-center items-end w-full h-svh top-0 p-10"
                style={{background: `url(${url}) center no-repeat`}}
            >
                <div className="flex items-center flex-col m:w-1/4 w-2/3 text-center text-white">
                    <h1 className={`${Bagelan.className} text-6xl md:text-9xl`}>FLOURISH ROOTS HAIR</h1>
                    <p className="m:w-2/3 w-full my-6">Holistic haircare designed to nurture your natural beauty</p>

                  <Link href={"/salon"}><button className="bg-[#BD2E2E] hover:bg-[#BD2E2E] text-white text-sm py-5 m:px-14 px-10 rounded-md">Book A Session</button></Link>
                </div>
            </div>

            <section id="intro" className={`${merriweather.className} flex flex-col items-center text-center py-24 sm:mx-12`}>
                <h4 className="w-2/3 text-center text-xl py-5">Holistic haircare designed to nurture your natural beauty</h4>

              <span className="text-center leading-10 text-3xl md:text-6xl py-5">
                Discover personalized solutions, expert guidance, and curated essentials to help your hair flourish from root to tip.
              </span>
                {/*<span className="text-center leading-10 text-3xl md:text-6xl py-5">*/}
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
            <ServiceCard image="/coaching.png" title="Consultation Services" />
            {/*<ServiceCard image="/starter.png" title="Curated Starter Kit" />*/}
            <ServiceCard image="/salon.png" title="Salon Services" />
          </section>

          <About />

          <section className="grid grid-cols-1 sm:grid-cols-2 w-full md:h-lvh">
            <div className="flex flex-col items-center justify-center text-center bg-red-300 md:px-24 px-5 h-full">
              <Image className="py-5" src="/logo.svg" alt="" height={50} width={50} />
              <span className={`${merriweather.className} text-3xl uppercase py-5`}>
                Keep up to date with the hair care tips
              </span>
              <span>
                Want to learn about hair care and hair growth? Join our newsletter to get updates on the latest
              </span>

              <form className="py-10" onSubmit={handleForm}>
                <input name="name" className="w-full my-2 py-4 px-4 appearance-none focus:outline-none" type="text" placeholder="ENTER YOUR NAME"/>
                <input name="email" className="w-full my-2 py-4 px-4 appearance-none focus:outline-none mb-5 text-sm" type="text" placeholder="ENTER YOUR EMAIL"/>
                <Button onSubmit={handleForm} loading={loading} wFull dark text={submitted? <Checkmark text="SUBSCRIBED" /> : "SUBSCRIBE"}/>
              </form>
            </div>
            <div className="h-lvh" style={{backgroundImage: "url('/comb.png')", backgroundSize: "cover"}}></div>
          </section>

          <section className="flex flex-col items-center justify-between h-svh">
            <Marquee className="pt-8" speed={30} style={{overflowY: "hidden"}}>
              <span className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>TESTIMONIALS</span>
            </Marquee>
            <div className="w-full flex text-center flex-col items-center justify-center">
              <h3 className={`${merriweather.className} sm:w-2/3 md:w-5/6 sm:text-7xl text-4xl sm:px-10 px-2 py-5`}>Testimonials</h3>
              <p className="sm:w-1/2 p-5">
                Flourish Roots Hair Co. is a holistic haircare brand. We are dedicated to empowering your hair
                journey by providing the knowledge, tools, and support needed to help you embrace and nurture
                your natural beauty.
              </p>
              <Image src={"/logo.svg"} alt={""} height={50} width={50} />
              <span className="italic text-xs py-2">Jane Doe</span>
            </div>
            <Marquee className="pt-8" speed={30} direction="right" style={{overflowY: "hidden"}}>
              <p className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>- TESTIMONIALS</p>
            </Marquee>
          </section>
        </>
    );
}