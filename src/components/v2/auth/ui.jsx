"use client";

/**
 * The small parts every v2 auth view shares.
 *
 * Kept apart from the forms so the modal and the standalone pages render
 * identical controls — the two surfaces differ only in what wraps them.
 */

import { cn } from "@/lib/utils";

/**
 * Form-level failure: the ones that come back from Firebase rather than from
 * looking at the fields. `role="alert"` so it is announced — the only feedback
 * for a rejected sign-in would otherwise be visual.
 */
export function FormError({ children }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      data-testid="auth-error"
      className="rounded-v2-lg bg-red-50 px-3.5 py-2.5 text-v2-body-sm text-red-700"
    >
      {children}
    </p>
  );
}

export function OrDivider({ children = "or with email" }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-latte" />
      <span className="text-v2-label font-semibold uppercase tracking-wider text-ash">
        {children}
      </span>
      <span className="h-px flex-1 bg-latte" />
    </div>
  );
}

/* Google's mark, inline: the CDN it is normally served from is a third-party
   request on a page that has none, and it has to be crisp at 18px. */
const GoogleMark = (props) => (
  <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false" {...props}>
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
    <path fill="#FBBC05" d="M3.96 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33Z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.65 3.58 9 3.58Z" />
  </svg>
);

/**
 * The Google button. White rather than the brand blue: mustard is the one
 * saturated colour v2 allows, and it belongs to booking.
 */
export function GoogleButton({ children, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-latte bg-white",
        "text-v2-body-sm font-semibold text-ink transition-colors duration-200 ease-out",
        "hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <GoogleMark className="h-[18px] w-[18px]" />
      {children}
    </button>
  );
}

/**
 * The eyebrow / headline / lede stack at the top of every view.
 *
 * `as` is how the modal hands in Radix's `Dialog.Title`: it has to own the
 * heading element to give the dialog its accessible name, and it assigns the
 * id for that itself — so nothing here may pass one. An explicit `id` is
 * spread over Radix's own and leaves the dialog nameless.
 */
export function AuthHeading({ eyebrow, title, lede, as: Title = "h1" }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="type-eyebrow">{eyebrow}</p>
      <Title className="font-display text-[clamp(1.75rem,1.5rem+1vw,2.25rem)] uppercase leading-[0.98] tracking-[-0.01em] text-ink">
        {title}
      </Title>
      {lede && (
        <p className="max-w-[38ch] text-v2-body-sm text-ink-soft">{lede}</p>
      )}
    </div>
  );
}

/**
 * Moves focus to the first field that failed validation.
 *
 * Without it a rejected submit is a purely visual event: the messages appear
 * below fields that may be off screen, focus stays on the submit button, and a
 * screen-reader user is told nothing at all. Deferred a frame so the `aria-invalid`
 * attributes this looks for have actually been rendered.
 */
export function focusFirstInvalid(formRef) {
  requestAnimationFrame(() => {
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  });
}

/** The "no account? / already have one?" line under a form. */
export function AuthSwitch({ prompt, action, onClick }) {
  return (
    <p className="text-center text-v2-body-sm text-ink-soft">
      {prompt}{" "}
      <button
        type="button"
        onClick={onClick}
        className="font-semibold text-ink underline underline-offset-4 hover:text-ink/70"
      >
        {action}
      </button>
    </p>
  );
}
