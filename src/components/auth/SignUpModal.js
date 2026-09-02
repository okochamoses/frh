"use client";

/**
 * SignUpModal
 *
 * Creates a new account via email + password or Google.
 * After account creation, the user's profile is written to Firestore
 * (name, phone, etc.) and login() is called to update app state.
 */

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { signUpWithEmail, signInWithGoogle } from "@/lib/firebase/authService";
import { validateSignUpForm } from "@/lib/auth/validators";
import { VALIDATION } from "@/lib/auth/constants";
import {
  getSignUpErrorMessage,
  getGoogleErrorMessage,
  isUserCancelledPopup,
} from "@/lib/auth/errors";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OrDivider from "./OrDivider";
import FormError from "./FormError";

export default function SignUpModal() {
  const { login, switchToSignIn, authEmail, setAuthEmail } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", password: "", confirmPassword: "",
  });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  // Email lives in the context so it survives switching to sign-in and back.
  const handleEmailChange = (e) => { setAuthEmail(e.target.value); setError(null); };

  // ── Email + password sign-up ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const values = { ...formData, email: authEmail };
    const validation = validateSignUpForm(values);
    if (!validation.valid) { setError(validation.error); return; }

    setLoading(true);
    try {
      const profile = await signUpWithEmail(values);
      login(profile);
    } catch (err) {
      setError(getSignUpErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-up ──────────────────────────────────────────────────────
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await signInWithGoogle();
      // null means the popup was blocked and we redirected instead.
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
        <DialogTitle className="text-3xl">Create account</DialogTitle>
        <DialogDescription>Sign up with Google or your email.</DialogDescription>
      </DialogHeader>

      {/* Google */}
      <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignUp} disabled={loading}>
        Sign up with Google
      </Button>

      <OrDivider />

      {/* noValidate so our own messages render instead of the browser's. */}
      <form onSubmit={handleSubmit} className="grid gap-3" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="signup-first-name">First name</Label>
            <Input id="signup-first-name" className="py-5" placeholder="First Name"
                   value={formData.firstName} onChange={handleChange("firstName")}
                   autoComplete="given-name" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="signup-last-name">Last name</Label>
            <Input id="signup-last-name" className="py-5" placeholder="Last Name"
                   value={formData.lastName} onChange={handleChange("lastName")}
                   autoComplete="family-name" />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" className="py-5" type="email" placeholder="Email"
                 value={authEmail} onChange={handleEmailChange} autoComplete="email" />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="signup-phone">Mobile number</Label>
          <Input id="signup-phone" className="py-5" type="tel" placeholder="Mobile Number"
                 value={formData.phone} onChange={handleChange("phone")} autoComplete="tel" />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" className="py-5" type="password" placeholder="Password"
                 value={formData.password} onChange={handleChange("password")}
                 autoComplete="new-password" aria-describedby="signup-password-hint" />
          <p id="signup-password-hint" className="text-xs text-stone-400">
            At least {VALIDATION.MIN_PASSWORD_LENGTH} characters.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="signup-confirm-password">Confirm password</Label>
          <Input id="signup-confirm-password" className="py-5" type="password" placeholder="Confirm Password"
                 value={formData.confirmPassword} onChange={handleChange("confirmPassword")}
                 autoComplete="new-password" />
        </div>

        <FormError>{error}</FormError>

        <Button className="w-full" type="submit" isLoading={loading}>
          Create account
        </Button>
      </form>

      <p className="text-sm text-center text-stone-400">
        Already have an account?{" "}
        <button type="button" className="text-blue-500 hover:underline" onClick={switchToSignIn}>
          Sign in
        </button>
      </p>
    </>
  );
}
