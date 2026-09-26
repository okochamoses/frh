import AuthRoute from "@/components/v2/auth/AuthRoute";
import { AUTH_MODES } from "@/lib/auth/constants";

export const metadata = {
  title: "Create an account — Flourish Roots Hair",
  description:
    "Create a Flourish Roots Hair Co. account to keep your appointment history. Booking never needs one.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <AuthRoute mode={AUTH_MODES.SIGN_UP} />;
}
