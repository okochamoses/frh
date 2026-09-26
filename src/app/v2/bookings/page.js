import Appointments from "@/components/v2/account/Appointments";

export const metadata = {
  title: "Your appointments — Flourish Roots Hair",
  description: "Every visit you have booked at Flourish Roots Hair Co., Isolo, Lagos.",
  // One client's diary. Nothing here is for a crawler.
  robots: { index: false, follow: false },
};

export default function BookingsPage() {
  return <Appointments />;
}
