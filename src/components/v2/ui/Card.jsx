import { cn } from "@/lib/utils";

const TONES = {
  cream: "bg-cream-100",
  latte: "bg-latte",
  deep: "bg-deep text-white",
  white: "bg-white",
};

export default function Card({
  tone = "cream",
  feature = false,
  elevated = false,
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        feature ? "rounded-v2-3xl p-8" : "rounded-v2-xl p-6",
        TONES[tone],
        elevated && "border border-latte",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
