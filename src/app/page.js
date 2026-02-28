'use client'
import {useEffect, useState} from "react";
import {Bagelan, merriweather} from "@/app/layout";
import Image from "next/image";
import ServiceCard from "../components/serviceCard";
import Marquee from "react-fast-marquee";
import Button from "../components/button";
import About from "../components/about";
import Link from "next/link";
import { subscribe } from "@/lib/firebase/newsletterService";

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
    const [error, setError] = useState(null);

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
            <div
                id="hero"
                className="flex justify-center items-end w-full h-svh top-0 p-10"
                style={{background: `url(${url}) center no-repeat`}}
            >
                <div className="flex items-center flex-col m:w-1/4 w-2/3 text-center text-white">
                    <h1 className={`${Bagelan.className} text-6xl md:text-9xl`}>FLOURISH ROOTS HAIR</h1>
                    <p className={`${merriweather.className} m:w-2/3 w-full my-6 text-xl font-medium`}>PROMOTING HEALTHIER HAIR</p>

                  <a href="https://www.fresha.com/a/flourish-roots-hair-co-lagos-ago-palace-way-bxvf8kef/booking?allOffer=true&menu=true&pId=1427796" target="_blank" rel="noopener noreferrer"><button className="bg-[#BD2E2E] hover:bg-[#BD2E2E] text-white text-sm py-5 m:px-14 px-10 rounded-md">Book A Session</button></a>
                </div>
            </div>

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
            <ServiceCard image="/coaching.png" url={"/consultation"} title="Hair coaching services" />
            {/*<ServiceCard image="/starter.png" title="Curated Starter Kit" />*/}
            <ServiceCard image="/salon.jpeg" title="Salon Services" />
          </section>

          <About />

          <section className="grid grid-cols-1 sm:grid-cols-2 w-full md:h-lvh">
            <div className="flex sm:col-span-2 md:col-span-1 flex-col items-center justify-center text-center bg-[#DDA15E] md:px-24 px-5 h-full">
              <Image className="py-5" src="/logo.svg" alt="" height={50} width={50} />
              <span className={`${merriweather.className} text-3xl uppercase py-5`}>
                Keep up to date with the hair care tips
              </span>
              <span>
                Want to learn about hair care and hair growth? Join our newsletter to get updates on the latest
              </span>

              <form className="py-10" onSubmit={handleForm}>
                <input name="name" className="w-full my-2 py-4 px-4 appearance-none focus:outline-none" type="text" placeholder="ENTER YOUR NAME"/>
                <input name="email" className="w-full my-2 py-4 px-4 appearance-none focus:outline-none mb-5 text-sm" type="email" placeholder="ENTER YOUR EMAIL"/>
                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                <Button onSubmit={handleForm} loading={loading} wFull dark text={submitted ? <Checkmark text="SUBSCRIBED" /> : "SUBSCRIBE"}/>
              </form>
            </div>
            <div className="h-lvh hidden md:block" style={{backgroundImage: "url('/comb.png')", backgroundSize: "cover"}}></div>
          </section>

          <section className="flex flex-col items-center justify-between h-svh">
            <Marquee className="pt-8" speed={30} style={{overflowY: "hidden"}}>
              <span className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>TESTIMONIALS</span>
            </Marquee>
            <div className="w-full flex text-center flex-col items-center justify-center">
              <h3 className={`${merriweather.className} sm:w-2/3 md:w-5/6 sm:text-7xl text-4xl sm:px-10 px-2 py-5`}>Testimonials</h3>
              <p className="sm:w-1/2 p-5">
                Literally one of the best natural hair salons I’ve visited in Lagos, the service is top notch! They handled my hair with such care, I had zero complaints. My hair felt so good and healthy after, I’m definitely making you guys my go to hair salon.
              </p>
              <Image src={"/logo.svg"} alt={""} height={50} width={50} />
              <span className="italic text-xs py-2">Adaugo Ugochukwu</span>
            </div>
            <Marquee className="pt-8" speed={30} direction="right" style={{overflowY: "hidden"}}>
              <p className={`${Bagelan.className} text-[4em] md:text-[15em] text-gray-100 whitespace-nowrap`}>- TESTIMONIALS</p>
            </Marquee>
          </section>
        </>
    );
}