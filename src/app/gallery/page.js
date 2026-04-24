import Image from "next/image"
import { Bagelan, merriweather } from "@/app/layout"

const IMAGES = [
  { src: "/salon.webp",          alt: "Salon interior",              width: 800, height: 1000 },
  { src: "/ceo.png",             alt: "Mariam Okocha Ijeoma",        width: 800, height: 1000 },
  { src: "/coaching.webp",       alt: "Hair coaching session",       width: 800, height: 600  },
  { src: "/hair-coaching.jpeg",  alt: "Hair coaching consultation",  width: 800, height: 1000 },
  { src: "/gallery.avif",        alt: "Hair transformation",         width: 800, height: 600  },
  { src: "/long-hair.webp",      alt: "Natural long hair",           width: 800, height: 1000 },
  { src: "/scalp-issues.webp",   alt: "Scalp care treatment",        width: 800, height: 600  },
  { src: "/story.webp",          alt: "Flourish Roots Hair Co.",     width: 800, height: 1000 },
]

export default function GalleryPage() {
  return (
    <>
      {/* ── Hero ── */}
      <div className="bg-[#120D07] pt-36 pb-16 px-6 text-center">
        <p className={`${merriweather.className} text-[#DDA15E] text-xs tracking-[0.3em] uppercase mb-4`}>
          Portfolio
        </p>
        <h1 className={`${Bagelan.className} text-[clamp(3.5rem,12vw,8rem)] text-white leading-none`}>
          OUR WORK
        </h1>
      </div>

      {/* ── Masonry grid ── */}
      <section className="bg-[#faf9f7] px-4 md:px-8 py-12">
        <div className="columns-2 md:columns-3 gap-3 max-w-screen-xl mx-auto">
          {IMAGES.map((img) => (
            <div
              key={img.src}
              className="break-inside-avoid mb-3 overflow-hidden rounded-sm bg-stone-200 group"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
