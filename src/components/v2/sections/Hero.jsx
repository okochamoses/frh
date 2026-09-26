import { MapPin, Star } from "lucide-react";
import Button from "@/components/v2/ui/Button";
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL, MAPS_URL } from "@/components/v2/location";
import HeroFloat from "./HeroFloat";

export default function Hero() {
  return (
    <section className="v2-hero-bg v2-topband relative left-1/2 right-1/2 -mx-[50vw] flex w-screen min-h-[92dvh] flex-col justify-center overflow-hidden px-4 pt-36 pb-40 md:min-h-[110dvh] md:px-8 md:pt-28 md:pb-24 lg:pt-36">
      <HeroFloat />
      <div className="relative z-10 mx-auto flex max-w-[var(--v2-container)] flex-col items-center text-center">
        {/* Sized by a single clamp rather than breakpoint steps, which each
            shrank the title as the viewport grew. Icarus Nocturne sets ~4.80x
            its font-size across "Flourish", the longest line, so the 9.6rem
            ceiling puts it at ~737px — comfortably inside the 1400px content
            column, and it holds that ceiling from 878px up — so the desktop
            hero is unchanged. Below that the size is purely proportional, which
            is what keeps phones filled: "Flourish" spans ~93% of the column at
            every phone width rather than shrinking away from the gutters. The
            3.25rem floor is a backstop for viewports under ~297px, narrower
            than any current phone, where proportional sizing would overflow.

            Tracking stays at the face's own fitting: it is drawn tight, and the
            swash on the U reaches into the next glyph, so negative tracking
            collides the caps rather than tightening them. */}
        {/* The wordmark is the visual headline but a poor semantic one: on its
            own it tells a first-time visitor nothing about what we do or where
            we are. So the real <h1> carries that sentence for search engines
            and screen readers, and the wordmark is presentational. */}
        <h1 className="sr-only">
          Flourish Roots Hair Co., a 4C natural hair salon in Isolo, Lagos
        </h1>

        <div
          aria-hidden="true"
          className="type-display text-[clamp(3.25rem,17.5vw,9.6rem)] uppercase leading-[0.9] text-ink"
        >
          Flourish<br/> Roots <br/> Hair
        </div>

        <p className="mt-6 text-v2-body font-semibold uppercase tracking-[0.14em] text-ink/75">
          4C natural hair salon
        </p>

        <Button
          variant="book"
          withArrow
          href="/booking"
          className="mt-9"
        >
          Book a salon visit
        </Button>

        {/* Proof beside the ask: the first thing a new client checks. */}
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-v2-body-sm font-semibold text-ink shadow-sm backdrop-blur-sm transition-colors duration-200 hover:bg-white"
        >
          <span className="flex text-[#F5A623]" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
            ))}
          </span>
          <span>
            {GOOGLE_RATING.toFixed(1)} on Google
          </span>
          <span className="sr-only"> — rated {GOOGLE_RATING} out of 5, read the reviews (opens Google)</span>
        </a>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block max-w-[34ch] text-balance text-v2-body-sm text-ink/70 underline decoration-ink/25 underline-offset-4 transition-colors duration-200 ease-out hover:text-ink hover:decoration-ink"
        >
          <MapPin aria-hidden className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px align-middle" />
          Shop 303, Destiny Plaza, Ago Palace Way &middot; Open Tue to Sun
          <span className="sr-only"> (opens Google Maps)</span>
        </a>
      </div>
    </section>
  );
}
