"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Arrow from "@/components/v2/ui/Arrow";
import Reveal from "@/components/v2/ui/Reveal";
import { ACTIVE_CATEGORIES, LOOKS } from "@/lib/booking/catalogue";
import { formatDuration, naira } from "@/lib/booking/schedule";

/**
 * The whole menu, priced from `@/lib/booking/catalogue` — the same module the
 * booking flow prices against. A services page that keeps its own copy of the
 * prices is a services page that will eventually lie about one.
 *
 * Set as a ruled index rather than a card grid, the way the homepage sets its
 * four service families: a price list is read top to bottom like a menu, and
 * rules let sixty of them sit on one page without it becoming sixty boxes.
 * Rows carry the homepage index's pointer behaviour too — hovering one steps
 * the others back, so the list gets quieter under the cursor.
 *
 * A look with sizes shows its range on the row and its sizes underneath, so
 * "from ₦12,000" is never the only number a reader is given.
 */
function looksIn(categoryId) {
  return LOOKS.filter((look) => look.category === categoryId);
}

function priceLabel(look) {
  if (!look.hasVariants) return naira(look.minPrice);
  const max = Math.max(...look.options.map((o) => o.price));
  return max === look.minPrice ? naira(look.minPrice) : `From ${naira(look.minPrice)}`;
}

function durationLabel(look) {
  if (look.minDuration === look.maxDuration) return formatDuration(look.minDuration);
  return `${formatDuration(look.minDuration)} – ${formatDuration(look.maxDuration)}`;
}

/** Sticky rail of category anchors, with the one you are reading marked. */
function CategoryRail({ categories, active }) {
  return (
    <nav
      aria-label="Service categories"
      className="sticky top-16 z-30 -mx-4 mb-12 border-b border-ink/10 bg-sand/90 px-4 py-4 backdrop-blur md:top-[100px] md:mx-0 md:mb-16"
    >
      <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map(({ slug, label }) => (
          <li key={slug}>
            <a
              href={`#${slug}`}
              aria-current={active === slug ? "true" : undefined}
              className={`inline-flex whitespace-nowrap rounded-full px-4 py-2 text-v2-body-sm font-semibold transition-colors duration-200 ease-out ${
                active === slug
                  ? "bg-ink text-white"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function ServiceMenu() {
  const [active, setActive] = useState(ACTIVE_CATEGORIES[0]?.slug ?? null);
  const sections = useRef(new Map());

  const register = useCallback((slug) => (node) => {
    if (node) sections.current.set(slug, node);
    else sections.current.delete(slug);
  }, []);

  // Marks the category whose heading last crossed the rail. Cheaper and
  // steadier than measuring every section on scroll.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const onScreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (onScreen) setActive(onScreen.target.dataset.slug);
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    sections.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby="service-menu-heading">
      <h2 id="service-menu-heading" className="sr-only">
        Services and prices
      </h2>

      <CategoryRail categories={ACTIVE_CATEGORIES} active={active} />

      <div className="flex flex-col gap-20 md:gap-28">
        {ACTIVE_CATEGORIES.map(({ id, slug, label }) => {
          const looks = looksIn(id);
          return (
            <div
              key={slug}
              id={slug}
              data-slug={slug}
              ref={register(slug)}
              className="scroll-mt-32 md:scroll-mt-44"
            >
              <Reveal className="flex items-end justify-between gap-6 border-t border-ink/15 pt-6 md:pt-8">
                <h3 className="font-display text-display-fluid uppercase leading-[0.95] text-ink">
                  {label}
                </h3>
                <p className="type-eyebrow shrink-0 pb-2 tabular-nums">
                  {looks.length} {looks.length === 1 ? "option" : "options"}
                </p>
              </Reveal>

              <ol className="v2-index mt-8 border-t border-ink/15 md:mt-10">
                {looks.map((look) => (
                  <li key={look.id} className="border-b border-ink/15">
                    <Link
                      href="/v2/booking"
                      className="group relative grid gap-x-8 py-7 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_11rem] md:py-8 lg:gap-x-12"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-px hidden h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100 md:block"
                      />

                      <div>
                        <h4 className="font-display text-[clamp(1.375rem,1.1rem+1.1vw,2rem)] uppercase leading-[1.05] text-ink transition-transform duration-500 ease-out md:group-hover:translate-x-2">
                          {look.name}
                        </h4>
                        <p className="mt-2 type-eyebrow tabular-nums">
                          {durationLabel(look)}
                        </p>

                        {/* Price rides under the name on a phone, where there
                            is no column of its own to hang it in. */}
                        <div className="mt-4 flex items-center justify-between gap-4 font-display text-v2-h3 uppercase tabular-nums text-ink md:hidden">
                          {priceLabel(look)}
                          <Arrow className="h-4 w-5 shrink-0" />
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0">
                        {look.description && (
                          <p className="max-w-[46ch] text-v2-body-sm leading-[1.55] text-ink-soft">
                            {look.description}
                          </p>
                        )}

                        {look.hasVariants && (
                          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                            {look.options.map((option) => (
                              <li
                                key={option.id}
                                className="text-v2-body-sm text-ash"
                              >
                                {option.label}{" "}
                                <span className="tabular-nums text-ink-soft">
                                  {naira(option.price)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="col-start-3 hidden items-start justify-end gap-6 md:flex">
                        <div className="text-right font-display text-[1.625rem] uppercase leading-none tabular-nums text-ink">
                          {priceLabel(look)}
                        </div>
                        <Arrow className="mt-1 h-4 w-5 shrink-0 text-ink transition-transform duration-500 ease-out group-hover:translate-x-1.5" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
