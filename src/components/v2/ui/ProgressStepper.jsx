import { cn } from "@/lib/utils";

/** `steps`: string[] — `current` is 1-indexed. */
export default function ProgressStepper({ steps = [], current = 1, className }) {
  return (
    <ol className={cn("flex items-start", className)}>
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n <= current;
        return (
          <li key={label} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-20 flex-col items-center gap-2 text-center">
              <span
                aria-current={n === current ? "step" : undefined}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-v2-body-sm font-semibold",
                  active
                    ? "bg-deep text-white"
                    : "border border-latte bg-transparent text-ink-soft"
                )}
              >
                {n}
              </span>
              <span className="text-v2-body-sm leading-tight text-ink-soft">
                {label}
              </span>
            </div>
            {n < steps.length && (
              <span aria-hidden className="mt-[18px] h-px flex-1 bg-latte" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
