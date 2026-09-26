"use client";

/**
 * Send a password-reset email.
 *
 * The confirmation deliberately says "if an account exists". This project has
 * Firebase's email enumeration protection on, and a screen that answered
 * "we've sent it" only for real addresses would hand that answer straight back
 * to anyone probing the form.
 */

import { useRef, useState } from "react";
import Button from "@/components/v2/ui/Button";
import Input from "@/components/v2/ui/Input";
import { requestPasswordReset } from "@/lib/firebase/authService";
import { getPasswordResetErrorMessage } from "@/lib/auth/errors";
import { AuthHeading, AuthSwitch, FormError, focusFirstInvalid } from "./ui";
import { resetErrorsFor } from "./validate";

export default function ResetForm({
  email,
  onEmailChange,
  onSwitchToSignIn,
  titleAs,
}) {
  const [fieldErrors, setFieldErrors] = useState({});
  const formRef = useRef(null);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errors = resetErrorsFor({ email });
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      focusFirstInvalid(formRef);
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(getPasswordResetErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-7">
        <AuthHeading
          as={titleAs}
              eyebrow="Check your email"
          title="On its way"
          lede={`If an account exists for ${email}, we've sent a link to set a new password. Give it a minute, and look in spam if it isn't there.`}
        />
        <Button type="button" className="w-full" onClick={onSwitchToSignIn}>
          Back to log in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <AuthHeading
        as={titleAs}
        eyebrow="Password"
        title="Reset password"
        lede="Tell us the email on your account and we'll send a link to set a new password."
      />

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
            setError(null);
            setFieldErrors({});
          }}
        />

        <FormError>{error}</FormError>

        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>

      <AuthSwitch prompt="Remembered it?" action="Log in" onClick={onSwitchToSignIn} />
    </div>
  );
}
