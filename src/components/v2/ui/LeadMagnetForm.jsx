"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Button from "@/components/v2/ui/Button";

const ENDPOINT =
  "https://us-central1-flourish-roots.cloudfunctions.net/leadMagnet";

/**
 * The guide sign-up, posting to the same `leadMagnet` function the v1 page
 * uses — this is a re-skin of a working form, not a second one.
 *
 * First name is optional and says so: an optional field that looks required is
 * the commonest reason a one-field form becomes a two-field drop-off. The
 * success state replaces the form rather than sitting above it, so nobody
 * submits twice wondering whether it worked.
 */
export default function LeadMagnetForm({ tone = "light" }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  const dark = tone === "dark";

  async function onSubmit(event) {
    event.preventDefault();
    if (status === "loading" || !email.trim()) return;

    setStatus("loading");
    setError("");
    try {
      const res = await fetch(ENDPOINT, {
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
        setError(data.error || "That did not go through. Try again?");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setError("That did not go through. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <div
        className={`flex items-start gap-4 rounded-v2-2xl p-6 ${
          dark ? "bg-white/10 text-white" : "bg-cream-100 text-ink"
        }`}
        role="status"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mustard text-ink"
        >
          <Check className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-v2-h3 uppercase leading-none">
            Check your inbox
          </p>
          <p
            className={`mt-2 text-v2-body-sm ${
              dark ? "text-white/70" : "text-ink-soft"
            }`}
          >
            The guide is on its way. If it is not there in a few minutes, look
            in your promotions or spam folder — it sometimes lands there first.
          </p>
        </div>
      </div>
    );
  }

  const fieldClass = `h-12 w-full rounded-full border px-5 text-v2-body outline-none transition-colors duration-200 ease-out ${
    dark
      ? "border-white/25 bg-white/10 text-white placeholder:text-white/40 focus:border-white"
      : "border-ink/20 bg-white text-ink placeholder:text-ash focus:border-ink"
  }`;
  const labelClass = `type-eyebrow ${dark ? "!text-white/55" : ""}`;

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <label htmlFor="lead-first-name" className={labelClass}>
          First name <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="lead-first-name"
          name="firstName"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="So we know who we are writing to"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="lead-email" className={labelClass}>
          Email address
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-describedby={error ? "lead-error" : undefined}
          aria-invalid={status === "error" || undefined}
          className={fieldClass}
        />
      </div>

      {error && (
        <p
          id="lead-error"
          role="alert"
          className={`text-v2-body-sm ${dark ? "text-mustard" : "text-slat-ink"}`}
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="book"
        withArrow
        loading={status === "loading"}
        className="mt-1 w-full"
      >
        {status === "loading" ? "Sending" : "Send me the guide"}
      </Button>

      <p className={`text-v2-body-sm ${dark ? "text-white/50" : "text-ash"}`}>
        One email with the guide, then the occasional note from the salon.
        Unsubscribe in one click, any time.
      </p>
    </form>
  );
}
