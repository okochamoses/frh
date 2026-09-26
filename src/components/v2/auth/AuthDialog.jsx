"use client";

/**
 * The v2 auth modal.
 *
 * Auth in v2 is never the destination. Booking needs no account, so a client
 * only ever reaches this on the way to something else — mid-booking at the
 * Details step, or from the header while reading a page. A modal keeps that
 * journey on screen behind them; a route would unload it.
 *
 * The shell is the booking sheet's: a centred card from `sm` up, a bottom sheet
 * on phones, mounted inside `.v2-root` so it inherits v2's faces and colours.
 * The views themselves are `AuthPanel`, shared with `/login` and friends.
 *
 * One Dialog for all three modes, not three dialogs — swapping whole dialogs
 * remounts Radix's focus trap and scroll lock on every switch, which threw away
 * whatever had been typed and flickered on the way through.
 */

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { AUTH_MODES } from "@/lib/auth/constants";
import { useV2PortalContainer } from "@/components/v2/ui/portal";
import AuthPanel from "./AuthPanel";

const SWITCH = {
  [AUTH_MODES.SIGN_IN]: "switchToSignIn",
  [AUTH_MODES.SIGN_UP]: "switchToSignUp",
  [AUTH_MODES.RESET]: "switchToReset",
};

export default function AuthDialog() {
  const auth = useAuth();
  const { authModalOpen, closeAuthModal, authMode, authEmail, setAuthEmail, login } = auth;
  const container = useV2PortalContainer();

  return (
    <Dialog.Root
      open={authModalOpen}
      // Radix hands over the next open state; only a close concerns us.
      onOpenChange={(open) => {
        if (!open) closeAuthModal();
      }}
    >
      <Dialog.Portal container={container}>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-obsidian/55 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          data-testid="auth-modal"
          aria-describedby={undefined}
          /* Left to Radix, focus lands on the close button, which a screen
             reader then reads as "Close" before anything that says where it
             is. Focus goes to the dialog itself instead, so the heading is
             what gets announced, and no phone keyboard opens over a form the
             client has not looked at yet. */
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            e.currentTarget.focus();
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={[
            "fixed z-[71] flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto bg-white text-ink outline-none",
            "inset-x-0 bottom-0 rounded-t-[28px]",
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(460px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4",
          ].join(" ")}
        >
          {/* The grab handle the booking sheets use, so a phone reads this as
              the same kind of thing. */}
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-latte sm:hidden" aria-hidden="true" />

          <Dialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </Dialog.Close>

          <div className="p-6 pt-7 sm:p-8">
            <AuthPanel
              mode={authMode}
              onModeChange={(next) => auth[SWITCH[next]]()}
              email={authEmail}
              onEmailChange={setAuthEmail}
              // `login` closes the modal and resumes whatever the client was
              // doing when we interrupted them.
              onDone={login}
              /* Radix renders this as the <h2> it needs for the dialog's
                 accessible name, and assigns that element's id itself. */
              titleAs={Dialog.Title}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
