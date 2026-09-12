import Image from "next/image";
import Reveal from "@/components/v2/ui/Reveal";

/**
 * The room, as a bento of four frames rather than a carousel: the whole space
 * should be takeable in at a glance, and a reader deciding whether to spend
 * five hours somewhere wants to see it all at once rather than a frame at a
 * time.
 *
 * The tall frame leads because the salon reads as a narrow, warm room and a
 * landscape crop flattens that. Captions are plain statements of fact about
 * the room — nothing here is a promise.
 */
const FRAMES = [
  {
    src: "/salon.webp",
    alt: "Inside Flourish Roots Hair Co.: warm lighting, arched mirrors and timber detailing",
    caption: "The room, Shop 303",
    className: "lg:col-span-5 lg:row-span-2 aspect-[3/4] lg:aspect-auto",
    sizes: "(min-width: 1024px) 42vw, 100vw",
  },
  {
    src: "/hair-wash.webp",
    alt: "A client's hair being lathered at the wash basin",
    caption: "The basin",
    className: "lg:col-span-3 aspect-[4/3]",
    sizes: "(min-width: 1024px) 25vw, 100vw",
  },
  {
    src: "/comb.webp",
    alt: "Combs and sectioning clips laid out before an appointment",
    caption: "Laid out before you sit",
    className: "lg:col-span-4 aspect-[4/3]",
    sizes: "(min-width: 1024px) 33vw, 100vw",
  },
  {
    src: "/story.webp",
    alt: "A finished 4C natural hair style photographed in the salon",
    caption: "On the way out",
    className: "lg:col-span-7 aspect-[16/10]",
    sizes: "(min-width: 1024px) 58vw, 100vw",
  },
];

export default function SpaceGallery() {
  return (
    <section aria-label="Inside the salon">
      <div className="grid gap-4 lg:grid-cols-12">
        {FRAMES.map(({ src, alt, caption, className, sizes }, i) => (
          <Reveal key={src} delay={i * 80} className={className}>
            <figure className="group relative h-full w-full overflow-hidden rounded-v2-3xl bg-cream-100">
              <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-sand/90 px-4 py-2 font-display text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur-sm">
                {caption}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
