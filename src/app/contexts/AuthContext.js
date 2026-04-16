"use client";

/**
 * AuthContext
 *
 * Provides the current user and auth actions to the entire app.
 *
 * Firebase Auth automatically persists the session in the browser —
 * we don't need localStorage or manual token management.
 * `onAuthStateChanged` fires once on mount (restoring any existing
 * session) and again whenever the user signs in or out.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile } from "@/lib/firebase/userService";
import { logOut } from "@/lib/firebase/authService";
import AuthModal from "@/components/auth/AuthModal";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // The merged user object: Firebase Auth UID + Firestore profile fields
  const [user, setUser]               = useState(null);
  const [hydrated, setHydrated]       = useState(false); // true once the initial auth check completes
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode]       = useState("signin"); // "signin" | "signup"

  // Derived — recomputed on every render so it's never stale
  const isAuthenticated = hydrated && user !== null;

  // ── Session restoration ───────────────────────────────────────────────────
  useEffect(() => {
    // Firebase calls this immediately with the current session (or null),
    // then on every subsequent sign-in / sign-out.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Merge the Firestore profile (name, phone, etc.) with the UID
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile ?? { uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        setUser(null);
      }
      setHydrated(true);
    });

    return unsubscribe; // remove listener on unmount
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Called by the auth modals after a successful sign-in or sign-up.
   * `onAuthStateChanged` will also fire and keep the user in sync,
   * but we update state immediately so the UI responds without waiting.
   */
  const login = useCallback((userProfile) => {
    setUser(userProfile);
    setAuthModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    await logOut();
    // onAuthStateChanged will fire and set user to null automatically
  }, []);

  /** Updates just the user's profile fields in local state (e.g. after adding a phone number). */
  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const openAuthModal  = useCallback(() => { setAuthMode("signin"); setAuthModalOpen(true); }, []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);
  const switchToSignIn = useCallback(() => setAuthMode("signin"), []);
  const switchToSignUp = useCallback(() => setAuthMode("signup"), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUser,
        isAuthenticated,
        hydrated,
        authModalOpen,
        authMode,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
        switchToSignIn,
        switchToSignUp,
      }}
    >
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
