import type { Metadata } from "next";
import { headers } from "next/headers";

import { Header } from "@/components/Header";
import { JourneyRail } from "@/components/JourneyRail";
import { RoutePlanner } from "@/components/RoutePlanner";
import { applicantCountryOptions } from "@/data/applicant-countries";

export const metadata: Metadata = {
  title: "Plan your route",
  alternates: { canonical: "/home" },
};

// Vercel adds the visitor's country (from the IP address) to each request.
// Used only to preselect "Documents issued in"; never stored.
async function visitorCountry() {
  const code = (await headers()).get("x-vercel-ip-country")?.toUpperCase() ?? "";
  return applicantCountryOptions.some((option) => option.code === code) ? code : "";
}

export default async function Home() {
  const initialDocumentCountry = await visitorCountry();
  return (
    <main>
      <Header />

      <div className="page-container">
        <RoutePlanner initialDocumentCountry={initialDocumentCountry} />
        <JourneyRail />
      </div>
    </main>
  );
}