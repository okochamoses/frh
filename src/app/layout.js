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
