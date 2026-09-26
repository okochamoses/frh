import ManageBooking from "@/components/v2/booking/ManageBooking";

export const metadata = {
  title: "Your booking — Flourish Roots Hair",
  description: "Move or cancel your appointment at Flourish Roots Hair Co., Isolo, Lagos.",
  // The link carries a token, so it should never be indexed or followed.
  robots: { index: false, follow: false },
};

export default function ManageBookingPage() {
  return <ManageBooking />;
}
