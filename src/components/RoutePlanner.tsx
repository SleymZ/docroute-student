"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  destinationOptions,
  programOptions,
} from "@/data/demo-destinations";
import { verifiedPrograms } from "@/data/verified-programs";

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

export function RoutePlanner() {
  const router = useRouter();
  const [documentCountry, setDocumentCountry] = useState("Israel");
  const [destination, setDestination] =
    useState<Destination>("Slovakia");
  const [program, setProgram] = useState("Computer Science");

  const destinationCountryCode =
    destinationCountryCodes[destination];
  const routeAvailable = verifiedPrograms.some(
    (verifiedProgram) =>
      verifiedProgram.countryCode === destinationCountryCode &&
      verifiedProgram.category === program,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      const requestedDestination = params.get("destination");
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
        <p className="eyebrow">Admission → Residence</p>

        <h1>
          Your route to study
          <br />
          in Europe, <span>mapped.</span>
        </h1>

        <p className="hero-description">
          Plan your university applications and the documents
          you’ll need along the way — from admission to student
          residence.
        </p>

        <RouteForm
          documentCountry={documentCountry}
          destination={destination}
          program={program}
          routeAvailable={routeAvailable}
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
