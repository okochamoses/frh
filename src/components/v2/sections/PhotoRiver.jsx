import Link from "next/link";
import Image from "next/image";
import { LOOKS } from "@/lib/booking/catalogue";
import { naira } from "@/lib/booking/schedule";

/*
 * Two rows of finished styles sliding past in opposite directions. Every photo
 * is a way in: it opens the booking flow with that style already picked
 * (`/booking?look=<slug>`), and its caption carries the name and the "from"
 * price, so the strip sells rather than decorates.
 *
 * Pure CSS, like Marquee: each row holds its list twice and slides by -50%.
 * Hovering (or focusing a card) pauses the row; under reduced motion the rows
 * stand still and scroll sideways by hand instead (see `.v2-river` in v2.css).
 */
const WITH_PHOTOS = LOOKS.filter((l) => l.image?.startsWith("/"));
const half = Math.ceil(WITH_PHOTOS.length / 2);
const ROWS = [WITH_PHOTOS.slice(0, half), WITH_PHOTOS.slice(half)];

function Card({ look, hidden }) {
  return (
    <li className="shrink-0 px-2">
      <Link
        href={`/booking?look=${look.slug}`}
        tabIndex={hidden ? -1 : undefined}
        className="group block w-[42vw] max-w-[220px] sm:w-[200px]"
      >
        <span className="relative block aspect-[4/5] overflow-hidden rounded-v2-2xl bg-latte">
          <Image
            src={look.image}
            alt={hidden ? "" : look.name}
            fill
            sizes="220px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/90 px-3 py-1.5 text-center text-[12px] font-semibold text-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            Book this look
          </span>
        </span>
        <span className="mt-2 block truncate text-sm font-semibold text-ink">{look.name}</span>
        <span className="block text-[13px] text-ink-soft">
          {look.hasVariants ? "from " : ""}
          {naira(look.minPrice)}
        </span>
      </Link>
    </li>
  );
}

function Row({ looks, reverse, duration }) {
  return (
    <div className="v2-river">
      <ul
        className={`v2-river-track flex w-max ${reverse ? "v2-river-reverse" : ""}`}
        style={{ "--v2-river-duration": `${duration}s` }}
      >
        {looks.map((l) => (
          <Card key={l.id} look={l} />
        ))}
        {/* The second copy makes the loop seamless; it is not for readers. */}
        {looks.map((l) => (
          <Card key={`${l.id}-copy`} look={l} hidden />
        ))}
      </ul>
    </div>
  );
}

export default function PhotoRiver() {
  if (WITH_PHOTOS.length < 4) return null;
  return (
    <section aria-labelledby="river-title" className="relative left-1/2 right-1/2 -mx-[50vw] w-screen py-4">
      <div className="mx-auto mb-7 max-w-[var(--v2-container)] px-4 md:px-8">
        <p className="type-eyebrow text-ink/70">Fresh from the chair</p>
        <h2 id="river-title" className="type-display-md mt-2 text-ink">
          Real clients, real styles
        </h2>
        <p className="mt-2 max-w-[48ch] text-v2-body-sm text-ink/75">
          Tap any look to book it. The price is where it starts; your stylist confirms it at the chair.
        </p>
      </div>
      <div className="grid gap-5">
        <Row looks={ROWS[0]} duration={70} />
        <Row looks={ROWS[1]} duration={80} reverse />
      </div>
    </section>
  );
}
