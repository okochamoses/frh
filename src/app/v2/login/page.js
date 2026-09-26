import AuthRoute from "@/components/v2/auth/AuthRoute";
import { AUTH_MODES } from "@/lib/auth/constants";

export const metadata = {
  title: "Log in — Flourish Roots Hair",
  description:
    "Log in to Flourish Roots Hair Co. to see your appointments and rebook a style you've had before.",
  // Nothing here belongs in search results, and an indexed sign-in page only
  // ever competes with the pages that should rank.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthRoute mode={AUTH_MODES.SIGN_IN} />;
}
