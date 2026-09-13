import localFont from 'next/font/local'

/*
 * V1 display faces. They are declared in the root layout, so Next preloads
 * them on *every* route unless told otherwise — including the V2 pages, which
 * use their own type set (see `app/v2/fonts.js`) and never render a glyph in
 * either face. That was 207 KB of font downloaded on the V2 homepage competing
 * with the hero image for bandwidth.
 *
 * `preload: false` keeps the @font-face rules and drops only the preload hint:
 * the V1 pages that do use these fetch them when the text is laid out, and
 * `display: 'swap'` means nothing is invisible while that happens.
 */
export const Bagelan = localFont({
    src: './Bagelan.otf',
    display: 'swap',
    preload: false,
})

export const merriweather = localFont({
  src: './merriweather.otf',
  display: 'swap',
  preload: false,
})
