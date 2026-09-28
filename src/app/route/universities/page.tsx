import { Suspense } from "react";

import { Header } from "@/components/Header";
import { UniversityResults } from "@/components/UniversityResults";

export default function RouteUniversityResultsPage() {
  return (
    <main>
      <Header />

      <Suspense fallback={null}>
        <UniversityResults mode="route" />
      </Suspense>
    </main>
  );
}