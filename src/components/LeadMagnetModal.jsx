"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { merriweather } from "@/app/layout";
import { Check } from "lucide-react";

const HEADLINE = "Get The Ultimate 4C Hair Survival Guide";
const SUBHEAD =
  "Practical tips for healthier hair, delivered straight to your inbox.";
const BULLETS = [
  "Expert-backed advice you can use today",
  "Simple routines that fit your schedule",
  "No spam—just one email with your ebook",
];
const CTA_LABEL = "Send me the ebook";
const PRIVACY_TEXT =
  "By subscribing, you agree to receive occasional emails from us. No spam. Unsubscribe anytime.";
const SUCCESS_HEADLINE = "Check your email";
const SUCCESS_MESSAGE =
  "We've sent your free ebook. If you don't see it, check your spam folder.";

export function LeadMagnetModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [status, setStatus] = React.useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("https://us-central1-flourish-roots.cloudfunctions.net/leadMagnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      onSuccess?.();
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      onClose?.();
      if (status !== "success") {
        setStatus("idle");
        setEmail("");
        setFirstName("");
        setErrorMessage("");
      }
    }
  };

  const handleClose = () => {
    onClose?.();
    setStatus("idle");
    setEmail("");
    setFirstName("");
    setErrorMessage("");
  };

  const DARK  = "#120D07";
  const GOLD  = "#DDA15E";
  const RED   = "#BD2E2E";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto border-0 p-0 [&>button]:text-black/40 [&>button]:hover:text-black [&>button]:hover:opacity-100")}
        onEscapeKeyDown={handleClose}
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-describedby="lead-magnet-description"
        style={{ background: "#fff" }}
      >
        {/* Gold top bar */}
        <div className="h-1 w-full rounded-t-lg" style={{ background: GOLD }} />

        <div className="px-7 pb-8 pt-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle
              className={cn(merriweather.className, "text-xl sm:text-2xl font-semibold")}
              style={{ color: DARK }}
            >
              {status === "success" ? SUCCESS_HEADLINE : HEADLINE}
            </DialogTitle>
            <DialogDescription id="lead-magnet-description" asChild>
              {status === "success" ? (
                <p className="text-sm" style={{ color: "rgba(18,13,7,0.65)" }}>{SUCCESS_MESSAGE}</p>
              ) : (
                <p className="text-sm" style={{ color: "rgba(18,13,7,0.65)" }}>{SUBHEAD}</p>
              )}
            </DialogDescription>
          </DialogHeader>

          {status === "success" ? (
            <div className="pt-5">
              <div className="mb-5 flex justify-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "rgba(18,13,7,0.12)", border: `1px solid rgba(18,13,7,0.25)` }}
                >
                  <Check size={26} style={{ color: DARK }} strokeWidth={2} />
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-full rounded-md py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: RED }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {status !== "error" && (
                <ul className="mt-5 space-y-2.5 mb-5">
                  {BULLETS.map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "rgba(18,13,7,0.80)" }}>
                      <span
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ background: "rgba(18,13,7,0.12)", border: `1px solid rgba(18,13,7,0.25)` }}
                      >
                        <Check size={10} style={{ color: DARK }} strokeWidth={3} />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="lead-magnet-email"
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: DARK }}
                  >
                    Email
                  </label>
                  <input
                    id="lead-magnet-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === "loading"}
                    autoComplete="email"
                    className="w-full rounded-md px-4 py-3 text-sm focus:outline-none"
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      border: `1px solid rgba(18,13,7,0.20)`,
                      color: DARK,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = DARK)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(18,13,7,0.20)")}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="lead-magnet-firstname"
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: DARK }}
                  >
                    First name{" "}
                    <span style={{ color: "rgba(18,13,7,0.45)" }}>(optional)</span>
                  </label>
                  <input
                    id="lead-magnet-firstname"
                    type="text"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={status === "loading"}
                    autoComplete="given-name"
                    className="w-full rounded-md px-4 py-3 text-sm focus:outline-none"
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      border: `1px solid rgba(18,13,7,0.20)`,
                      color: DARK,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = DARK)}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(18,13,7,0.20)")}
                  />
                </div>

                {errorMessage && (
                  <p className="text-sm font-medium" style={{ color: RED }}>{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || !email.trim()}
                  className="w-full rounded-md py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: RED }}
                >
                  {status === "loading" ? "Sending…" : CTA_LABEL}
                </button>
              </form>

              <p className="mt-5 text-xs" style={{ color: "rgba(18,13,7,0.45)" }}>{PRIVACY_TEXT}</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
