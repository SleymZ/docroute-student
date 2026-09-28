import { Suspense } from "react";

import { ApplicantProfileForm } from "@/components/ApplicantProfileForm";
import { Header } from "@/components/Header";

export default function RouteProfilePage() {
  return (
    <main>
      <Header />

      <Suspense fallback={null}>
        <ApplicantProfileForm />
      </Suspense>
    </main>
  );
}
