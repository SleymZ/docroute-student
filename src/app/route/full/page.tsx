import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { FullPathScreen } from "@/components/FullPathScreen";
import { Header } from "@/components/Header";
import { getAdmissionDate } from "@/lib/admission-date";

export const metadata: Metadata = {
  title: "Full study path",
  description:
    "From choosing a university to living in the country: application, entrance requirements, enrolment and the student visa or residence step, with official sources.",
  // The chosen programme and answers live in the URL.
  robots: { index: false, follow: false },
};

export default async function FullPathPage() {
  await connection();
  return (
    <main>
      <Header />
      <Suspense fallback={null}>
        <FullPathScreen asOfDate={getAdmissionDate()} />
      </Suspense>
    </main>
  );
}
