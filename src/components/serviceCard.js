"use client";

import {merriweather} from "@/app/layout";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/button";

const variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
};

const FRESHA_BOOKING_URL = "https://www.fresha.com/a/flourish-roots-hair-co-lagos-ago-palace-way-bxvf8kef/booking?allOffer=true&menu=true&pId=1427796";

export default function ServiceCard({ image, title, url }) {
  const href = url || FRESHA_BOOKING_URL;
  const isExternal = href.startsWith("http");

  return (
      <motion.div
          className="w-full relative flex flex-col items-center justify-end h-[80vh] overflow-hidden group"
          initial="initial"
          whileHover="hover"
          animate="initial"
      >
        <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${image}")` }}
            variants={variants}
            transition={{ duration: 0.25, ease: "easeInOut" }}
        />

        {/* Gradient Overlay + Content */}
        <div className={`relative z-10 flex flex-col items-center justify-end w-full h-1/3 py-9`}
             style={{ background: 'linear-gradient(to bottom, transparent, black)' }}>
          <motion.span
              layoutId={title}
              className={`${merriweather.className} text-3xl text-center text-white my-5`}
          >
            {title}
          </motion.span>
          {isExternal ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              <Button text="Get Started" />
            </a>
          ) : (
            <Link href={href}>
              <Button text="Get Started" />
            </Link>
          )}
        </div>
      </motion.div>
  );
}
