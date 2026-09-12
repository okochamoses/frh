"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import Reveal from "@/components/v2/ui/Reveal";

/* Exactly the three things the guide was already described as covering — the
   list is a re-setting of that sentence, not a new promise about the contents. */
const CONTAINS = [
  "Wash days",
  "Night care",
  "How long a protective style should really stay in",
];

/**
 * The page's lowest-commitment way in: an email address for the routine we hand
 * our own clients.
 *
 * A full-bleed band in the brand's single accent, split in two: the pitch on
 * the left with the three things the guide covers, and the form on the right.
 *
 * The form is one row — an underlined field with the submit as a circle sitting
 * in its right end — rather than a stacked input-then-button pair. A single
 * line reads as a single ask, which is what it is, and it keeps the card from
 * competing with the display type beside it. No photograph: the band's colour
 * already separates this section from the page, and an image here only pushed
 * the one control that matters to the bottom of a tall box.
 */
export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setError("");
    try {
      /*
       * Imported here rather than at the top of the file. The service pulls in
       * firebase/firestore and the app init — about 145kB — and this section
       * sits at the bottom of /v2, /v2/about, /v2/journal and /v2/shop, where
       * most visitors never touch the form. Loading it on submit keeps that
       * weight off every one of those pages.
       */
      const { subscribe } = await import("@/lib/firebase/newsletterService");
      await subscribe(email);
      setStatus("done");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-gold px-4 py-20 text-ink md:px-8 md:py-28 lg:py-32"
    >
      <div className="mx-auto grid max-w-[calc(var(--v2-container)-4rem)] gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="type-eyebrow !text-ink/60">Free, by email</p>
            <h2
              id="newsletter-heading"
              className="mt-5 max-w-[13ch] font-display text-display-fluid uppercase leading-[0.95] text-ink"
            >
              The free 4C hair guide
            </h2>
            <p className="mt-7 max-w-[42ch] text-v2-body text-ink/75 md:text-[1.125rem] md:leading-[1.55]">
              The routine we hand our own clients, written for Lagos weather and
              products you can actually find.
            </p>
          </Reveal>

          {/* What is actually in it — the reason to type an address, kept
              beside the field while typing it. */}
          <Reveal delay={120}>
            <h3 className="type-eyebrow mt-10 !text-ink/60">Inside the guide</h3>
            <ul className="mt-4 border-t border-ink/15">
              {CONTAINS.map((item, i) => (
                <li
                  key={item}
                  className="flex items-baseline gap-5 border-b border-ink/15 py-4"
                >
                  <span className="type-eyebrow tabular-nums !text-ink/55">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-v2-h3 uppercase leading-[1.15] text-ink">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={180} className="lg:col-span-5 lg:col-start-8">
          <div className="rounded-v2-4xl bg-white p-7 md:p-10">
            {status === "done" ? (
              <div role="status" className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                  <Check aria-hidden className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-display text-v2-h3 uppercase leading-[1.1] text-ink">
                    Check your inbox
                  </span>
                  <span className="mt-1 block text-v2-body text-ink-soft">
                    The guide is on its way.
                  </span>
                </span>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <label htmlFor="v2-newsletter-email" className="type-eyebrow">
                  Your email address
                </label>

                {/* The field and its submit share one underline, so the row
                    reads as a single control. `pr-16` keeps typed text clear of
                    the circle; the circle itself stays a 44px target. */}
                <div className="relative mt-4">
                  <input
                    id="v2-newsletter-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={status === "error" || undefined}
                    aria-describedby={error ? "v2-newsletter-error" : undefined}
                    className="h-14 w-full border-b border-ink/25 bg-transparent pr-16 text-[1.125rem] text-ink transition-colors duration-200 ease-out placeholder:text-ink/35 hover:border-ink/50 focus:border-ink focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    aria-label="Send me the guide"
                    className="absolute bottom-[0.375rem] right-0 flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition-colors duration-200 ease-out hover:bg-ink/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {error && (
                  <p
                    id="v2-newsletter-error"
                    role="alert"
                    className="mt-3 text-v2-body-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                {/* States what happens to the address, which we know, rather
                    than a sending-frequency or unsubscribe promise, which is
                    still unsettled. See the TODO below. */}
                <p className="mt-5 text-v2-body-sm text-ink-soft">
                  We&apos;ll email the guide to this address.
                </p>
              </form>
            )}
          </div>
        </Reveal>

        {/* TODO: a one-line reassurance about sending frequency and
            unsubscribing belongs under the field, once the list's actual
            policy is settled. Left out rather than guessed at — an invented
            promise is worse than none on the one control asking for a
            reader's data. */}
      </div>
    </section>
  );
}
