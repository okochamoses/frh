import Image from "next/image";
import Button from "@/components/v2/ui/Button";

/**
 * The room itself. Deliberately the quiet card of the pair — it mirrors the
 * coaching card's shape with the photograph on the other side and a lighter
 * ground, so the two read as a set without competing for the same attention.
 */
export default function SpaceSection() {
  return (
    <section aria-labelledby="space-heading">
      <div className="overflow-hidden rounded-v2-4xl bg-latte lg:grid lg:grid-cols-2 lg:items-stretch">
        <div className="p-8 md:p-12 lg:flex lg:flex-col lg:justify-center lg:p-14">
          <p className="type-eyebrow">Shop 303, Destiny Plaza</p>
          <h2
            id="space-heading"
            className="mt-5 max-w-[12ch] font-display text-[clamp(2rem,1.5rem+2vw,3.25rem)] uppercase leading-[0.95] text-ink"
          >
            A small salon, run properly
          </h2>
          <p className="mt-6 max-w-[44ch] text-v2-body text-ink-soft">
            Shop 303 is not a big space, and that is deliberate. We take a
            limited number of clients a day, so nobody is rushed and nobody is
            left sitting with a half finished head.
          </p>
          <Button variant="tertiary" withArrow href="/v2/salon" className="mt-8">
            Explore our space
          </Button>
        </div>

        {/* Second in the DOM so a screen reader hears the point before the
            picture of it; `lg:order-last` is not needed because the photograph
            is meant to sit on the right at every width. */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[30rem]">
          <Image
            src="/salon.webp"
            alt="The Flourish Roots salon: warm lighting, arched mirrors and timber detailing"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
