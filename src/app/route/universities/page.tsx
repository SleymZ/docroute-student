import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getAdmissionDate } from "@/lib/admission-date";

import { Header } from "@/components/Header";
import { UniversityResults } from "@/components/UniversityResults";

export const metadata: Metadata = {
  title: "Personalised university matches",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RouteUniversityResultsPage() {
  await connection();
  return (
    <main>
      <Header />

      <Suspense fallback={null}>
        <UniversityResults mode="route" asOfDate={getAdmissionDate()} />
      </Suspense>
    </main>
  );
}
