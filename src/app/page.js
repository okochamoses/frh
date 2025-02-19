'use client'
import {useEffect, useState} from "react";
import {Bagelan} from "@/app/layout";

export default function Home() {
    const [url, setUrl] = useState("./hero-bg.png");

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
    return (
        <>
            <div
                id="hero"
                className="flex justify-center items-end w-full h-svh top-0 p-10"
                style={{background: `url(${url}) center no-repeat`, backgroundSize: "contain"}}
            >
                <div className="flex items-center flex-col m:w-1/4 w-2/3 text-center text-white">
                    <h1 className={`${Bagelan.className} text-6xl md:text-9xl`}>FLOURISH ROOTS HAIR</h1>
                    <p className="m:w-2/3 w-full my-6">Holistic haircare designed to nurture your natural beauty</p>

                    <button className="bg-[#BD2E2E] hover:bg-[#BD2E2E] text-white text-sm py-5 m:px-14 px-10 rounded-md">Book A Session</button>
                </div>
            </div>
            <div>WWW</div>
        </>
    );
}
