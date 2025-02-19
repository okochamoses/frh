"use client"

import Image from "next/image";
import {Bagelan} from "@/app/layout";

export function Menu({showMenu, handleMenuClick}) {
    return <>
            <div
                className={`flex flex-col items-center justify-center text-center ${Bagelan.className } h-svh w-full z-50 fixed bg-[#BD2E2E] transition-transform duration-300 ${showMenu ? "translate-y-0" : "-translate-y-full"}`}
            >
                <div className={`fixed top-0 w-full h-20 flex justify-between items-center px-4 z-50`}>
                    <span className="px-3" onClick={handleMenuClick}>X</span>
                    <Image src={"./logo.svg"} alt={"FRH"} width={45} height={45} className="self-center absolute left-1/2 -translate-x-1/2"/>
                    <span></span>
                </div>
                <div className="sm:text-9xl text-5xl w-svw leading-relaxed"><span>Home</span></div>
                <div className="sm:text-9xl text-5xl w-svw leading-relaxed"><span>About Us</span></div>
                <div className="sm:text-9xl text-5xl w-svw leading-relaxed"><span>Services</span></div>
                <div className="sm:text-9xl text-5xl w-svw leading-relaxed"><span>Contact Us</span></div>
                <div className="sm:text-9xl text-5xl w-svw leading-relaxed"><span>Book a Session</span></div>
            </div>
    </>;
}