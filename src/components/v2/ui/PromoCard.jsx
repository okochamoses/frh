import { cn } from "@/lib/utils";
import Button from "./Button";

export default function PromoCard({
  title,
  body,
  ctaLabel,
  onCta,
  tone = "latte",
  icon,
  className,
}) {
  const dark = tone === "deep";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-v2-3xl p-8",
        dark ? "bg-deep text-white" : "bg-latte text-ink",
        className
      )}
    >
      {icon && <div className="mb-4 text-slat">{icon}</div>}
      <h3 className="font-display text-v2-h2">{title}</h3>
      {body && (
        <p className={cn("mt-3 max-w-[38ch] text-v2-body", dark ? "text-white/70" : "text-ink-soft")}>
          {body}
        </p>
      )}
      {ctaLabel && (
        <Button
          withArrow
          onClick={onCta}
          className={cn("mt-6", dark && "bg-white text-deep hover:bg-white/90")}
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
