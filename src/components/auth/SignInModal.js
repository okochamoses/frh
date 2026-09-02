"use client";

/**
 * SignInModal
 *
 * Handles two sign-in paths:
 *   1. Email + password (standard)
 *   2. Google OAuth popup (via Firebase Auth)
 *
 * On success, calls login() from AuthContext which updates the app state,
 * closes the modal and resumes any action the user was interrupted from.
 */

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/authService";
import { getUserProfile } from "@/lib/firebase/userService";
import { validateEmail } from "@/lib/auth/validators";
import {
  getSignInErrorMessage,
  getGoogleErrorMessage,
  isUserCancelledPopup,
} from "@/lib/auth/errors";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OrDivider from "./OrDivider";
import FormError from "./FormError";

export default function SignInModal() {
  const { login, switchToSignUp, switchToReset, authEmail, setAuthEmail } = useAuth();

  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  // Any edit clears the previous error — a stale message next to a field the
  // user has already corrected is just confusing.
  const handleEmailChange = (e) => { setAuthEmail(e.target.value); setError(null); };
  const handlePasswordChange = (e) => { setPassword(e.target.value); setError(null); };

  // ── Email + password sign-in ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(authEmail);
    if (!emailCheck.valid) { setError(emailCheck.error); return; }
    if (!password.trim())  { setError("Password is required"); return; }

    setLoading(true);
    try {
      const firebaseUser = await signInWithEmail(authEmail, password);
      const profile = await getUserProfile(firebaseUser.uid);
      login(profile ?? { uid: firebaseUser.uid, email: firebaseUser.email });
    } catch (err) {
      setError(getSignInErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-in ──────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await signInWithGoogle();
      // null means the popup was blocked and we redirected instead — the page
      // is navigating away, so there is nothing to do here.
      if (profile) login(profile);
    } catch (err) {
      if (!isUserCancelledPopup(err)) setError(getGoogleErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-3xl">Log in</DialogTitle>
        <DialogDescription>Enter your email and password to continue.</DialogDescription>
      </DialogHeader>

      {/* Google */}
      <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={loading}>
        Continue with Google
      </Button>

      <OrDivider />

      {/* noValidate: without it the browser blocks submit with its own tooltip
          and our validation messages never render. */}
      <form onSubmit={handleSubmit} className="grid gap-3" noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            placeholder="Email"
            value={authEmail}
            onChange={handleEmailChange}
            className="py-5"
            autoComplete="email"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className="py-5"
            autoComplete="current-password"
          />
        </div>

        <button
          type="button"
          onClick={switchToReset}
          className="justify-self-start text-sm text-blue-500 hover:underline"
        >
          Forgot your password?
        </button>

        <FormError>{error}</FormError>

        <Button className="w-full" type="submit" isLoading={loading}>
          Sign in
        </Button>
      </form>

      <p className="text-sm text-center text-stone-400">
        Don&apos;t have an account?{" "}
        <button type="button" className="text-blue-500 hover:underline" onClick={switchToSignUp}>
          Sign up
        </button>
      </p>
    </>
  );
}
