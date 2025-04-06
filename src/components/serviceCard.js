import Image from "next/image";
import {merriweather} from "@/app/layout";
import Button from "@/components/button";

export default function ServiceCard({image, title}) {
  return (
      <div className="w-full flex flex-col items-center justify-end h-[80vh]" style={{backgroundImage: `url("${image}")`, backgroundSize: "cover"}}>
        <div className="flex flex-col items-center justify-end w-full h-1/3 py-9"
             style={{ background: 'linear-gradient(to bottom, transparent, black)' }}>
          <span className={`${merriweather.className} text-3xl text-white my-5`}>{title}</span>
          <Button text="Get Started" />
        </div>
      </div>
  )
}
