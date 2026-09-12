import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import PageHero from "@/components/v2/sections/PageHero";
import ClosingCta from "@/components/v2/sections/ClosingCta";
import { whatsapp } from "@/components/v2/salon";

/**
 * Widths produced by `npm run optimise:images`. A plain <img> with its own
 * srcset rather than next/image, because the export sets `images.unoptimized`
 * — next/image emits no srcset there, so `sizes` alone did nothing and every
 * phone downloaded the full-size file.
 *
 * A candidate is only listed when the source is genuinely wider than it, so we
 * never point at a variant the script had no reason to write.
 */
const VARIANT_WIDTHS = [400, 800];

function srcSetFor(src, intrinsicWidth) {
  const base = src.replace(/\.webp$/, "");
  const candidates = VARIANT_WIDTHS.filter((w) => intrinsicWidth > w).map((w) => `${base}-${w}.webp ${w}w`);
  return [...candidates, `${src} ${intrinsicWidth}w`].join(", ");
}

export const metadata = {
  title: "Our work — Flourish Roots Hair, Isolo Lagos",
  description:
    "Twists, braids, threading and locs finished in our chairs in Isolo, Lagos. See a style on 4C hair before you book it.",
};

/**
 * Work from the chairs, as a masonry column flow rather than a fixed grid: the
 * photographs are all portrait but not all the same portrait, and a fixed grid
 * would crop the difference away — which on a page whose whole job is showing
 * what a finished head really looks like is the one thing it must not do.
 *
 * Alt text describes the hair, not the mood. "Hair transformation" — the v1
 * alt text on these same files — tells a screen-reader user nothing about
 * which style they are looking at, which is the only reason to be on the page.
 *
 * TODO: these are the salon's existing photographs. As newer work is shot,
 * caption each with the style and, where the client has agreed, link it to
 * that service so the gallery becomes a way into the menu.
 */
const WORK = [
  {
    src: "/gallery/IMG_7537.webp",
    alt: "Mini twists sectioned by hand, finished and photographed in the salon",
    width: 1280,
    height: 1707,
  },
  {
    src: "/gallery/IMG_6938.webp",
    alt: "A client's natural 4C hair after a wash, conditioning and detangle",
    width: 1071,
    height: 1428,
  },
  {
    src: "/gallery/salon.webp",
    alt: "A finished protective style seen from the back, showing the parting",
    width: 1086,
    height: 1448,
  },
  {
    src: "/gallery/IMG_7317.webp",
    alt: "A client during a consultation, hair sectioned for a scalp check",
    width: 1071,
    height: 1428,
  },
  {
    src: "/gallery/img_1.webp",
    alt: "Natural hair braids finished without tension on the hairline",
    width: 1086,
    height: 1449,
  },
  {
    src: "/gallery/IMG_6324.webp",
    alt: "A twist-out worn loose, showing definition through the ends",
    width: 756,
    height: 1008,
  },
  {
    src: "/gallery/img_2.webp",
    alt: "An updo set on natural 4C hair, photographed in the salon",
    width: 1086,
    height: 1448,
  },
  {
    src: "/gallery/IMG_6327.webp",
    alt: "Close detail of a parting, showing an even, unpulled hairline",
    width: 756,
    height: 1008,
  },
  {
    src: "/gallery/img_3.webp",
    alt: "A protective style finished and styled for wearing out",
    width: 1086,
    height: 1448,
  },
];

export default function GalleryPage() {
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      <PageHero
        eyebrow="Our work"
        title="See the style before you book it"
        lede="Real heads, finished in our chairs in Isolo. If you see something here you want, send it to us — it is the quickest brief you can give a stylist."
        actions={
          <>
            <Button variant="book" withArrow href="/v2/booking">
              Book a salon visit
            </Button>
            <Button
              variant="secondary"
              href={whatsapp("Hi — I saw a style on your gallery page that I'd like. Can I send it to you?")}
              target="_blank"
              rel="noreferrer"
            >
              Send us a style you like
            </Button>
          </>
        }
        meta={["4C natural hair", "Twists · braids · threading · locs", "Isolo, Lagos"]}
      />

      <section aria-label="Work from the salon">
        <div className="columns-2 gap-4 lg:columns-3">
          {WORK.map(({ src, alt, width, height }, i) => (
            <Reveal
              key={src}
              delay={(i % 3) * 80}
              className="mb-4 break-inside-avoid"
            >
              <figure className="group overflow-hidden rounded-v2-3xl bg-cream-100">
                <img
                  src={src}
                  srcSet={srcSetFor(src, width)}
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  alt={alt}
                  width={width}
                  height={height}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <ClosingCta />
    </main>
  );
}
