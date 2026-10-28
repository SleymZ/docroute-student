import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { CzechiaRouteScreen } from "@/components/CzechiaRouteScreen";
import { Header } from "@/components/Header";
import { getAdmissionDate } from "@/lib/admission-date";

export const metadata: Metadata = {
  title: "Moving to Czechia",
  description:
    "Your residence route for studying or working in Czechia: long-term residence permit for study, employee card, EU Blue Card or EU registration.",
  // Answers (citizenship, residence status) live in the URL.
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CzechiaRoutePage() {
  await connection();

  return (
    <main>
      <Header />

      <Suspense fallback={null}>
        <CzechiaRouteScreen asOfDate={getAdmissionDate()} />
      </Suspense>
    </main>
  );
}
