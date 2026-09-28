import { Suspense } from "react";

import { Header } from "@/components/Header";
import { RoutePreviewScreen } from "@/components/RoutePreviewScreen";

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