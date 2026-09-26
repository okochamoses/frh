import AccountSettings from "@/components/v2/account/AccountSettings";

export const metadata = {
  title: "Your account — Flourish Roots Hair",
  description: "Your name and the number we reach you on for appointments at Flourish Roots Hair Co.",
  // A signed-out crawler sees only a log-in prompt, and a signed-in client's
  // details are nobody else's business.
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return <AccountSettings />;
}
