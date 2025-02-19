"use client"

import {useEffect, useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {Menu} from "@/components/menu";

export function Header() {
    const [isVisible, setIsVisible] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY) {
                setIsVisible(false); // Hide when scrolling down
            } else {
                setIsVisible(true); // Show when scrolling up
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const handleMenuClick = () => {
        setShowMenu(!showMenu)
    }

    return <>
        <div
            className={`fixed top-0 w-full h-20 flex justify-between items-center p-4 z-50 backdrop-blur-sm bg-white transition-transform duration-300 ${
                isVisible ? "translate-y-0" : "-translate-y-full"
            }`}>
            <Link href={"#"} onClick={handleMenuClick}><span className="">Menu</span></Link>
            <Image src={"./logo.svg"} alt={"FRH"} width={45} height={45}
            className="absolute left-1/2 -translate-x-1/2"/>
            {/*<div className="py-3 px-6 bg-[#BD2E2E] rounded-3xl">*/}
            {/*    <span className=" text-white">Book a session</span>*/}
            {/*</div>*/}
        </div>
        <Menu showMenu={showMenu} handleMenuClick={handleMenuClick} />
    </>;
}