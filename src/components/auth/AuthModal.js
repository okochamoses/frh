"use client";

import React from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";

const AuthModal = () => {
  const { authMode } = useAuth();
  return authMode === "signin" ? <SignInModal /> : <SignUpModal />;
};

export default AuthModal;
