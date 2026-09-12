import "./globals.css";
import localFont from 'next/font/local'
import Root from "@/app/structure";
import Analytics from "@/components/Analytics";

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

const metadata = {
  title: "Flourish Roots Hair",
  description: "Promoting Healthier Hair",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <head>
      <title>Flourish Roots Hair</title>
      <meta name="description" content="Promoting Healthier Hair" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="preconnect" href="https://accounts.google.com" />
      <link rel="preconnect" href="https://www.google.com" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{margin:0;min-height:100vh}
        #hero{display:flex;justify-content:center;align-items:flex-end;width:100%;height:100vh;background-size:cover;background-position:center;background-repeat:no-repeat}
        header.fixed{position:fixed;top:0;left:0;right:0;width:100%;display:flex;z-index:50}
      ` }} />
    </head>
      <body className="antialiased">
        <Root>
          {children}
        </Root>
        <Analytics />
      </body>
    </html>
  );
}
