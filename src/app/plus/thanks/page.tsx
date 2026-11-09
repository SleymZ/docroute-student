import type { Metadata } from "next";

import { Header } from "@/components/Header";
import storyStyles from "@/components/Stories.module.css";

import { PlusThanks } from "./PlusThanks";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

// Whop sends the buyer here after checkout. Plus is switched on by Whop's
// webhook, not by this page; the page only waits for it to arrive.
export default function PlusThanksPage() {
  return (
    <main>
      <Header />
      <div className={storyStyles.page}>
        <header className={storyStyles.hero}>
          <div>
            <p className={storyStyles.eyebrow}>PLUS</p>
            <h1>
              Thank you for choosing <span>Plus.</span>
            </h1>
          </div>
        </header>
        <PlusThanks />
      </div>
    </main>
  );
}
