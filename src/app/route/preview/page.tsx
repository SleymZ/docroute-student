import type { Metadata } from "next";
import { Suspense } from "react";

import { Header } from "@/components/Header";
import { RoutePreviewScreen } from "@/components/RoutePreviewScreen";

export const metadata: Metadata = {
  title: "Application route preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RoutePreviewPage() {
  return (
    <main>
      <Header />

      <Suspense fallback={null}>
        <RoutePreviewScreen />
      </Suspense>
    </main>
  );
}
