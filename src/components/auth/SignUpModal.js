"use client";

import React, { useState, useCallback } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { authApi } from "@/lib/auth/api";
import { validateSignUpForm } from "@/lib/auth/validators";
import { storage } from "@/lib/auth/storage";
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
import Link from "next/link";
import {AUTH_MODAL} from "@/lib/auth/constants";

const SignUpModal = () => {
  const { isOpen, toggleModal, loading, login, setActiveModal, setIsOpen, setLoading } = useAuth();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    const validation = validateSignUpForm(formData);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.signUp(formData);

      if (response.status === 200 && response.data?.data?.token) {
        const { token, user } = response.data.data;
        storage.setToken(token);
        setIsOpen(false);
      } else {
        setError(response.data?.error || "Sign up failed");
      }
    } catch (err) {
      console.error("Sign up failed:", err);
      setError(err.response?.data?.error || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
            <DialogTitle className="text-3xl">Sign up</DialogTitle>
            <DialogDescription className="text-sm">
              Create an account using Google or your email and password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSignUp}>
            <div className="grid gap-4">
              <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={handleGoogleError}
                  useOneTap
                  text="signup_with"
              />

              <OrDivider />

              <div className="grid grid-cols-2 gap-3">
                <Input
                    className="py-5"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    placeholder="First Name"
                />
                <Input
                    className="py-5"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    placeholder="Last Name"
                />
              </div>

              <Input
                  className="py-5"
                  id="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="Email"
              />
              <Input
                  className="py-5"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  placeholder="Mobile Number"
              />
              <Input
                  className="py-5"
                  id="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  type="password"
                  placeholder="Password"
              />
              <Input
                  className="py-5"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  type="password"
                  placeholder="Confirm Password"
              />
            </div>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

            <DialogFooter className="mt-4">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Loading..." : "Continue"}
              </Button>
            </DialogFooter>
          </form>

          <span className={"text-sm text-center font-medium text-slate-400"}>Have an account? <span className={"text-blue-500 font-medium cursor-pointer"} onClick={() => {setActiveModal(AUTH_MODAL.SIGN_IN)}}>Login</span></span>
        </DialogContent>
      </Dialog>
  );
};

export default SignUpModal;