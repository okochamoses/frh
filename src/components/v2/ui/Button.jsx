"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-deep text-white hover:bg-deep/90 h-12 px-6 rounded-full text-sm font-semibold",
  // Mustard is reserved for booking actions — the one bright colour on the
  // page, so "Book" is findable everywhere. Always ink text: white on mustard
  // is 1.7:1.
  book:
    "bg-mustard text-ink hover:bg-mustard-deep h-12 px-6 rounded-full text-sm font-semibold",
  secondary:
    "bg-transparent border border-ink text-ink hover:bg-ink/5 h-12 px-6 rounded-full text-sm font-semibold",
  tertiary:
    "bg-transparent text-ink hover:text-ink/70 h-auto p-0 text-sm font-semibold",
  icon: "h-11 w-11 rounded-full bg-latte text-ink hover:bg-latte/70 p-0",
};

/**
 * Renders a <button> by default, or a next/link anchor when `href` is given.
 */
const Button = forwardRef(function Button(
  {
    variant = "primary",
    loading = false,
    disabled = false,
    withArrow = false,
    href,
    className,
    children,
    ...props
  },
  ref
) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 transition-colors duration-200 ease-out",
    "disabled:opacity-50 disabled:pointer-events-none",
    VARIANTS[variant],
    className
  );

  const content = (
    <>
      {loading && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
      {children}
      {withArrow && !loading && <ArrowRight aria-hidden className="h-4 w-4" />}
    </>
  );

  if (href) {
    return (
      <Link
        ref={ref}
        href={href}
        aria-disabled={disabled || undefined}
        className={cn(classes, disabled && "pointer-events-none opacity-50")}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
