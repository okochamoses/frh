"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MAX_APPOINTMENT_MINUTES,
  MONTHS,
  addDays,
  dayUnavailableReason,
  firstAvailable,
  formatDuration,
  fromMinutes,
  longDate,
  monthGrid,
  parseKey,
  shortDate,
  slotsFor,
  toMinutes,
  watToday,
  weekdayOf,
  BOOKING_HORIZON_DAYS,
} from "@/lib/booking/schedule";
import { PillButton } from "./ui";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function groupSlots(slots) {
  const groups = { Morning: [], Afternoon: [], Evening: [] };
  for (const t of slots) {
    const m = toMinutes(t);
    (m < 12 * 60 ? groups.Morning : m < 16 * 60 ? groups.Afternoon : groups.Evening).push(t);
  }
  return Object.entries(groups).filter(([, list]) => list.length);
}

export default function TimeStep({ duration, now, month, onMonth, date, time, onDate, onPick, usual }) {
  const today = watToday(now);
  const { year: ty, month: tm } = parseKey(today);
  const last = parseKey(addDays(today, BOOKING_HORIZON_DAYS));
  const atStart = month.year === ty && month.month === tm;
  const atEnd = month.year === last.year && month.month === last.month;

  if (duration > MAX_APPOINTMENT_MINUTES) {
    return (
      <div role="alert" className="rounded-v2-xl bg-gold p-5 text-sm leading-relaxed">
        These services come to <b>{formatDuration(duration)}</b>, which is longer than the salon is open in a day
        (9am–7pm). Please book them as two visits: go back, remove one, and book it separately afterwards.
      </div>
    );
  }

  const earliest = firstAvailable(duration, now);
  const usualSlot = usual ?? null;
  const cells = monthGrid(month.year, month.month);
  const slots = date ? slotsFor(date, duration, now) : [];

  const step = (delta) => {
    const d = new Date(Date.UTC(month.year, month.month - 1 + delta, 1));
    onMonth({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  };

  return (
    <div className="grid gap-7 md:grid-cols-2">
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {earliest && (
            <PillButton size="sm" variant="quiet" onClick={() => onPick(earliest.key, earliest.time)}>
              Earliest: {earliest.key === today ? "today" : shortDate(earliest.key)}, {earliest.time}
            </PillButton>
          )}
          {usualSlot && (
            <PillButton size="sm" variant="quiet" onClick={() => onPick(usualSlot.key, usualSlot.time)}>
              Your usual: {shortDate(usualSlot.key)}, {usualSlot.time}
            </PillButton>
          )}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 hover:bg-latte disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <p className="text-base font-bold" aria-live="polite">
            {MONTHS[month.month - 1]} {month.year}
          </p>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 hover:bg-latte disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div role="group" aria-label="Choose a day" className="grid grid-cols-7 gap-1">
          {DOW.map((d) => (
            <div key={d} aria-hidden="true" className="pb-1.5 pt-1 text-center text-[11px] font-bold tracking-[0.04em] text-ash">
              {d}
            </div>
          ))}
          {cells.map((key, i) => {
            if (!key) return <div key={`pad-${i}`} aria-hidden="true" />;
            const reason = dayUnavailableReason(key, duration, now);
            const selected = key === date;
            const isUsual = usualSlot && weekdayOf(key) === weekdayOf(usualSlot.key) && !reason;
            return (
              <button
                key={key}
                type="button"
                disabled={!!reason}
                aria-pressed={selected}
                aria-label={reason ? `${longDate(key)}, unavailable: ${reason}` : longDate(key)}
                title={reason ?? undefined}
                onClick={() => onDate(key)}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-v2-lg text-sm font-semibold tabular-nums transition-colors",
                  reason
                    ? "cursor-not-allowed text-ash-disabled line-through"
                    : selected
                      ? "bg-ink text-white"
                      : "bg-cream-100 text-ink hover:bg-latte",
                  isUsual && !selected && "ring-[1.5px] ring-inset ring-slat"
                )}
              >
                {parseKey(key).day}
                {key === today && (
                  <span aria-hidden="true" className="absolute bottom-1.5 h-1 w-1 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-3.5 w-3.5 rounded-[5px] bg-cream-100" /> Open
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-3.5 w-3.5 rounded-[5px] bg-ink" /> Selected
          </span>
          {usualSlot && (
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-3.5 w-3.5 rounded-[5px] ring-[1.5px] ring-inset ring-slat" /> Your usual day
            </span>
          )}
          <span>
            <s className="text-ash-disabled">12</s> Closed or too short
          </span>
        </div>
      </div>

      <div>
        {!date ? (
          <div className="rounded-v2-xl bg-cream-100 p-6 text-sm leading-relaxed text-ink-soft">
            Pick a day to see times. Days with a line through them are closed or too short for{" "}
            {formatDuration(duration)}. Hover or focus one to see why.
          </div>
        ) : (
          <>
            <p className="mb-3 text-base font-bold">{longDate(date)}</p>
            <div role="group" aria-label={`Times on ${longDate(date)}`}>
              {groupSlots(slots).map(([label, list]) => (
                <div key={label}>
                  <p className="mb-2 mt-3.5 text-xs font-bold tracking-[0.02em] text-ink-soft first:mt-0">{label}</p>
                  <div className="flex flex-wrap gap-2">
                    {list.map((t) => (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={t === time}
                        onClick={() => onPick(date, t)}
                        className={cn(
                          "h-10 min-w-[78px] rounded-full px-3 text-[13px] font-semibold tabular-nums transition-colors",
                          t === time ? "bg-ink text-white" : "bg-cream-100 text-ink hover:bg-latte",
                          usualSlot && t === usualSlot.time && weekdayOf(date) === weekdayOf(usualSlot.key) && t !== time &&
                            "ring-[1.5px] ring-inset ring-slat"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {time && (
              <p className="mt-4 rounded-v2-xl bg-cream-100 px-4 py-3.5 text-sm">
                {time} to <b className="tabular-nums">{fromMinutes(toMinutes(time) + duration)}</b>. Please arrive 5
                minutes early; we hold the chair for 20.
              </p>
            )}
          </>
        )}
        <p className="mt-4 text-xs text-ink-soft">
          All times are Lagos time (WAT). Open Tuesday to Saturday 9am–7pm and Sunday 1–7pm. Closed Mondays.
        </p>
      </div>
    </div>
  );
}
