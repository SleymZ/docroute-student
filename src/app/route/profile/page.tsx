import type { Metadata } from "next";
import { Suspense } from "react";

import { ApplicantProfileForm } from "@/components/ApplicantProfileForm";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Build applicant profile",
  robots: {
    index: false,
    follow: false,
  },
};

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
