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
      {/* First tabbable on every page. The header carries the contact band, the
          logo, five nav groups and their dropdowns — 47 stops before the content
          begins — so without this a keyboard user re-tabs the whole chrome on
          every navigation. `tabIndex={-1}` on the target matters: without it the
          browser scrolls but leaves focus behind, and the next Tab returns to
          the header. */}
      <a href="#v2-main" className="v2-skip-link">
        Skip to content
      </a>
      <Header />
      <div id="v2-main" tabIndex={-1} className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
