"use client";

import { cn } from "@/lib/utils";

export default function TimeSlot({ time, selected = false, disabled = false, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "h-11 min-w-[104px] rounded-full px-4 text-v2-body-sm font-medium",
        "transition-colors duration-200 ease-out",
        selected ? "bg-deep text-white" : "bg-cream-100 text-ink hover:bg-latte",
        disabled && "opacity-40 pointer-events-none"
      )}
      {...props}
    >
      {time}
    </button>
  );
}
