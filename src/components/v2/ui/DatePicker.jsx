"use client";

import { cn } from "@/lib/utils";

/** `dates`: [{ key, weekday, day, disabled }] */
export default function DatePicker({ dates = [], value, onSelect, className }) {
  return (
    <div className={cn("flex gap-3", className)} role="group" aria-label="Select a date">
      {dates.map((d) => {
        const selected = d.key === value;
        return (
          <button
            key={d.key}
            type="button"
            aria-pressed={selected}
            disabled={d.disabled}
            onClick={() => onSelect?.(d.key)}
            className={cn(
              "flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-v2-lg",
              "transition-colors duration-200 ease-out",
              selected ? "bg-deep text-white" : "bg-cream-100 text-ink hover:bg-latte",
              d.disabled && "opacity-40 pointer-events-none"
            )}
          >
            <span
              className={cn(
                "text-v2-label",
                selected ? "text-white/70" : "text-ink-soft"
              )}
            >
              {d.weekday}
            </span>
            <span className="text-v2-h3 font-semibold">{d.day}</span>
          </button>
        );
      })}
    </div>
  );
}
