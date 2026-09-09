"use client";

import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = forwardRef(function Select(
  { label, error, className, children, id: idProp, ...props },
  ref
) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className="text-v2-label font-semibold uppercase tracking-wider text-ink-soft"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            "h-12 w-full appearance-none rounded-v2-lg border border-latte bg-cream-100 px-4 pr-10",
            "text-v2-body text-ink transition-colors duration-200 ease-out",
            "focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/30",
            error && "border-red-700",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
        />
      </div>
    </div>
  );
});

export default Select;
