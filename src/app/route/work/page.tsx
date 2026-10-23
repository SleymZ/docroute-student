import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { Header } from "@/components/Header";
import { WorkRouteScreen } from "@/components/WorkRouteScreen";
import { getAdmissionDate } from "@/lib/admission-date";

export const metadata: Metadata = {
  title: "Work route in Slovakia",
  description:
    "Your route to working in Slovakia as a non-EU citizen: job offer, Labour Office confirmation, residence application and duties after arrival.",
  // Answers (citizenship, residence status) live in the URL.
  robots: {
    index: false,
    follow: false,
  },
};

export default async function WorkRoutePage() {
  await connection();

  return (
    <main>
      <Header />

      <Suspense fallback={null}>
        {/* Same Europe/Bratislava "today" as the study route. */}
        <WorkRouteScreen asOfDate={getAdmissionDate()} />
      </Suspense>
    </main>
  );
}
