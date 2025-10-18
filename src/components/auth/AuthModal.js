"use client";

import React from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { AUTH_MODAL } from "@/lib/auth/constants";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";

const AuthModal = () => {
  const { activeModal } = useAuth();

  if (activeModal === AUTH_MODAL.SIGN_IN) {
    return <SignInModal />;
  }

  return <SignUpModal />;
};

export default AuthModal;