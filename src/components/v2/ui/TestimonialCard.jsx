import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TestimonialCard({
  quote,
  name,
  rating = 5,
  portrait,
  tone = "deep",
  className,
}) {
  const dark = tone === "deep";
  return (
    <figure
      className={cn(
        "flex items-center gap-6 rounded-v2-3xl p-8",
        dark ? "bg-deep text-white" : "bg-cream-100 text-ink",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <span aria-hidden className="font-display text-v2-h2 leading-none text-gold">
          &ldquo;
        </span>
        <blockquote
          className={cn("mt-2 font-display text-v2-h3 leading-snug", dark && "text-white")}
        >
          {quote}
        </blockquote>
        <div
          className="mt-4 flex gap-1"
          aria-label={`Rated ${rating} out of 5`}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              aria-hidden
              className={cn(
                "h-4 w-4",
                i < rating ? "fill-gold text-gold" : "text-ink-soft/40"
              )}
            />
          ))}
        </div>
        <figcaption
          className={cn("mt-3 text-v2-body-sm", dark ? "text-white/70" : "text-ink-soft")}
        >
          {name}
        </figcaption>
      </div>
      {portrait && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
          <Image src={portrait} alt="" fill sizes="96px" className="object-cover" />
        </div>
      )}
    </figure>
  );
}
