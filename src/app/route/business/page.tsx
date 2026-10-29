import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { Header } from "@/components/Header";
import { PurposeRouteScreen } from "@/components/PurposeRouteScreen";
import { getAdmissionDate } from "@/lib/admission-date";

export const metadata: Metadata = {
  title: "Business route in Slovakia",
  description:
    "Temporary residence for business in Slovakia: trade licence or company executive, business plan, funds, filing and renewal conditions.",
  // Answers live in the URL.
  robots: { index: false, follow: false },
};

export default async function BusinessRoutePage() {
  await connection();
  return (
    <main>
      <Header />
      <Suspense fallback={null}>
        <PurposeRouteScreen kind="business" asOfDate={getAdmissionDate()} />
      </Suspense>
    </main>
  );
}
