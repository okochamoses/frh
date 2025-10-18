"use client"

import {Figtree, Merriweather} from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local'
import Footer from "../components/footer";
import {Header} from "@/components/header";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {AuthProvider} from "@/app/contexts/AuthContext";

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
        <GoogleOAuthProvider clientId={"423725763850-g9h03ff01rrmu7akn9ks5hl0a13nmajs.apps.googleusercontent.com"}>
          <AuthProvider>
          <Header />
          {children}
          <Footer />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
