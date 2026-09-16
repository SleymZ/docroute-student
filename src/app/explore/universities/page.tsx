import { Suspense } from "react";

import { Header } from "@/components/Header";
import { UniversityResults } from "@/components/UniversityResults";

export default function UniversityResultsPage() {
  return (
    <main>
      <Header />

      <Suspense fallback={null}>
        <UniversityResults />
      </Suspense>
    </main>
  );
}