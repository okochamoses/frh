import ConsultationHero from "@/components/v2/sections/ConsultationHero";
import PainPoints from "@/components/v2/sections/PainPoints";
import MeetMariam from "@/components/v2/sections/MeetMariam";
import CoachingWhatYouGet from "@/components/v2/sections/CoachingWhatYouGet";
import CoachingPaths from "@/components/v2/sections/CoachingPaths";
import CoachingChooser from "@/components/v2/sections/CoachingChooser";
import CoachingHowItWorks from "@/components/v2/sections/CoachingHowItWorks";
import CoachingTestimonials from "@/components/v2/sections/CoachingTestimonials";
import CoachingFaq from "@/components/v2/sections/CoachingFaq";
import CoachingClosingCta from "@/components/v2/sections/CoachingClosingCta";

export const metadata = {
  title: "Hair coaching with Mariam — Flourish Roots Hair",
  description:
    "One-on-one hair and scalp coaching with Mariam Okocha Ijeoma, in Isolo, Lagos or by video call. Four sessions from ₦20,000, each ending in a written routine built for your texture, your budget and your week.",
};

/**
 * Order is the argument: recognise yourself, meet the person, see what you
 * leave with, then the prices — value before cost — then help choosing, then
 * how the booking runs, then the questions that come up before paying.
 */
export default function ConsultationPage() {
  // No top padding on <main>: the hero is a full-bleed band and meets the
  // sticky nav directly, the way the homepage hero does. Padding here shows as
  // a strip of the sand page ground between the nav and the dark band.
  return (
    <main className="mx-auto flex max-w-[var(--v2-container)] flex-col gap-20 px-4 md:gap-28 md:px-8">
      <ConsultationHero />
      <PainPoints />
      <MeetMariam />
      <CoachingWhatYouGet />
      <CoachingPaths />
      <CoachingChooser />
      <CoachingTestimonials />
      <CoachingHowItWorks />
      <CoachingFaq />
      <CoachingClosingCta />
    </main>
  );
}
