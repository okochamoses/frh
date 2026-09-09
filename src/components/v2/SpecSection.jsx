import { cn } from "@/lib/utils";

/** Section shell used across the design-system reference page. */
export function SpecSection({ title, className, children }) {
  return (
    <section className={cn("flex flex-col gap-6", className)}>
      <h2 className="text-v2-label font-semibold uppercase tracking-[0.14em] text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SpecLabel({ children }) {
  return <p className="text-v2-body-sm text-ink-soft">{children}</p>;
}

export function Swatch({ name, hex, className }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className={cn("h-20 w-20 rounded-full border border-latte", className)}
        style={{ backgroundColor: hex }}
      />
      <div>
        <p className="text-v2-body-sm font-medium text-ink">{name}</p>
        <p className="text-v2-label text-ink-soft">{hex}</p>
      </div>
    </div>
  );
}
