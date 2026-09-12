import Image from "next/image";
import Button from "@/components/v2/ui/Button";
import Reveal from "@/components/v2/ui/Reveal";
import PageHero from "@/components/v2/sections/PageHero";
import SectionHeader from "@/components/v2/sections/SectionHeader";
import NewsletterSection from "@/components/v2/sections/NewsletterSection";
import ClosingCta from "@/components/v2/sections/ClosingCta";
import { whatsapp } from "@/components/v2/salon";

export const metadata = {
  title: "Products — Flourish Roots Hair, Isolo Lagos",
  description:
    "The hair mask range we make in Lagos, and the products we put on 4C hair in the salon. Sold at Shop 303 and by WhatsApp order.",
};

/**
 * Products, without a shop.
 *
 * There is no product catalogue in this codebase — no names, no prices, no
 * stock — and inventing one would put fictional goods on a real salon's site.
 * So this page sells the way the salon actually sells: the range exists, it is
 * in the room, and you buy it by asking. When real product data lands, the
 * `PRODUCTS` grid below is the shape it drops into and this note comes out.
 *
 * TODO: replace with the real range — name, size, price, what it is for, and
 * one photograph each. Then wire "Order on WhatsApp" per product.
 */
const PRODUCTS = [];

/* What the salon has said publicly about its own products, and nothing more. */
const PRINCIPLES = [
  {
    title: "Made here",
    body: "Our hair mask range is made in Lagos, for hair that lives in Lagos weather — not reformulated for a climate none of us are in.",
  },
  {
    title: "Chosen for your hair, not for the shelf",
    body: "Nobody leaves with a basket because they sat in a chair. What we recommend comes out of what we saw on your scalp and ends that day.",
  },
  {
    title: "Buyable without us",
    body: "Most of what we put in a routine is not ours at all. If a cheaper bottle from the market does the same job, that is the one that goes on your list.",
  },
];

export default function ShopPage() {
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      <PageHero
        eyebrow="Products"
        title="Take the salon routine home"
        lede="The mask range we make in Lagos, plus whatever else your hair actually needs. Sold at Shop 303 and by WhatsApp order — we would rather talk to you for a minute than sell you the wrong bottle."
        actions={
          <>
            <Button
              variant="book"
              withArrow
              href={whatsapp("Hi — I'd like to ask about your hair products and what suits my hair.")}
              target="_blank"
              rel="noreferrer"
            >
              Ask what suits your hair
            </Button>
            <Button variant="secondary" href="/v2/consultation">
              Get a full routine
            </Button>
          </>
        }
        meta={["Made in Lagos", "Sold at Shop 303", "WhatsApp orders"]}
      />

      {PRODUCTS.length > 0 ? (
        <section aria-labelledby="products-heading">
          <SectionHeader
            id="products-heading"
            eyebrow="The range"
            title="What we make"
          />
          {/* The grid lands here when the real range is added. */}
        </section>
      ) : (
        <section aria-labelledby="in-the-salon-heading">
          <div className="overflow-hidden rounded-v2-4xl bg-cream-100 lg:grid lg:grid-cols-2 lg:items-stretch">
            <div className="p-8 md:p-12 lg:flex lg:flex-col lg:justify-center lg:p-14">
              <p className="type-eyebrow">Buying, for now</p>
              <h2
                id="in-the-salon-heading"
                className="mt-5 max-w-[14ch] font-display text-[clamp(2rem,1.5rem+2vw,3.25rem)] uppercase leading-[0.95] text-ink"
              >
                In the room, or by message
              </h2>
              <p className="mt-6 max-w-[46ch] text-v2-body text-ink-soft">
                There is no checkout here yet. Tell us what your hair is doing
                and we will tell you what we would put on it, what it costs, and
                whether we are the ones who should be selling it to you.
              </p>
              <p className="mt-4 max-w-[46ch] text-v2-body text-ink-soft">
                We deliver within Lagos and can send further by courier. Payment
                is by transfer once you have agreed what you are buying.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  variant="book"
                  withArrow
                  href={whatsapp("Hi — I'd like to order products. My hair is ")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Order on WhatsApp
                </Button>
                <Button variant="secondary" href="/v2/contact">
                  Other ways to reach us
                </Button>
              </div>
            </div>

            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[28rem]">
              <Image
                src="/product.webp"
                alt="Flourish Roots hair products on the counter at the salon"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="principles-heading">
        <SectionHeader
          id="principles-heading"
          eyebrow="How we sell"
          title="Three things we will not do"
          lede="Selling products is the easiest place for a salon to lose a client's trust, so these are worth saying out loud."
        />

        <ol className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
          {PRINCIPLES.map(({ title, body }, i) => (
            <li key={title}>
              <Reveal
                delay={i * 80}
                className="flex h-full flex-col rounded-v2-3xl bg-cream-100 p-7 md:p-8"
              >
                <span className="font-display text-[3.5rem] font-bold leading-none tabular-nums text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-8 max-w-[18ch] font-display text-v2-h3 uppercase leading-[1.1] text-ink">
                  {title}
                </h3>
                <p className="mt-3 text-v2-body-sm leading-[1.55] text-ink-soft">
                  {body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <NewsletterSection />
      <ClosingCta />
    </main>
  );
}
