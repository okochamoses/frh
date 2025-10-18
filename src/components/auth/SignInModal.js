"use client";

import React, { useState, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { authApi } from "@/lib/auth/api";
import { validateEmail } from "@/lib/auth/validators";
import { AUTH_MODAL } from "@/lib/auth/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLogin } from "@react-oauth/google";
import OrDivider from "./OrDivider";

const SignInModal = () => {
  const { isOpen, toggleModal, login, setActiveModal } = useAuth();
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enterPassword, setEnterPassword] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();

    // If password field is not shown yet, check email first
    if (!enterPassword) {
      await handleEmailCheck(e);
      return;
    }

    // Validate password
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      await login({
        email: email,
        password: password,
        provider: "local",
      });
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailCheck = async (e) => {
    setError(null);

    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.checkEmail(email);
      if (response?.data?.isSignedUp) {
        // if user is already active (here we are checking for local users)
        // then we display the password field
        setEnterPassword(true);
      } else {
        setActiveModal(AUTH_MODAL.SIGN_UP);
      }
    } catch (err) {
      console.error("Email check failed:", err);
      setError("Failed to check email. Please try again.");
    }
    setLoading(false)
  };

  const handleGoogleLogin = useCallback(
      (data) => {
        login({ ...data, provider: "google" }).catch((err) => {
          setError("Google login failed. Please try again.");
        });
      },
      [login]
  );

  const handleGoogleError = useCallback(() => {
    console.log("Google Login Failed");
    setError("Google login failed. Please try again.");
  }, []);

  return (
      <Dialog open={isOpen} onOpenChange={toggleModal}>
        <DialogContent
            className="sm:max-w-[425px]"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl">Log in or Sign up</DialogTitle>
            <DialogDescription className="text-sm">
              Enter your email to continue
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLocalLogin}>
            <div className="grid gap-4">
              <div className="grid">
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={handleGoogleError}
                    useOneTap
                />
              </div>

              <OrDivider />

              <div className="grid gap-3">
                <Input
                    className="py-5"
                    id="email"
                    onChange={handleEmailChange}
                    value={email}
                    name="email"
                    type="email"
                    placeholder="Email"
                />
              </div>

              <div className={`${!enterPassword ? "hidden" : "grid"}`}>
                <Input
                    className="py-5"
                    id="password"
                    onChange={handlePasswordChange}
                    value={password}
                    name="password"
                    type="password"
                    placeholder="Password"
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

            <DialogFooter className="mt-4">
              <Button className="w-full" type="submit" isLoading={loading}>
                Continue
              </Button>
            </DialogFooter>
          </form>
          <p className={"text-sm text-center text-blue-500 cursor-pointer"} onClick={() => setActiveModal(AUTH_MODAL.SIGN_UP)}>Sign Up for an account</p>
        </DialogContent>
      </Dialog>
  );
};

export default SignInModal;