import Image from "next/image";
import { cn } from "@/lib/utils";
import Button from "./Button";

export default function ProductCard({
  image,
  imageAlt = "",
  name,
  benefit,
  price,
  onAdd,
  className,
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-v2-xl border border-latte bg-white",
        "sm:flex sm:items-stretch",
        className
      )}
    >
      <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-40">
        <Image src={image} alt={imageAlt} fill sizes="200px" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-v2-h3 text-ink">{name}</h3>
        <p className="mt-2 text-v2-body-sm text-ink-soft">{benefit}</p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <span className="text-v2-body font-semibold text-ink">{price}</span>
          <Button variant="tertiary" withArrow onClick={onAdd}>
            Add to visit
          </Button>
        </div>
      </div>
    </article>
  );
}
