import Image from "next/image";
import Link from "next/link";
import Arrow from "@/components/v2/ui/Arrow";

const TRACKS = [
  {
    kicker: "Salon",
    title: "Book a salon visit",
    body: "Pick your style and an available time.",
    image: "/hair-wash.webp",
    alt: "Stylist washing a client's hair at the salon",
    href: "/v2/booking",
  },
  {
    kicker: "Coaching",
    title: "Talk to Mariam",
    body: "Not sure what your hair needs? Start with a one-on-one with our founder and hair coach.",
    image: "/consultation.webp",
    alt: "Mariam talking through a hair plan with a client during a consultation",
    href: "/v2/consultation",
  },
  {
    kicker: "Our work",
    title: "Gallery",
    body: "Real results from our chairs, so you can see a style before you book it.",
    image: "/story.webp",
    alt: "Finished 4C natural hair style from the Flourish Roots salon",
    href: "/v2/gallery",
  },
];

/**
 * The three ways in, as photographs. Each card carries its own way through in
 * the corner at all times — a hover-only arrow told a phone reader nothing —
 * and the copy sits on a gradient deep enough to hold white type over any of
 * the three images.
 */
export default function ThreeCardSplit() {
  return (
    <section aria-label="Get started with Flourish Roots">
      <ul className="grid gap-4 md:grid-cols-3">
        {TRACKS.map(({ kicker, title, body, image, alt, href }) => (
          <li key={title}>
            <Link
              href={href}
              className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-v2-3xl bg-cream-100 p-6 md:p-8"
            >
              <Image
                src={image}
                alt={alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/20 to-obsidian/0"
              />

              <div className="relative flex items-start justify-between gap-4">
                <span className="rounded-full bg-sand/90 px-3 py-1.5 font-display text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur-sm">
                  {kicker}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-ink transition-transform duration-300 ease-out group-hover:-rotate-45"
                >
                  <Arrow className="h-3.5 w-4" />
                </span>
              </div>

              <div className="relative">
                <h3 className="font-display text-v2-h2 uppercase leading-[0.95] text-white">
                  {title}
                </h3>
                <p className="mt-3 max-w-[30ch] text-v2-body text-white/80">
                  {body}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
