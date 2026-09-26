"use client";

/**
 * The three auth views, and nothing around them.
 *
 * Both surfaces render this: the modal (`AuthDialog`) and the standalone routes
 * (`/v2/login`, `/v2/signup`, `/v2/reset-password`). They differ only in what
 * `onModeChange` does — swap the view in place, or navigate — and in what
 * happens after a successful sign-in.
 */

import { AUTH_MODES } from "@/lib/auth/constants";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import ResetForm from "./ResetForm";

export default function AuthPanel({
  mode = AUTH_MODES.SIGN_IN,
  onModeChange,
  email,
  onEmailChange,
  onDone,
  titleAs,
}) {
  const shared = { email, onEmailChange, onDone, titleAs };

  if (mode === AUTH_MODES.SIGN_UP) {
    return <SignUpForm {...shared} onSwitchToSignIn={() => onModeChange(AUTH_MODES.SIGN_IN)} />;
  }

  if (mode === AUTH_MODES.RESET) {
    return <ResetForm {...shared} onSwitchToSignIn={() => onModeChange(AUTH_MODES.SIGN_IN)} />;
  }

  return (
    <SignInForm
      {...shared}
      onSwitchToSignUp={() => onModeChange(AUTH_MODES.SIGN_UP)}
      onSwitchToReset={() => onModeChange(AUTH_MODES.RESET)}
    />
  );
}
