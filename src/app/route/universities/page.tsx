import type { Metadata } from "next";
import { Suspense } from "react";

import { Header } from "@/components/Header";
import { UniversityResults } from "@/components/UniversityResults";

export const metadata: Metadata = {
  title: "Personalised university matches",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RouteUniversityResultsPage() {
  return (
    <main>
      <Header />

      <Suspense fallback={null}>
        <UniversityResults mode="route" />
      </Suspense>
    </main>
  );
}
