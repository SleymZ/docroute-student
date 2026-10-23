import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getAdmissionDate } from "@/lib/admission-date";

import { Header } from "@/components/Header";
import { RoutePreviewScreen } from "@/components/RoutePreviewScreen";

export const metadata: Metadata = {
  title: "Application route preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RoutePreviewPage() {
  await connection();
  return (
    <main>
      <Header />

      <Suspense fallback={null}>
        <RoutePreviewScreen asOfDate={getAdmissionDate()} />
      </Suspense>
    </main>
  );
}
