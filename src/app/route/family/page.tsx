import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { Header } from "@/components/Header";
import { PurposeRouteScreen } from "@/components/PurposeRouteScreen";
import { getAdmissionDate } from "@/lib/admission-date";

export const metadata: Metadata = {
  title: "Family route in Slovakia",
  description:
    "Family-reunification residence in Slovakia for relatives of non-EU residents: eligibility, documents, where to apply and duties after arrival.",
  // Answers live in the URL.
  robots: { index: false, follow: false },
};

export default async function FamilyRoutePage() {
  await connection();
  return (
    <main>
      <Header />
      <Suspense fallback={null}>
        <PurposeRouteScreen kind="family" asOfDate={getAdmissionDate()} />
      </Suspense>
    </main>
  );
}
