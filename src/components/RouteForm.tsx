"use client";

import type { FormEvent } from "react";
import { ArrowRight, FileText } from "lucide-react";

import {
  destinationOptions,
  documentCountryOptions,
  programOptions,
} from "@/data/demo-destinations";

import type { Destination } from "@/types/destination";

type RouteFormProps = {
  documentCountry: string;
  destination: Destination;
  program: string;

  onDocumentCountryChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function RouteForm({
  documentCountry,
  destination,
  program,
  onDocumentCountryChange,
  onDestinationChange,
  onProgramChange,
  onSubmit,
}: RouteFormProps) {
  return (
    <form className="route-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          <span>Documents issued in</span>

          <select
            value={documentCountry}
            onChange={(event) =>
              onDocumentCountryChange(event.target.value)
            }
          >
            {documentCountryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>I want to study in</span>

          <select
            value={destination}
            onChange={(event) =>
              onDestinationChange(event.target.value)
            }
          >
            {destinationOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Program</span>

          <select
            value={program}
            onChange={(event) =>
              onProgramChange(event.target.value)
            }
          >
            {programOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="primary-button route-button" type="submit">
        Preview my route
        <ArrowRight size={18} />
      </button>

      <div className="trust-row">
        <span>
          <FileText size={17} />
          Interactive demo · Sample data, not application guidance
        </span>
      </div>
    </form>
  );
}