import localFont from "next/font/local";
import { Barlow, Barlow_Condensed, Manrope } from "next/font/google";

/* Type set for V2.
 *
 * Icarus Nocturne is the brand display serif from the specimen sheet, shipped
 * locally as a single regular weight. It is a headline face only — no italic,
 * no bold, and its hairlines vanish below ~28px, so it never carries body copy
 * or UI labels.
 *
 * Manrope stays the UI face — buttons, labels, nav — while Barlow (upright,
 * not the condensed cut) carries paragraph copy, applied to <p> in v2.css.
 * Barlow Condensed handles the tracked-out eyebrows, which is what the
 * specimen sheet itself uses above the character grid.
 *
 * Barlow loads 400/500/600 rather than 400 alone: some paragraphs are marked
 * `font-semibold`, and without the real cut the browser would synthesise it.
 */

export const displaySerif = localFont({
  src: "./fonts/icarus-nocturne-regular.ttf",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-serif",
});

export const eyebrow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-display",
});

export const paragraph = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-paragraph",
});

export const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
});

/** Every font variable the V2 tree needs, ready to drop on a wrapper element. */
export const fontVariables = [displaySerif, eyebrow, paragraph, body]
  .map((font) => font.variable)
  .join(" ");
