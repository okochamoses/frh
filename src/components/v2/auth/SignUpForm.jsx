"use client";

/**
 * Create an account.
 *
 * Worth saying plainly on the form: an account is never required to book at
 * Flourish Roots. This is the upgrade path for someone who wants their history
 * kept, and the copy says so rather than implying a gate that isn't there.
 */

import { useRef, useState } from "react";
import Button from "@/components/v2/ui/Button";
import Input from "@/components/v2/ui/Input";
import { signUpWithEmail } from "@/lib/firebase/authService";
import { getSignUpErrorMessage } from "@/lib/auth/errors";
import { VALIDATION } from "@/lib/auth/constants";
import { AuthHeading, AuthSwitch, FormError, focusFirstInvalid, GoogleButton, OrDivider } from "./ui";
import useGoogleAuth from "./useGoogleAuth";
import { signUpErrorsFor } from "./validate";

const EMPTY = { firstName: "", lastName: "", phone: "", password: "", confirmPassword: "" };

export default function SignUpForm({
  email,
  onEmailChange,
  onDone,
  onSwitchToSignIn,
  titleAs,
}) {
  const [form, setForm] = useState(EMPTY);
  const formRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const google = useGoogleAuth({ onDone, onError: setError });
  const busy = loading || google.busy;

  const clear = (field) => {
    setError(null);
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const change = (field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    clear(field);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const values = { ...form, email };
    const errors = signUpErrorsFor(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      focusFirstInvalid(formRef);
      return;
    }

    setLoading(true);
    try {
      onDone(await signUpWithEmail(values));
    } catch (err) {
      setError(getSignUpErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <AuthHeading
        as={titleAs}
        eyebrow="New here"
        title="Create account"
        lede="You never need one to book. An account just keeps your history, so rebooking a style is one tap."
      />

      <GoogleButton onClick={google.start} disabled={busy}>
        Sign up with Google
      </GoogleButton>

      <OrDivider />

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="First name"
            placeholder="First Name"
            autoComplete="given-name"
            value={form.firstName}
            error={fieldErrors.firstName}
            onChange={change("firstName")}
          />
          <Input
            label="Surname"
            placeholder="Last Name"
            autoComplete="family-name"
            value={form.lastName}
            error={fieldErrors.lastName}
            onChange={change("lastName")}
          />
        </div>

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

        <Input
          label="Mobile number"
          placeholder="Mobile Number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={form.phone}
          error={fieldErrors.phone}
          onChange={change("phone")}
        />

        <Input
          label={`Password (${VALIDATION.MIN_PASSWORD_LENGTH}+ characters)`}
          placeholder="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          error={fieldErrors.password}
          onChange={change("password")}
        />

        <Input
          label="Confirm password"
          placeholder="Confirm Password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={change("confirmPassword")}
        />

        <FormError>{error}</FormError>

        <Button type="submit" className="w-full" loading={loading} disabled={busy}>
          Create account
        </Button>
      </form>

      <AuthSwitch
        prompt="Already have an account?"
        action="Log in"
        onClick={onSwitchToSignIn}
      />
    </div>
  );
}
