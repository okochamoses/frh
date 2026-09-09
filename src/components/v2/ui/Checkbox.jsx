"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Checkbox({ label, className, id: idProp, ...props }) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <label htmlFor={id} className={cn("inline-flex items-center gap-3", className)}>
      <span className="relative inline-flex h-5 w-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          className="peer h-5 w-5 appearance-none rounded-v2-md border border-ink-soft/50 bg-white transition-colors duration-150 ease-out checked:border-deep checked:bg-deep disabled:opacity-50"
          {...props}
        />
        <Check
          aria-hidden
          className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label && <span className="text-v2-body text-ink">{label}</span>}
    </label>
  );
}
