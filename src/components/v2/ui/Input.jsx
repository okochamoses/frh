"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef(function Input(
  { label, error, className, id: idProp, ...props },
  ref
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;

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
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-12 w-full rounded-v2-lg border bg-cream-100 px-4 text-v2-body text-ink",
          "placeholder:text-ink-soft transition-colors duration-200 ease-out",
          "focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/30",
          "disabled:opacity-50",
          error ? "border-red-700" : "border-latte",
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-v2-body-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
