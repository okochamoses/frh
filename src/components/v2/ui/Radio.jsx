"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export default function Radio({ label, className, id: idProp, ...props }) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <label htmlFor={id} className={cn("inline-flex items-center gap-3", className)}>
      <span className="relative inline-flex h-5 w-5 shrink-0">
        <input
          id={id}
          type="radio"
          className="peer h-5 w-5 appearance-none rounded-full border border-ink-soft/50 bg-white transition-colors duration-150 ease-out checked:border-deep disabled:opacity-50"
          {...props}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-deep opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label && <span className="text-v2-body text-ink">{label}</span>}
    </label>
  );
}
