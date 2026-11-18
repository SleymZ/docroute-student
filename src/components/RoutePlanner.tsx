"use client";

import { useEffect, useState } from "react";
import type React from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  isFeaturedDestination,
  plannerDestinationCodes,
  plannerDestinationOptions,
  programOptions,
} from "@/data/demo-destinations";
import { verifiedPrograms } from "@/data/verified-programs";
import { hasCountryGuide } from "@/lib/residence/country-guides";
import type { MovePurpose } from "@/data/move-purposes";

import type { Destination } from "@/types/destination";
import { RouteForm } from "@/components/RouteForm";
import { EuropeMap } from "@/components/EuropeMap";
import { isCitizenshipCode } from "@/data/region-names";

const destinationCountryCodes: Record<string, string> = plannerDestinationCodes;

// "Documents issued in" holds a country code; "ZZ" (other country) is not
// passed on, so the next screen asks for it. A territory (French Guiana,
// Puerto Rico) is a place of education, never a citizenship.
function knownCountry(code: string) {
  return /^[A-Z]{2}$/.test(code) && code !== "ZZ" ? code : undefined;
}

function knownCitizenship(code: string) {
  return knownCountry(code) && isCitizenshipCode(code) ? code : undefined;
}

// Verified work routes: Slovakia and Czechia.
const workRouteCountries = new Set(["SK", "CZ"]);
// Countries with a verified residence route for study but no verified
// university programmes yet: "Build my route" opens the residence route.
const studyResidenceRouteCountries = new Set(["CZ"]);

export function RoutePlanner({
  initialDocumentCountry = "",
  mapFooter = null,
}: {
  initialDocumentCountry?: string;
  /** Shown under the map on wide screens (the /home numbers strip). */
  mapFooter?: React.ReactNode;
}) {
  const router = useRouter();
  const [purpose, setPurpose] = useState<MovePurpose>("study");
  // The visitor's country from the hosting's location header when known;
  // otherwise empty, so the picker asks instead of guessing.
  const [documentCountry, setDocumentCountry] = useState(initialDocumentCountry);
  const [destination, setDestination] = useState<string>("Slovakia");
  // The map keeps its five featured destinations: another country in the
  // form leaves the map on the last featured one.
  const [mapDestination, setMapDestination] = useState<Destination>("Slovakia");
  const [program, setProgram] = useState("Computer Science");

  const destinationCountryCode =
    destinationCountryCodes[destination];
  const hasVerifiedProgram = verifiedPrograms.some(
    (verifiedProgram) =>
      verifiedProgram.countryCode === destinationCountryCode &&
      verifiedProgram.category === program,
  );
  const residenceOnly =
    purpose === "study" &&
    !hasVerifiedProgram &&
    studyResidenceRouteCountries.has(destinationCountryCode);
  // Source-linked residence checklists (Czechia family/business, Austria
  // work/family/business) at /route/guide.
  const guideAvailable =
    purpose !== "study" && hasCountryGuide(destinationCountryCode, purpose);
  const routeAvailable =
    guideAvailable
      ? true
      : purpose === "family" || purpose === "business"
      ? destinationCountryCode === "SK"
      : purpose === "work"
      ? workRouteCountries.has(destinationCountryCode)
      : residenceOnly ||
        verifiedPrograms.some(
          (verifiedProgram) =>
            verifiedProgram.countryCode === destinationCountryCode &&
            verifiedProgram.category === program,
        );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      const requestedDestination = params.get("destination");
      const requestedPurpose = params.get("purpose");
      if (requestedPurpose === "work" || requestedPurpose === "family" || requestedPurpose === "business") {
        setPurpose(requestedPurpose);
      }
      const requestedProgram = params.get("program");

      const validDestination = plannerDestinationOptions.find(
        (item) => item === requestedDestination,
      );

      const validProgram = programOptions.find(
        (item) => item === requestedProgram,
      );

      if (validDestination) {
        setDestination(validDestination);
        if (isFeaturedDestination(validDestination)) setMapDestination(validDestination);
      }

      if (validProgram) {
        setProgram(validProgram);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (destinationCountryCode === "CZ" && (purpose === "work" || residenceOnly)) {
      if (!routeAvailable) return;
      const czParams = new URLSearchParams({ country: "CZ", purpose });
      const citizenship = knownCitizenship(documentCountry);
      if (citizenship) czParams.set("citizenship", citizenship);
      router.push(`/route/czechia?${czParams.toString()}`);
      return;
    }

    if (guideAvailable) {
      // "Documents issued in" is not citizenship, and the guide adds
      // passport-specific steps at once, so the person picks it there.
      router.push(
        `/route/guide?${new URLSearchParams({ country: destinationCountryCode, purpose }).toString()}`,
      );
      return;
    }

    if (purpose === "family" || purpose === "business") {
      if (!routeAvailable) return;
      const purposeParams = new URLSearchParams({ country: "SK" });
      const citizenship = knownCitizenship(documentCountry);
      if (citizenship) purposeParams.set("citizenship", citizenship);
      router.push(`/route/${purpose}?${purposeParams.toString()}`);
      return;
    }

    if (purpose === "work") {
      if (!routeAvailable) return;
      const workParams = new URLSearchParams({ country: destinationCountryCode });
      const citizenship = knownCitizenship(documentCountry);
      if (citizenship) workParams.set("citizenship", citizenship);
      router.push(`/route/work?${workParams.toString()}`);
      return;
    }

    const params = new URLSearchParams({
      country: destinationCountryCode,
      program,
    });
    const educationCountry = knownCountry(documentCountry);

    if (educationCountry) {
      params.set("educationCountry", educationCountry);
    }

    router.push(
      routeAvailable
        ? `/route/profile?${params.toString()}`
        : `/explore/universities?${new URLSearchParams({
            country: destinationCountryCode,
            program,
          }).toString()}`,
    );
  }

  function handleDocumentCountryChange(value: string) {
    setDocumentCountry(value);
  }

  function handleDestinationChange(value: string) {
    const matchingDestination = plannerDestinationOptions.find(
      (option) => option === value,
    );

    if (!matchingDestination) return;

    setDestination(matchingDestination);
    if (isFeaturedDestination(matchingDestination)) setMapDestination(matchingDestination);
  }

  function handleProgramChange(value: string) {
    setProgram(value);
  }

  return (
    <section className="hero" id="route-builder">
      <div className="hero-copy">
        <p className="eyebrow">Documents → Deadlines → Residence</p>

        <h1>
          Your move
          <br />
          to Europe, <span>mapped.</span>
        </h1>

        <p className="hero-description">
          Applying to a university in Slovakia or Czechia from outside
          the EU? See which documents you need and the deadline for each
          one, from the application to the residence permit. Every rule
          links to its official source. Free.
        </p>

        <RouteForm
          purpose={purpose}
          onPurposeChange={setPurpose}
          documentCountry={documentCountry}
          destination={destination}
          program={program}
          routeAvailable={routeAvailable}
          residenceOnly={residenceOnly}
          onDocumentCountryChange={handleDocumentCountryChange}
          onDestinationChange={handleDestinationChange}
          onProgramChange={handleProgramChange}
          onSubmit={handleSubmit}
        />

        <Link href="/deadlines" className="hero-deadlines-link">
          See every verified 2027/28 application deadline, no account needed →
        </Link>
      </div>

      {/* On phones the map is too small to read and pushes the content
          below the form out of reach; the form already picks the country. */}
      <div className="hero-map">
        <EuropeMap
          destination={mapDestination}
          program={program}
          onDestinationChange={handleDestinationChange}
        />
        {mapFooter}
      </div>
    </section>
  );
}
