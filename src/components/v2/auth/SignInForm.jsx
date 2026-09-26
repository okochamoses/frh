"use client";

/**
 * Log in: email and password, or Google.
 *
 * Knows nothing about where it is rendered — the modal and `/login` both
 * mount this and differ only in what they do with `onDone`.
 */

import { useRef, useState } from "react";
import Button from "@/components/v2/ui/Button";
import Input from "@/components/v2/ui/Input";
import { signInWithEmail } from "@/lib/firebase/authService";
import { getUserProfile } from "@/lib/firebase/userService";
import { getSignInErrorMessage } from "@/lib/auth/errors";
import { AuthHeading, AuthSwitch, FormError, focusFirstInvalid, GoogleButton, OrDivider } from "./ui";
import useGoogleAuth from "./useGoogleAuth";
import { signInErrorsFor } from "./validate";

export default function SignInForm({
  email,
  onEmailChange,
  onDone,
  onSwitchToSignUp,
  onSwitchToReset,
  titleAs,
}) {
  const [password, setPassword] = useState("");
  const formRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const google = useGoogleAuth({ onDone, onError: setError });
  const busy = loading || google.busy;

  // Editing a field clears its message and any failure from the last attempt:
  // an error sitting next to something the client has already corrected only
  // reads as the form being broken.
  const clear = (field) => {
    setError(null);
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errors = signInErrorsFor({ email, password });
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      focusFirstInvalid(formRef);
      return;
    }

    setLoading(true);
    try {
      const firebaseUser = await signInWithEmail(email, password);
      const profile = await getUserProfile(firebaseUser.uid);
      onDone(profile ?? { uid: firebaseUser.uid, email: firebaseUser.email });
    } catch (err) {
      setError(getSignInErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <AuthHeading
        as={titleAs}
        eyebrow="Your account"
        title="Log in"
        lede="Your appointments, your history and one-tap rebooking of a style you've had before."
      />

      <GoogleButton onClick={google.start} disabled={busy}>
        Continue with Google
      </GoogleButton>

      <OrDivider />

      {/* noValidate: the browser's own bubble blocks submit and our messages,
          which are written for this salon, never get a chance to render. */}
      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Email"
          placeholder="Email"
          type="email"
          autoComplete="email"
          value={email}
          error={fieldErrors.email}
          onChange={(e) => {
            onEmailChange(e.target.value);
            clear("email");
          }}
        />

        <div className="flex flex-col gap-2">
          <Input
            label="Password"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            error={fieldErrors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear("password");
            }}
          />
          <button
            type="button"
            onClick={onSwitchToReset}
            className="self-start text-v2-body-sm font-semibold text-ink underline underline-offset-4 hover:text-ink/70"
          >
            Forgot your password?
          </button>
        </div>

        <FormError>{error}</FormError>

        <Button type="submit" className="w-full" loading={loading} disabled={busy}>
          Log in
        </Button>
      </form>

      <AuthSwitch
        prompt="New here?"
        action="Sign up"
        onClick={onSwitchToSignUp}
      />
    </div>
  );
}
