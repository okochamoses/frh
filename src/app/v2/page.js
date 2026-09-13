import Hero from "@/components/v2/sections/Hero";
import HeroCollage from "@/components/v2/sections/HeroCollage";
import TopBandFade from "@/components/v2/TopBandFade";
import SectionIntro from "@/components/v2/sections/SectionIntro";
import ThreeCardSplit from "@/components/v2/sections/ThreeCardSplit";
import ServicesOverview from "@/components/v2/sections/ServicesOverview";
import HowAVisitGoes from "@/components/v2/sections/HowAVisitGoes";
import NewsletterSection from "@/components/v2/sections/NewsletterSection";
import Testimonials from "@/components/v2/sections/Testimonials";
import VisitUs from "@/components/v2/sections/VisitUs";
import FaqSection from "@/components/v2/sections/FaqSection";
import ClosingCta from "@/components/v2/sections/ClosingCta";

// The most-shared page on the site, so it says what the salon is and where it
// is rather than inheriting the layout's one-liner.
export const metadata = {
  title: "Flourish Roots Hair Co. — 4C natural hair salon in Isolo, Lagos",
  description:
    "A natural hair salon in Isolo, Lagos for 4C hair: twists, braids, threading, locs, treatments and take-down. Every price listed, and gentle hands on your scalp.",
  alternates: { canonical: "/v2" },
};

// No bottom padding on <main>: the closing band is full-bleed and meets the
// footer directly, the way the hero meets the top of the page.
export default function V2HomePage() {
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      {/* Grouped so the page's flex gap does not open a seam between the
          hero and the collage that overlaps it. */}
      <div>
        <Hero />
        <HeroCollage />
        {/* Sits on the collage's bottom edge: crossing it behind the sticky
            bar is what fades the hero and nav from glow to the wall colour. */}
        <TopBandFade />
      </div>

      {/* Name the problem, then hand over the three ways in. */}
      <div className="flex flex-col gap-[clamp(3.5rem,6vw,7rem)]">
        <SectionIntro
          className="md:pt-[clamp(0rem,9vw,13rem)]"
          title="You already know how this usually goes"
          body="The style looks good. Two months later your edges are thinner than they were. That's not what protective styling is for."
        />
        <ThreeCardSplit />
      </div>

      {/* What we sell, the lowest-commitment way to stay in touch, then how a
          visit goes. */}
      <ServicesOverview />
      <NewsletterSection />
      <HowAVisitGoes />

      <Testimonials />

      {/* The practical details, then the close. */}
      <VisitUs />
      <FaqSection />
      <ClosingCta />
    </main>
  );
}
