"use client";

/**
 * SignInModal
 *
 * Handles two sign-in paths:
 *   1. Email + password (standard)
 *   2. Google OAuth popup (via Firebase Auth)
 *
 * On success, calls login() from AuthContext which updates the app state
 * and closes the modal. Firebase Auth's onAuthStateChanged also fires and
 * keeps the session in sync.
 */

import React, { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/authService";
import { getUserProfile } from "@/lib/firebase/userService";
import { validateEmail } from "@/lib/auth/validators";
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
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "No account found with this email. Want to sign up?";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Sign in failed. Please try again.";
  }
}

export default function SignInModal() {
  const { authModalOpen, closeAuthModal, login, switchToSignUp } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleEmailChange = (e) => { setEmail(e.target.value); setError(null); };
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // ── Email + password sign-in ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) { setError(emailCheck.error); return; }
    if (!password.trim())  { setError("Password is required"); return; }

    setLoading(true);
    try {
      const firebaseUser = await signInWithEmail(email, password);
      const profile = await getUserProfile(firebaseUser.uid);
      login(profile ?? { uid: firebaseUser.uid, email: firebaseUser.email });
    } catch (err) {
      setError(getErrorMessage(err));
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
      login(profile);
    } catch (err) {
      // User closed the popup — don't show an error
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
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
          <DialogTitle className="text-3xl">Log in</DialogTitle>
          <DialogDescription>Enter your email and password to continue.</DialogDescription>
        </DialogHeader>

        {/* Google */}
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
          Continue with Google
        </Button>

        <OrDivider />

        {/* Email + password */}
        <form onSubmit={handleSubmit} className="grid gap-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            className="py-5"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className="py-5"
            autoComplete="current-password"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <DialogFooter>
            <Button className="w-full" type="submit" isLoading={loading}>
              Sign in
            </Button>
          </DialogFooter>
        </form>

        <p className="text-sm text-center text-stone-400">
          Don&apos;t have an account?{" "}
          <span className="text-blue-500 cursor-pointer" onClick={switchToSignUp}>
            Sign up
          </span>
        </p>
      </DialogContent>
    </Dialog>
  );
}
