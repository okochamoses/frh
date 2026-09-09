import Image from "next/image";
import Link from "next/link";
import Arrow from "@/components/v2/ui/Arrow";

const TRACKS = [
  {
    title: "Book a salon visit",
    body: "Pick your style, your stylist and a time that works for you.",
    image: "/hair-wash.webp",
    alt: "Stylist washing a client's hair at the salon",
    href: "/bookings",
  },
  {
    title: "Talk to Mariam",
    body: "Not sure what your hair needs? Start with a one-on-one with our founder and hair coach.",
    image: "/consultation.webp",
    alt: "Mariam talking through a hair plan with a client during a consultation",
    href: "/consultation",
  },
  {
    title: "See our work",
    body: "Real results from our chairs, so you can see a style before you book it.",
    image: "/story.webp",
    alt: "Finished 4C natural hair style from the Flourish Roots salon",
    href: "/gallery",
  },
];

export default function ThreeCardSplit() {
  return (
    <section aria-label="Get started with Flourish Roots">
      <ul className="grid gap-4 md:grid-cols-3">
        {TRACKS.map(({ title, body, image, alt, href }) => (
          <li key={title}>
            <Link
              href={href}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-v2-3xl bg-cream-100"
            >
              <Image
                src={image}
                alt={alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/10 to-transparent" />

              <div className="relative p-8">
                <h3 className="font-display text-v2-h2 uppercase leading-[0.95] text-white">
                  {title}
                </h3>
                <p className="mt-4 max-w-[30ch] text-v2-body text-white/80">
                  {body}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-v2-body-sm font-semibold text-white opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
                  <Arrow className="h-4 w-5" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
