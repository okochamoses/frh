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
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OrDivider from "./OrDivider";

// Maps Firebase Auth error codes to plain-English messages
function getErrorMessage(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    default:
      return "Sign up failed. Please try again.";
  }
}

export default function SignUpModal() {
  const { authModalOpen, closeAuthModal, login, switchToSignIn } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  // ── Email + password sign-up ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validation = validateSignUpForm(formData);
    if (!validation.valid) { setError(validation.error); return; }

    setLoading(true);
    try {
      const profile = await signUpWithEmail(formData);
      login(profile);
    } catch (err) {
      setError(getErrorMessage(err));
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
      login(profile);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={closeAuthModal}>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl">Create account</DialogTitle>
          <DialogDescription>Sign up with Google or your email.</DialogDescription>
        </DialogHeader>

        {/* Google */}
        <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={loading}>
          Sign up with Google
        </Button>

        <OrDivider />

        {/* Email + password form */}
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input className="py-5" placeholder="First Name"   value={formData.firstName}       onChange={handleChange("firstName")} />
            <Input className="py-5" placeholder="Last Name"    value={formData.lastName}        onChange={handleChange("lastName")} />
          </div>
          <Input className="py-5" type="email"    placeholder="Email"           value={formData.email}           onChange={handleChange("email")} autoComplete="email" />
          <Input className="py-5" type="tel"      placeholder="Mobile Number"   value={formData.phone}           onChange={handleChange("phone")} />
          <Input className="py-5" type="password" placeholder="Password"        value={formData.password}        onChange={handleChange("password")} autoComplete="new-password" />
          <Input className="py-5" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} autoComplete="new-password" />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <DialogFooter>
            <Button className="w-full" type="submit" isLoading={loading}>
              Create account
            </Button>
          </DialogFooter>
        </form>

        <p className="text-sm text-center text-stone-400">
          Already have an account?{" "}
          <span className="text-blue-500 cursor-pointer" onClick={switchToSignIn}>
            Sign in
          </span>
        </p>
      </DialogContent>
    </Dialog>
  );
}
