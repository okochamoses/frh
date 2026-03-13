"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const HEADLINE = "Get our free ebook";
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
      const res = await fetch("/api/lead-magnet", {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md sm:max-w-lg",
          "max-h-[90vh] overflow-y-auto"
        )}
        onEscapeKeyDown={handleClose}
        aria-describedby="lead-magnet-description"
      >
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl sm:text-2xl font-semibold">
            {status === "success" ? SUCCESS_HEADLINE : HEADLINE}
          </DialogTitle>
          <DialogDescription id="lead-magnet-description" asChild>
            {status === "success" ? (
              <p className="text-muted-foreground text-sm">{SUCCESS_MESSAGE}</p>
            ) : (
              <p className="text-muted-foreground text-sm">{SUBHEAD}</p>
            )}
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="pt-2">
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <>
            {status !== "error" && (
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
                {BULLETS.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lead-magnet-email">Email</Label>
                <Input
                  id="lead-magnet-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                  autoComplete="email"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-magnet-firstname">First name (optional)</Label>
                <Input
                  id="lead-magnet-firstname"
                  type="text"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={status === "loading"}
                  autoComplete="given-name"
                  className="w-full"
                />
              </div>
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading" || !email.trim()}
                isLoading={status === "loading"}
              >
                {CTA_LABEL}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">{PRIVACY_TEXT}</p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
