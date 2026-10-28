"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  destinationOptions,
  programOptions,
} from "@/data/demo-destinations";
import { verifiedPrograms } from "@/data/verified-programs";
import type { MovePurpose } from "@/data/move-purposes";

import type { Destination } from "@/types/destination";
import { RouteForm } from "@/components/RouteForm";
import { EuropeMap } from "@/components/EuropeMap";

const destinationCountryCodes: Record<Destination, string> = {
  Slovakia: "SK",
  Czechia: "CZ",
  Romania: "RO",
  Bulgaria: "BG",
};

const educationCountryCodes: Record<string, string> = {
  Israel: "IL",
  Ukraine: "UA",
  India: "IN",
  "United Kingdom": "GB",
};

// Verified work routes: Slovakia and Czechia.
const workRouteCountries = new Set(["SK", "CZ"]);
// Countries with a verified residence route for study but no verified
// university programmes yet: "Build my route" opens the residence route.
const studyResidenceRouteCountries = new Set(["CZ"]);

export function RoutePlanner() {
  const router = useRouter();
  const [purpose, setPurpose] = useState<MovePurpose>("study");
  const [documentCountry, setDocumentCountry] = useState("Israel");
  const [destination, setDestination] =
    useState<Destination>("Slovakia");
  const [program, setProgram] = useState("Computer Science");

  const destinationCountryCode =
    destinationCountryCodes[destination];
  const routeAvailable =
    purpose === "work"
      ? workRouteCountries.has(destinationCountryCode)
      : studyResidenceRouteCountries.has(destinationCountryCode) ||
        verifiedPrograms.some(
          (verifiedProgram) =>
            verifiedProgram.countryCode === destinationCountryCode &&
            verifiedProgram.category === program,
        );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      const requestedDestination = params.get("destination");
      if (params.get("purpose") === "work") {
        setPurpose("work");
      }
      const requestedProgram = params.get("program");

      const validDestination = destinationOptions.find(
        (item) => item === requestedDestination,
      );

      const validProgram = programOptions.find(
        (item) => item === requestedProgram,
      );

      if (validDestination) {
        setDestination(validDestination);
      }

      if (validProgram) {
        setProgram(validProgram);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (destinationCountryCode === "CZ") {
      if (!routeAvailable) return;
      const czParams = new URLSearchParams({ country: "CZ", purpose });
      const citizenship = educationCountryCodes[documentCountry];
      if (citizenship) czParams.set("citizenship", citizenship);
      router.push(`/route/czechia?${czParams.toString()}`);
      return;
    }

    if (purpose === "work") {
      if (!routeAvailable) return;
      const workParams = new URLSearchParams({ country: destinationCountryCode });
      const citizenship = educationCountryCodes[documentCountry];
      if (citizenship) workParams.set("citizenship", citizenship);
      router.push(`/route/work?${workParams.toString()}`);
      return;
    }

    const params = new URLSearchParams({
      country: destinationCountryCode,
      program,
    });
    const educationCountry = educationCountryCodes[documentCountry];

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
    const matchingDestination = destinationOptions.find(
      (option) => option === value,
    );

    if (!matchingDestination) return;

    setDestination(matchingDestination);
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
          Find the right university, see which documents you need
          and get the deadlines for each one — from application to
          residence permit.
        </p>

        <RouteForm
          purpose={purpose}
          onPurposeChange={setPurpose}
          documentCountry={documentCountry}
          destination={destination}
          program={program}
          routeAvailable={routeAvailable}
          residenceOnly={purpose === "study" && studyResidenceRouteCountries.has(destinationCountryCode)}
          onDocumentCountryChange={handleDocumentCountryChange}
          onDestinationChange={handleDestinationChange}
          onProgramChange={handleProgramChange}
          onSubmit={handleSubmit}
        />
      </div>

      <EuropeMap
        destination={destination}
        program={program}
        onDestinationChange={handleDestinationChange}
      />
    </section>
  );
}
