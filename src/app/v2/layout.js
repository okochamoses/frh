import "./v2.css";
import Header from "@/components/v2/Header";
import Footer from "@/components/v2/Footer";
import { fontVariables } from "./fonts";

export const metadata = {
  title: "Flourish Roots Hair",
  description: "Hair that flourishes from root to tip.",
};

export default function V2Layout({ children }) {
  return (
    <div
      className={`${fontVariables} v2-root flex min-h-screen flex-col bg-sand font-body text-ink`}
    >
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
