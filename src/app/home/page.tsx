import type { Metadata } from "next";
import { headers } from "next/headers";

import { Header } from "@/components/Header";
import { HomeProof, HomeSections } from "@/components/home/HomeSections";
import { PhoneHero } from "@/components/home/PhoneHero";
import { RoutePlanner } from "@/components/RoutePlanner";
import { applicantCountryOptions } from "@/data/applicant-countries";
import { getLocale } from "@/i18n/server";
import { getAdmissionDate } from "@/lib/admission-date";

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
  const locale = await getLocale();
  return (
    <main>
      <Header />

      <div className="page-container phone-hero-on">
        <PhoneHero today={getAdmissionDate()} />
        <RoutePlanner
          initialDocumentCountry={initialDocumentCountry}
          mapFooter={<HomeProof placement="hero" today={getAdmissionDate()} />}
        />
        <HomeSections today={getAdmissionDate()} locale={locale} />
      </div>
    </main>
  );
}