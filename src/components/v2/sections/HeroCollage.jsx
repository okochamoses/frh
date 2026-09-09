import Image from "next/image";

/**
 * The collage straddles the hero's bottom edge: part of it sits on the hero
 * gradient, the rest hangs onto the page background below.
 *
 * The image is a fixed 1827:861 strip, so its height is 47.1% of its width.
 * At 130vw wide that makes it 61.2vw tall, and the negative margin below is
 * "how much of that height is pulled up onto the hero":
 *
 *   mobile  -32vw  → ~52% inside the hero, ~48% hanging below
 *   desktop -40vw  → ~65% inside the hero, ~35% hanging below
 *
 * Mobile overlaps harder because the strip is short there and a shallow
 * overlap reads as a misaligned seam rather than a deliberate one.
 */
export default function HeroCollage() {
  return (
    <section
      aria-label="Work from the salon floor"
      className="relative z-10 left-1/2 right-1/2 -mx-[50vw] mt-[calc(var(--collage-inset)*-1)] w-screen overflow-hidden"
    >
      <div
        className="relative left-1/2 w-[110vw] -translate-x-1/2"
        style={{ aspectRatio: "1827/861" }}
      >
        <Image
          src="/intro-image.webp"
          alt="Twists, threading and finished styles from the Flourish Roots salon floor in Isolo, Lagos"
          fill
          sizes="130vw"
          priority
          className="object-cover saturate-[.99]"
        />
      </div>
    </section>
  );
}
