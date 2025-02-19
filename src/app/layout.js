import {Geist, Geist_Mono, Figtree, Merriweather} from "next/font/google";
import "./globals.css";
import {Header} from "@/components/header";
import localFont from 'next/font/local'

export const Bagelan = localFont({
    src: './Bagelan.otf',
    display: 'swap',
})

export const figtree = Figtree({
})

export const merriweather = Merriweather({
  subsets: ["latin"],
    weight: ["300", "400", "700", "900"]
});

const metadata = {
  title: "Flourish Roots Hair",
  description: "Promoting Healthier Natural Hair",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
