import type { Metadata } from "next";

import { Header } from "@/components/Header";
import { JourneyRail } from "@/components/JourneyRail";
import { RoutePlanner } from "@/components/RoutePlanner";

export const metadata: Metadata = {
  title: "Plan your route",
  alternates: { canonical: "/home" },
};

export default function Home() {
  return (
    <main>
      <Header />

      <div className="page-container">
        <RoutePlanner />
        <JourneyRail />
      </div>
    </main>
  );
}