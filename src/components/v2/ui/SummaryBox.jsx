import { cn } from "@/lib/utils";

/** `items`: [{ label, price }] */
export default function SummaryBox({ items = [], total, className }) {
  return (
    <div className={cn("rounded-v2-xl border border-latte bg-white p-6", className)}>
      <dl className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between gap-4">
            <dt className="text-v2-body text-ink-soft">{item.label}</dt>
            <dd className="text-v2-body text-ink">{item.price}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-latte pt-4">
        <div className="flex justify-between gap-4">
          <span className="text-v2-h3 font-semibold text-ink">Total</span>
          <span className="text-v2-h3 font-semibold text-ink">{total}</span>
        </div>
      </div>
    </div>
  );
}
