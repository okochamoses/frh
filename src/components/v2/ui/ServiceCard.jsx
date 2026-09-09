"use client";

import { cn } from "@/lib/utils";
import Checkbox from "./Checkbox";

export default function ServiceCard({
  name,
  description,
  price,
  icon,
  selected = false,
  disabled = false,
  onChange,
  className,
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-v2-xl border p-4 transition-colors duration-200 ease-out",
        selected ? "border-latte bg-latte/40" : "border-transparent bg-cream-100",
        !disabled && "hover:border-latte",
        disabled && "opacity-50",
        className
      )}
    >
      <Checkbox
        checked={selected}
        disabled={disabled}
        onChange={onChange}
        aria-label={name}
        className="mt-0.5"
      />
      {icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-v2-md bg-latte text-gold">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3
            className={cn(
              "text-v2-h3 text-ink",
              selected ? "font-semibold" : "font-medium"
            )}
          >
            {name}
          </h3>
          <span className="shrink-0 text-v2-body-sm font-semibold text-ink">
            {price}
          </span>
        </div>
        {description && (
          <p className="mt-1 text-v2-body-sm text-ink-soft">{description}</p>
        )}
      </div>
    </div>
  );
}
