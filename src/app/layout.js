import "./globals.css";
import Root from "@/app/structure";
import Analytics from "@/components/Analytics";

/*
 * Exported, and the matching tags are no longer hand-written into <head>.
 *
 * This object used to be declared without `export`, so Next never saw it,
 * while <head> carried a literal <title> and description. Any page that set
 * its own metadata therefore emitted two of each — the hardcoded pair first,
 * which is the one browsers and crawlers take. Every carefully written v2
 * title and description was being shadowed by "Flourish Roots Hair" and
 * "Promoting Healthier Hair".
 *
 * These two stay as the fallback for v1 pages, which set no metadata of their
 * own; anything that exports its own now actually wins.
 */
export const metadata = {
  title: "Flourish Roots Hair",
  description: "Promoting Healthier Hair",
};

// Next emits its own viewport tag from this, so the manual one is gone too.
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <head>
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
