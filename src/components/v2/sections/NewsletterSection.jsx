"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { subscribe } from "@/lib/firebase/newsletterService";

/**
 * The page's lowest-commitment way in: an email address for the routine we hand
 * our own clients.
 *
 * Set as a card with the photograph bleeding to its edge, matching the coaching
 * and salon cards, so the three offers on the page share one shape and the
 * reader can tell at a glance that this is another door rather than another
 * paragraph. What the guide contains is listed as three lines rather than
 * buried in the prose, because the list is the reason to type an address.
 */
/* Exactly the three things the guide was already described as covering — the
   list is a re-setting of that sentence, not a new promise about the contents. */
const CONTAINS = [
  "Wash days",
  "Night care",
  "How long a protective style should really stay in",
];

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
      await subscribe(email);
      setStatus("done");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <section aria-labelledby="newsletter-heading">
      <div className="overflow-hidden rounded-v2-4xl bg-cream-100 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-stretch">
        <div className="p-8 md:p-12 lg:flex lg:flex-col lg:justify-center lg:p-14">
          <p className="type-eyebrow">Free, by email</p>
          <h2
            id="newsletter-heading"
            className="mt-5 max-w-[12ch] font-display text-[clamp(2rem,1.5rem+2vw,3.25rem)] uppercase leading-[0.95] text-ink"
          >
            The free 4C hair guide
          </h2>

          <p className="mt-6 max-w-[44ch] text-v2-body text-ink-soft">
            The routine we hand our own clients, written for Lagos weather and
            products you can actually find.
          </p>

          <ul className="mt-8 grid gap-3">
            {CONTAINS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 border-t border-ink/12 pt-3 text-v2-body text-ink"
              >
                <Check
                  aria-hidden
                  className="mt-1 h-4 w-4 shrink-0 text-ink-soft"
                />
                {item}
              </li>
            ))}
          </ul>

          {status === "done" ? (
            <p
              role="status"
              className="mt-10 flex items-center gap-3 text-v2-body text-ink"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-deep text-white">
                <Check aria-hidden className="h-4 w-4" />
              </span>
              Check your inbox. The guide is on its way.
            </p>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-10">
              <label htmlFor="v2-newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="flex max-w-[30rem] items-center gap-2 rounded-full border border-ink/15 bg-white p-2 pl-5 transition-colors duration-200 ease-out focus-within:border-ink">
                <input
                  id="v2-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-describedby={error ? "v2-newsletter-error" : undefined}
                  className="h-10 min-w-0 flex-1 bg-transparent text-v2-body text-ink placeholder:text-ink-soft focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  aria-label="Send me the guide"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-deep text-white transition-colors duration-200 ease-out hover:bg-deep/90 disabled:opacity-50"
                >
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
              </div>
              {error && (
                <p
                  id="v2-newsletter-error"
                  className="mt-3 text-v2-body-sm text-red-700"
                >
                  {error}
                </p>
              )}
            </form>
          )}
        </div>

        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[34rem]">
          <Image
            src="/newsletter-large.webp"
            alt="A client in cornrows reading on her phone by a sunlit window"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
