import AuthRoute from "@/components/v2/auth/AuthRoute";
import { AUTH_MODES } from "@/lib/auth/constants";

export const metadata = {
  title: "Reset your password — Flourish Roots Hair",
  description: "Send yourself a link to set a new password for your Flourish Roots Hair Co. account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <AuthRoute mode={AUTH_MODES.RESET} />;
}
