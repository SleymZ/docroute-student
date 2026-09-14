"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";

import {
  demoDestinations,
  destinationOptions,
} from "@/data/demo-destinations";

import type { Destination } from "@/types/destination";

import { RouteForm } from "@/components/RouteForm";
import { EuropeMap } from "@/components/EuropeMap";

export function RoutePlanner() {
  const [documentCountry, setDocumentCountry] = useState("Israel");
  const [destination, setDestination] =
    useState<Destination>("Slovakia");
  const [program, setProgram] = useState("Medicine");

  const [routeGenerated, setRouteGenerated] = useState(false);

  const selectedDestination = demoDestinations[destination];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRouteGenerated(true);
  }

  function handleDocumentCountryChange(value: string) {
    setDocumentCountry(value);
    setRouteGenerated(false);
  }

  function handleDestinationChange(value: string) {
    const matchingDestination = destinationOptions.find(
      (option) => option === value,
    );

    if (!matchingDestination) return;

    setDestination(matchingDestination);
    setRouteGenerated(false);
  }

  function handleProgramChange(value: string) {
    setProgram(value);
    setRouteGenerated(false);
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
          Plan your university applications and the documents you’ll need
          along the way — from admission to student residence.
        </p>

        <RouteForm
          documentCountry={documentCountry}
          destination={destination}
          program={program}
          onDocumentCountryChange={handleDocumentCountryChange}
          onDestinationChange={handleDestinationChange}
          onProgramChange={handleProgramChange}
          onSubmit={handleSubmit}
        />

        {routeGenerated && (
          <div className="generated-result" role="status">
            <CheckCircle2 size={21} />

            <div>
              <strong>Your demo preview is ready</strong>

              <p>
                {documentCountry} → {destination} · {program}
              </p>
            </div>

            <span>
              {selectedDestination.sourceDocuments} sample documents →{" "}
              {selectedDestination.requirements} sample requirements
            </span>
          </div>
        )}
      </div>

      <EuropeMap
        destination={destination}
        program={program}
        onDestinationChange={handleDestinationChange}
      />
    </section>
  );
}