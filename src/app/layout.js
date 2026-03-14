import "./globals.css";
import localFont from 'next/font/local'
import Root from "@/app/structure";

export const Bagelan = localFont({
    src: './Bagelan.otf',
    display: 'swap',
})

export const figtree = localFont({
  src: './figtree.ttf',
  display: 'swap',
})

export const merriweather = localFont({
  src: './merriweather.otf',
  display: 'swap',
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
      <link rel="preload" as="image" href="/hero-bg.webp" />
      <link rel="preconnect" href="https://accounts.google.com" />
      <link rel="preconnect" href="https://www.google.com" />
      <style dangerouslySetInnerHTML={{ __html: `
        body{margin:0;min-height:100vh}
        #hero{display:flex;justify-content:center;align-items:flex-end;width:100%;height:100vh;background-size:cover;background-position:center;background-repeat:no-repeat}
        header.fixed{position:fixed;top:0;left:0;right:0;width:100%;display:flex;z-index:50}
      ` }} />
    </head>
      <body
        className={`${figtree.variable} antialiased`}
      >
        <Root>
          {children}
        </Root>
      </body>
    </html>
  );
}
