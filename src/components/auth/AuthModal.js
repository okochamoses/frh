"use client";

/**
 * AuthModal
 *
 * Owns the single Dialog. The three views render *inside* it rather than each
 * bringing their own Dialog — swapping whole dialogs unmounted and remounted
 * Radix's focus trap and scroll lock on every mode switch, which discarded
 * form state and caused a visible flicker.
 */

import React from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { AUTH_MODES } from "@/lib/auth/constants";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";
import ResetPasswordModal from "./ResetPasswordModal";

const VIEWS = {
  [AUTH_MODES.SIGN_IN]: SignInModal,
  [AUTH_MODES.SIGN_UP]: SignUpModal,
  [AUTH_MODES.RESET]:   ResetPasswordModal,
};

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, authMode } = useAuth();

  const View = VIEWS[authMode] ?? SignInModal;

  return (
    <Dialog
      open={authModalOpen}
      // Radix passes the next open state; only act on a close.
      onOpenChange={(open) => { if (!open) closeAuthModal(); }}
    >
      <DialogContent
        data-testid="auth-modal"
        className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <View />
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
