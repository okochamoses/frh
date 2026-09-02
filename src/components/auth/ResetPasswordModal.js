"use client";

/**
 * ResetPasswordModal
 *
 * Sends a Firebase password-reset email.
 *
 * The confirmation is deliberately worded so it reveals nothing about whether
 * the address has an account — this project has email enumeration protection
 * enabled and the UI should not undo it.
 */

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { requestPasswordReset } from "@/lib/firebase/authService";
import { validateEmail } from "@/lib/auth/validators";
import { getPasswordResetErrorMessage } from "@/lib/auth/errors";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormError from "./FormError";

export default function ResetPasswordModal() {
  const { switchToSignIn, authEmail, setAuthEmail } = useAuth();

  const [error, setError]     = useState(null);
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(authEmail);
    if (!emailCheck.valid) { setError(emailCheck.error); return; }

    setLoading(true);
    try {
      await requestPasswordReset(authEmail);
      setSent(true);
    } catch (err) {
      setError(getPasswordResetErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-3xl">Check your email</DialogTitle>
          <DialogDescription>
            If an account exists for {authEmail}, we&apos;ve sent a link to reset your password.
            It may take a minute to arrive — remember to check your spam folder.
          </DialogDescription>
        </DialogHeader>

        <Button className="w-full" type="button" onClick={switchToSignIn}>
          Back to sign in
        </Button>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-3xl">Reset password</DialogTitle>
        <DialogDescription>
          Enter your email and we&apos;ll send you a link to set a new password.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-3" noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={(e) => { setAuthEmail(e.target.value); setError(null); }}
            className="py-5"
            autoComplete="email"
          />
        </div>

        <FormError>{error}</FormError>

        <Button className="w-full" type="submit" isLoading={loading}>
          Send reset link
        </Button>
      </form>

      <p className="text-sm text-center text-stone-400">
        Remembered it?{" "}
        <button type="button" className="text-blue-500 hover:underline" onClick={switchToSignIn}>
          Sign in
        </button>
      </p>
    </>
  );
}
