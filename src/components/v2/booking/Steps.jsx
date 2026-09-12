"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, ChevronUp, Clock, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOOK_BY_ID } from "@/lib/booking/catalogue";
import {
  addDays,
  formatDuration,
  fromInstant,
  fromMinutes,
  longDate,
  naira,
  shortDate,
  toMinutes,
} from "@/lib/booking/schedule";
import {
  SALON_ADDRESS,
  SALON_MAPS_URL,
  googleCalendarUrl,
  icsDataUrl,
  whatsappUrl,
} from "@/lib/booking/calendarLinks";
import ServicePhoto from "./ServicePhoto";
import { CHECK_ICON, HEADING, PillButton, useV2PortalContainer } from "./ui";

const STEP_LABELS = ["Services", "Time", "Details", "Confirm"];

export function Stepper({ step, onGo, locked }) {
  return (
    <nav aria-label="Booking steps" className="mb-4 md:mb-7">
      <ol className="flex gap-1.5">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const current = n === step;
          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                disabled={!done || locked}
                onClick={() => onGo(n)}
                aria-current={current ? "step" : undefined}
                className="grid w-full gap-2 text-left disabled:cursor-default"
              >
                <span className={cn("h-1 rounded", done || current ? "bg-ink" : "bg-latte")} />
                <span className={cn("text-xs font-semibold", done || current ? "text-ink" : "text-ash")}>
                  <b className="mr-1.5 tabular-nums">{n}</b>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function initials(user) {
  const a = (user?.firstName ?? "").trim().charAt(0);
  const b = (user?.lastName ?? "").trim().charAt(0);
  return (a + b || (user?.email ?? "?").charAt(0)).toUpperCase();
}

function Field({ id, label, optional, required, hint, error, ...input }) {
  // The hint/error <p> only renders when there's an error or a hint, so
  // aria-describedby must not point at it otherwise — a dangling reference
  // to nothing. The error case still needs to describe the field once it
  // appears.
  const describedBy = error || hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold">
        {label}
        {optional && <span className="font-medium text-ink-soft"> (optional)</span>}
        {required && <span className="font-medium text-ink-soft"> (required)</span>}
      </label>
      <input
        id={id}
        required={required || undefined}
        aria-required={required ? "true" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-full rounded-v2-lg border bg-cream-100 px-3.5 text-sm font-medium text-ink outline-none focus:border-ink",
          error ? "border-red-600" : "border-latte"
        )}
        {...input}
      />
      {error ? (
        <p id={`${id}-hint`} role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * The one thing a client knows that the service list cannot say.
 *
 * The FAQ sends people here by name — "tell us when you book so we plan the
 * gentler approach" for relaxed or transitioning hair, "mention it in your
 * booking notes" for a child's hair — so the examples below are the FAQ's own,
 * and the field sits on the same step for a guest and an account holder alike.
 */
function NotesField({ value, onChange, max }) {
  const left = max - value.length;
  return (
    <div>
      <label htmlFor="booking-notes" className="mb-1.5 block text-xs font-semibold">
        Anything we should know?
        <span className="font-medium text-ink-soft"> (optional)</span>
      </label>
      <textarea
        id="booking-notes"
        rows={3}
        maxLength={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby="booking-notes-hint"
        placeholder="Relaxed or transitioning hair, a child coming in, extensions you're bringing…"
        className="w-full resize-y rounded-v2-lg border border-latte bg-cream-100 px-3.5 py-3 text-sm font-medium leading-relaxed text-ink outline-none placeholder:text-ink-soft focus:border-ink"
      />
      <p id="booking-notes-hint" className="mt-1.5 flex justify-between gap-4 text-xs text-ink-soft">
        <span>It reaches your stylist before the day, so the right amount of time is set aside.</span>
        {/* Only once it is close enough to matter — a counter from zero reads as a limit to fill. */}
        {left <= 80 && <span className="shrink-0 tabular-nums">{left}</span>}
      </p>
    </div>
  );
}

/**
 * Who is coming in.
 *
 * No account is needed: a guest gives a name and a phone number (email is
 * optional, for the confirmation). Clients who already have an account can
 * sign in instead and skip the form. Either way they can leave a note.
 */
export function DetailsStep({
  hydrated,
  user,
  phone,
  onPhone,
  phoneError,
  guest,
  onGuest,
  guestErrors,
  onSignIn,
  notes,
  onNotes,
  maxNotes,
}) {
  if (!hydrated) {
    return <p className="rounded-v2-xl bg-cream-100 p-6 text-sm text-ink-soft">Checking your account…</p>;
  }

  if (!user) {
    return (
      <div className="grid gap-5">
        <p className="max-w-[56ch] text-[15px] leading-relaxed text-ink-soft">
          No account needed. Tell us who&apos;s coming and how to reach you. The salon confirms by phone or WhatsApp.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="guest-name"
            label="Your name"
            required
            autoComplete="given-name"
            value={guest.firstName}
            onChange={(e) => onGuest({ firstName: e.target.value })}
            placeholder="Chioma"
            error={guestErrors.firstName}
          />
          <Field
            id="guest-phone"
            label="Phone number"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={guest.phone}
            onChange={(e) => onGuest({ phone: e.target.value })}
            placeholder="08031234567"
            hint="For calls or WhatsApp about this booking only."
            error={guestErrors.phone}
          />
          <div className="sm:col-span-2">
            <Field
              id="guest-email"
              label="Email"
              optional
              type="email"
              inputMode="email"
              autoComplete="email"
              value={guest.email}
              onChange={(e) => onGuest({ email: e.target.value })}
              placeholder="you@example.com"
              hint="Add it if you'd like your confirmation by email."
              error={guestErrors.email}
            />
          </div>
          <div className="sm:col-span-2">
            <NotesField value={notes} onChange={onNotes} max={maxNotes} />
          </div>
        </div>
        <p className="text-sm text-ink-soft">
          Booked with us before?{" "}
          <button
            type="button"
            onClick={() => onSignIn("signin")}
            className="font-semibold text-ink underline underline-offset-4"
          >
            Sign in
          </button>{" "}
          to use your saved details.
        </p>
      </div>
    );
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3.5 rounded-v2-xl bg-cream-100 p-4">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-bold text-white"
        >
          {initials(user)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-body text-[15px] font-bold text-ink">{name}</p>
          <p className="truncate font-body text-[13px] text-ink-soft">
            {user.email}
            {user.mobileNumber ? ` · ${user.mobileNumber}` : ""}
          </p>
        </div>
      </div>

      {!user.mobileNumber && (
        <div className="max-w-sm">
          <Field
            id="booking-phone"
            label="Mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => onPhone(e.target.value)}
            placeholder="08031234567"
            hint="The salon uses it only to reach you about this booking. It's saved to your profile."
            error={phoneError}
          />
        </div>
      )}

      <NotesField value={notes} onChange={onNotes} max={maxNotes} />

      <p className="text-sm text-ink-soft">
        We&apos;ll send your confirmation to <b className="text-ink">{user.email}</b>.
      </p>
    </div>
  );
}

export function ReviewStep({ options, date, time, duration, total, contact, notes, policy, onPolicy, error, onChangeTime, onChangeDetails }) {
  const end = fromMinutes(toMinutes(time) + duration);
  const rows = [
    ["When", `${longDate(date)}, ${time}–${end}`],
    ["Where", SALON_ADDRESS],
    ["Who", [contact.name, contact.phone].filter(Boolean).join(" · ") || "—"],
    ["Services", options.map((o) => o.name).join(", ")],
    ["Pay", `${naira(total)} at the salon`],
  ];
  const note = notes.trim();

  return (
    <div className="grid gap-4">
      <dl className="grid gap-0.5 overflow-hidden rounded-v2-xl">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 bg-cream-100 px-4 py-3.5 text-sm">
            <dt className="shrink-0 text-ink-soft">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      {/* A note runs to sentences, so it gets its own block rather than a row
          in the table, where it would be right-aligned against a short label. */}
      {note && (
        <div className="rounded-v2-xl bg-cream-100 px-4 py-3.5 text-sm">
          <div className="flex justify-between gap-4">
            <p className="text-ink-soft">Your note</p>
            <button
              type="button"
              onClick={onChangeDetails}
              className="shrink-0 text-[13px] font-semibold text-ink underline underline-offset-4"
            >
              Change
            </button>
          </div>
          <p className="mt-1.5 whitespace-pre-line leading-relaxed">{note}</p>
        </div>
      )}

      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-v2-xl border p-4 text-sm leading-relaxed transition-colors",
          policy ? "border-ink" : "border-latte"
        )}
      >
        <span className="relative mt-0.5 h-[22px] w-[22px] shrink-0">
          <input
            type="checkbox"
            checked={policy}
            onChange={(e) => onPolicy(e.target.checked)}
            className="peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-[7px] border-[1.5px] border-ash bg-white checked:border-ink checked:bg-ink"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100"
          >
            {CHECK_ICON}
          </span>
        </span>
        <span>
          I&apos;ll arrive by {time} for my appointment.
        </span>
      </label>

      {error && (
        <div role="alert" className="rounded-v2-xl bg-red-50 p-4 text-sm text-red-800">
          <p>{error}</p>
          <button type="button" onClick={onChangeTime} className="mt-2 font-semibold underline underline-offset-4">
            Pick another time
          </button>
        </div>
      )}

      <p className="text-[13px] text-ink-soft">
        Plans change. You can move or cancel from My bookings any time before your appointment.
      </p>
    </div>
  );
}

export function SuccessView({ result, options, contact, onAgain }) {
  const start = fromInstant(result.startTime);
  const end = fromInstant(result.endTime);
  const duration = options.reduce((sum, o) => sum + o.duration, 0);
  const names = options.map((o) => o.name).join(", ");
  const event = {
    id: result.bookingId,
    title: `Flourish Roots: ${names}`,
    details: `${names}\nBooking reference: ${result.bookingId}`,
    startTime: result.startTime,
    endTime: result.endTime,
  };
  const cadences = options.map((o) => o.rebookAfterDays).filter(Number.isFinite);
  const nextDue = cadences.length ? addDays(start.key, Math.min(...cadences)) : null;

  return (
    <div className="grid gap-5">
      <div>
        <p className="type-eyebrow">Booked</p>
        <h2 className={cn(HEADING, "mt-2 text-[clamp(2.5rem,4.6vw,3.75rem)]")}>See you {longDate(start.key).split(" ")[0]}</h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          {contact.email ? (
            <>
              We&apos;ve sent your confirmation to <b className="text-ink">{contact.email}</b>.
            </>
          ) : (
            <>
              The salon will confirm with you on <b className="text-ink">{contact.phone}</b>.
            </>
          )}{" "}
          Reference <span className="font-mono text-ink">{result.bookingId}</span>.
        </p>
      </div>

      <div className="grid gap-3 rounded-v2-2xl border border-latte p-5 text-[15px]">
        <p className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
          {longDate(start.key)}
        </p>
        <p className="flex items-center gap-3">
          <Clock className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
          <span>
            {start.time}–{end.time} <span className="text-ink-soft">({formatDuration(duration)})</span>
          </span>
        </p>
        <p className="flex items-center gap-3">
          <MapPin className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
          {SALON_ADDRESS}
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-full bg-cream-100 px-3.5 text-[13px] font-semibold hover:bg-latte"
          >
            Add to Google Calendar
          </a>
          <a
            href={icsDataUrl(event)}
            download="flourish-roots-appointment.ics"
            className="inline-flex h-9 items-center rounded-full bg-cream-100 px-3.5 text-[13px] font-semibold hover:bg-latte"
          >
            Apple / Outlook (.ics)
          </a>
          <a
            href={SALON_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-full bg-cream-100 px-3.5 text-[13px] font-semibold hover:bg-latte"
          >
            Directions
          </a>
        </div>
      </div>

      {result.notes && (
        <div className="rounded-v2-2xl bg-cream-100 px-5 py-4 text-sm">
          <span className="type-eyebrow">Passed to your stylist</span>
          <p className="mt-1.5 whitespace-pre-line leading-relaxed">{result.notes}</p>
        </div>
      )}

      {nextDue && (
        <div className="grid gap-1 rounded-v2-2xl bg-gold/40 px-5 py-4 text-sm">
          <span className="type-eyebrow">What happens next</span>
          <b className="text-[15px]">You&apos;ll usually be due again around {shortDate(nextDue)}.</b>
          <span className="text-ink-soft">
            Come back to this page then and we&apos;ll offer to book the same thing at the same time, in one tap.
          </span>
        </div>
      )}

      {/* A guest has no account to sign back into, so their way back to this
          booking is the signed link — the same one their confirmation email
          carries, shown here because a guest may not have given an email. */}
      {contact.guest && result.manageUrl && (
        <div className="grid gap-2 rounded-v2-2xl border border-latte p-5 text-sm">
          <b className="text-[15px]">Need to move or cancel it?</b>
          <p className="text-ink-soft">
            {contact.email
              ? "Use the link in your confirmation email, or this one — same booking, no password."
              : "This link opens your booking again. Bookmark it, or send it to yourself — it's the only way back to this appointment without calling the salon."}
          </p>
          <a
            href={result.manageUrl}
            className="mt-1 justify-self-start break-all text-[13px] font-semibold text-ink underline underline-offset-4"
          >
            Open my booking
          </a>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {contact.guest ? (
          <a
            href={whatsappUrl(`Hi! I'd like to change my booking (reference ${result.bookingId}).`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center rounded-full border border-ink px-6 text-sm font-semibold hover:bg-ink/5"
          >
            Ask the salon on WhatsApp
          </a>
        ) : (
          <a
            href="/bookings"
            className="inline-flex h-12 items-center rounded-full border border-ink px-6 text-sm font-semibold hover:bg-ink/5"
          >
            Manage my bookings
          </a>
        )}
        <PillButton variant="quiet" onClick={onAgain}>
          Book something else
        </PillButton>
      </div>
    </div>
  );
}

function SlipBody({ options, date, time, duration, total, onRemove, locked }) {
  return (
    <>
      <div className="px-5 pb-4 pt-5">
        <p className="type-eyebrow flex justify-between">
          <span>Appointment slip</span>
          <span className="tabular-nums">{options.length ? `${options.length} item${options.length > 1 ? "s" : ""}` : ""}</span>
        </p>
        {date && time ? (
          <p className="mt-2.5 text-lg font-bold leading-tight tracking-[-0.01em]">
            {longDate(date)}
            <span className="mt-0.5 block text-[13px] font-medium tracking-normal text-ink-soft">
              {time} – {fromMinutes(toMinutes(time) + duration)} WAT · {formatDuration(duration)}
            </span>
          </p>
        ) : (
          <p className="mt-2.5 text-[15px] font-semibold text-ash">No time picked yet</p>
        )}
      </div>

      {/* Tear-off perforation */}
      <div aria-hidden="true" className="relative h-[18px]">
        <span className="absolute -left-[9px] top-0 h-[18px] w-[18px] rounded-full bg-white" />
        <span className="absolute -right-[9px] top-0 h-[18px] w-[18px] rounded-full bg-white" />
        <span className="absolute inset-x-[18px] top-1/2 border-t-[1.5px] border-dashed border-ash" />
      </div>

      <ul className="grid min-h-12 gap-2.5 px-5 pb-1 pt-1.5">
        {options.length === 0 && <li className="text-sm text-ash">Services you pick appear here.</li>}
        {options.map((o) => {
          const look = LOOK_BY_ID.get(o.lookId);
          return (
            <li key={o.title} className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-start gap-x-3 text-sm">
              {look && <ServicePhoto look={look} className="row-span-2 h-11 w-9 rounded-v2-md text-xs" />}
              <span className="font-body leading-snug text-ink">{o.name}</span>
              <span className="row-span-2 flex items-start gap-1.5">
                <b className="tabular-nums">{naira(o.price)}</b>
                {!locked && (
                  <button
                    type="button"
                    onClick={() => onRemove(o)}
                    aria-label={`Remove ${o.name}`}
                    className="-mr-1 -mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-ink-soft hover:bg-latte hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </span>
              <span className="text-xs text-ink-soft">{formatDuration(o.duration)}</span>
            </li>
          );
        })}
      </ul>

      <div className="mx-5 mt-3.5 flex items-baseline justify-between border-t border-latte pt-3.5">
        <span className="text-[13px] text-ink-soft">Total · {formatDuration(duration)}</span>
        <b className="text-[22px] tabular-nums">{naira(total)}</b>
      </div>
    </>
  );
}

/**
 * The appointment slip: a sticky summary on desktop that carries the step's
 * main button. On phones the same summary opens from `MobileBar`.
 */
export function AppointmentSlip({ cta, hint, ...slip }) {
  return (
    <aside aria-label="Your appointment" className="sticky top-28 hidden overflow-hidden rounded-v2-3xl bg-cream-100 lg:block">
      <SlipBody {...slip} />
      <div className="grid gap-2.5 px-5 pb-5 pt-4">
        {cta}
        <p className="text-center text-xs text-ink-soft">{hint}</p>
      </div>
    </aside>
  );
}

/**
 * The phone's version of the slip: a pinned bar with the total and the main
 * button. Tapping the total opens the full slip — every service, the time and
 * a way to remove things — as a bottom sheet.
 */
export function MobileBar({ cta, sheetCta, hint, blocked, ...slip }) {
  const count = slip.options.length;
  const container = useV2PortalContainer();
  return (
    <Dialog.Root>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-latte bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <Dialog.Trigger
            disabled={count === 0}
            aria-label={count ? `View your appointment: ${count} service${count > 1 ? "s" : ""}` : "Nothing picked yet"}
            className="-my-1 flex min-w-0 flex-1 items-center gap-2 rounded-v2-lg py-1 text-left disabled:cursor-default"
          >
            <span className="min-w-0 flex-1">
              {/*
                Two changes from a bold ₦0 over "Nothing picked yet".
                A ₦0 spent the most prominent half of a permanent bar restating
                that nothing had happened, so the total only appears once there
                is one. And when the button is disabled this row now carries the
                reason: the desktop slip prints `hint` under its button, but on
                a phone that text lived inside the sheet, so the CTA greyed out
                — too long an appointment, say — with nothing on screen saying
                why. Mobile is where nearly every booking starts.
              */}
              {count > 0 && <span className="block text-[15px] font-bold tabular-nums">{naira(slip.total)}</span>}
              <span
                className={cn(
                  "block truncate",
                  count ? "text-xs" : "text-[13px] font-semibold",
                  blocked ? "text-ink" : "text-ink-soft"
                )}
              >
                {blocked
                  ? hint
                  : `${count} service${count > 1 ? "s" : ""} · ${formatDuration(slip.duration)}`}
              </span>
            </span>
            {count > 0 && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-100">
                <ChevronUp className="h-4 w-4" aria-hidden />
              </span>
            )}
          </Dialog.Trigger>
          <div className="shrink-0">{cta}</div>
        </div>
      </div>

      <Dialog.Portal container={container}>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-obsidian/55 lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-[71] max-h-[85dvh] overflow-y-auto rounded-t-[28px] bg-cream-100 pb-[max(env(safe-area-inset-bottom),16px)] outline-none lg:hidden"
        >
          <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-latte" aria-hidden="true" />
          <Dialog.Title className="sr-only">Your appointment</Dialog.Title>
          {/* No corner X: it collided with the item count, and "Keep browsing",
              the backdrop and Escape all close the sheet already. */}
          <SlipBody {...slip} />
          <div className="grid gap-2 px-5 pt-4">
            {/* Closing the sheet as the step moves on, so the next step isn't hidden behind it. */}
            <Dialog.Close asChild>{sheetCta}</Dialog.Close>
            <p className="text-center text-xs text-ink-soft">{hint}</p>
            <Dialog.Close className="justify-self-center py-1 text-[13px] font-semibold text-ink underline underline-offset-4">
              Keep browsing
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
