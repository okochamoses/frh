import Hero from "@/components/v2/sections/Hero";
import HeroCollage from "@/components/v2/sections/HeroCollage";
import TopBandFade from "@/components/v2/TopBandFade";
import SectionIntro from "@/components/v2/sections/SectionIntro";
import ThreeCardSplit from "@/components/v2/sections/ThreeCardSplit";
import ServicesOverview from "@/components/v2/sections/ServicesOverview";
import HowAVisitGoes from "@/components/v2/sections/HowAVisitGoes";
import WhyChooseUs from "@/components/v2/sections/WhyChooseUs";
import CoachingSection from "@/components/v2/sections/CoachingSection";
import SpaceSection from "@/components/v2/sections/SpaceSection";
import Testimonials from "@/components/v2/sections/Testimonials";
import NewsletterSection from "@/components/v2/sections/NewsletterSection";
import VisitUs from "@/components/v2/sections/VisitUs";
import FaqSection from "@/components/v2/sections/FaqSection";
import ClosingCta from "@/components/v2/sections/ClosingCta";

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
            bar is what fades the hero and nav from mustard to white. */}
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

      {/* What we sell, then how we do it, then why that is different. */}
      <ServicesOverview />
      <HowAVisitGoes />
      <WhyChooseUs />

      {/* The second offer, for clients who want a routine rather than a style. */}
      <CoachingSection />
      <SpaceSection />

      <Testimonials />

      {/* Lowest-commitment entry point, then the practical details. */}
      <NewsletterSection />
      <VisitUs />
      <FaqSection />
      <ClosingCta />
    </main>
  );
}
