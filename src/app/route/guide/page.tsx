import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { CountryGuideScreen } from "@/components/CountryGuideScreen";
import { Header } from "@/components/Header";
import { getAdmissionDate } from "@/lib/admission-date";

export const metadata: Metadata = {
  title: "Residence guide: family and business in Europe",
  description:
    "Source-linked residence checklists for family and business in every EU country and Switzerland, and for work in Austria.",
  // The chosen situation lives in the URL.
  robots: { index: false, follow: false },
};

export default async function CountryGuidePage() {
  await connection();
  return (
    <main>
      <Header />
      <Suspense fallback={null}>
        <CountryGuideScreen asOfDate={getAdmissionDate()} />
      </Suspense>
    </main>
  );
}
