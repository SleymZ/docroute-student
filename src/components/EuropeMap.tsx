"use client";

import { useId, useState } from "react";
import { ArrowLeft, MapPin, Search, X } from "lucide-react";

import { destinationOptions } from "@/data/demo-destinations";
import { countryDetails } from "@/data/country-details";
import type { Destination } from "@/types/destination";

import {
  destinationPoints,
  graticulePath,
  MAP_HEIGHT,
  MAP_WIDTH,
  mapCountries,
  mapLabels,
} from "@/lib/europe-map";

import styles from "./EuropeMap.module.css";

type EuropeMapProps = {
  destination: Destination;
  program: string;
  onDestinationChange: (destination: Destination) => void;
};

export function EuropeMap({
  destination,
  program,
  onDestinationChange,
}: EuropeMapProps) {
  const titleId = useId();
  const searchId = useId();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const details = countryDetails[destination];
  const selectedPoint = destinationPoints[destination];

  const normalizedQuery = query.trim().toLowerCase();

  const results = destinationOptions.filter((country) =>
    countryDetails[country].searchTerms.includes(normalizedQuery),
  );

  // При приближении помещаем столицу ближе к центру карты.
  // Справа оставляем пространство для информационной карточки.
  const zoom = isZoomed ? details.zoom : 1;

  const translateX = isZoomed
    ? MAP_WIDTH * 0.42 - selectedPoint.x * zoom
    : 0;

  const translateY = isZoomed
    ? MAP_HEIGHT * 0.48 - selectedPoint.y * zoom
    : 0;

  function selectCountry(country: Destination) {
    onDestinationChange(country);
    setIsZoomed(true);
    setQuery("");
    setSearchOpen(false);
  }

  return (
    <section
      className={styles.panel}
      aria-label="Explore European study destinations"
    >
      <div className={styles.toolbar}>
        <div
          className={styles.search}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setSearchOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSearchOpen(false);
            }
          }}
        >
          <label className={styles.srOnly} htmlFor={searchId}>
            Search a country or capital
          </label>

          <div className={styles.searchField}>
            <Search size={18} aria-hidden="true" />

            <input
              id={searchId}
              type="search"
              autoComplete="off"
              placeholder="Search a country or capital"
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && results.length > 0) {
                  event.preventDefault();
                  selectCountry(results[0]);
                }
              }}
            />

            {query && (
              <button
                className={styles.clearButton}
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(true);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {searchOpen && (
            <div className={styles.searchResults}>
              <p className={styles.resultsHeading}>
                Available destinations
              </p>

              {results.length > 0 ? (
                <ul>
                  {results.map((country) => (
                    <li key={country}>
                      <button
                        type="button"
                        className={styles.searchResult}
                        onClick={() => selectCountry(country)}
                      >
                        <MapPin size={16} aria-hidden="true" />

                        <span>
                          <strong>{country}</strong>
                          <small>
                            {countryDetails[country].capital}
                          </small>
                        </span>

                        {country === destination && (
                          <span className={styles.selectedBadge}>
                            Selected
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyResult} role="status">
                  No matching destination. This demo currently covers
                  Slovakia, Czechia, Romania and Bulgaria.
                </p>
              )}
            </div>
          )}
        </div>

        {isZoomed && (
          <button
            className={styles.backButton}
            type="button"
            onClick={() => setIsZoomed(false)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Europe
          </button>
        )}
      </div>

      <div className={styles.mapViewport}>
        <svg
          className={styles.map}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
           preserveAspectRatio="xMidYMid slice"
          role="group"
          aria-labelledby={titleId}
        >
          <title id={titleId}>
            Map of Europe. Select a highlighted country to zoom in.
          </title>

          <g
            className={styles.mapScene}
            transform={`translate(${translateX}, ${translateY}) scale(${zoom})`}
          >
            <path
              d={graticulePath}
              className={styles.graticule}
              aria-hidden="true"
            />

            {mapCountries.map((country) => {
              const target = country.destination;
              const isSelected = target === destination;

              return (
                <path
                  key={country.id}
                  d={country.path}
                  className={[
                    styles.country,
                    target ? styles.available : "",
                    isSelected ? styles.selected : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role={target ? "button" : undefined}
                  tabIndex={target ? 0 : undefined}
                  aria-label={target ? `Explore ${target}` : undefined}
                  aria-pressed={target ? isSelected : undefined}
                  aria-hidden={target ? undefined : true}
                  onClick={
                    target ? () => selectCountry(target) : undefined
                  }
                  onKeyDown={
                    target
                      ? (event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            selectCountry(target);
                          }
                        }
                      : undefined
                  }
                >
                  <title>{country.name}</title>
                </path>
              );
            })}

            <g
              className={`${styles.labels} ${
                isZoomed ? styles.labelsHidden : ""
              }`}
              aria-hidden="true"
            >
              {mapLabels.map((label) => (
                <text
                  key={label.name}
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                >
                  {label.name}
                </text>
              ))}
            </g>
          </g>

          {/* Маркер вне масштабируемой группы:
              его размер не увеличивается вместе с картой. */}
          <g
            className={styles.capitalMarker}
            transform={`translate(${
              selectedPoint.x * zoom + translateX
            }, ${selectedPoint.y * zoom + translateY})`}
            aria-hidden="true"
          >
            <circle r="13" className={styles.markerRing} />
            <circle r="4.5" className={styles.markerDot} />

            {isZoomed && (
              <text x="19" y="5" className={styles.capitalLabel}>
                {details.capital}
              </text>
            )}
          </g>
        </svg>
      </div>

      {isZoomed && (
  <aside
    className={styles.countryDetails}
    aria-label={`Information about ${destination}`}
    aria-live="polite"
  >
    <div className={styles.countryHeading}>
      <span className={styles.countryPin}>
        <MapPin size={20} aria-hidden="true" />
      </span>

      <div>
        <h2>{destination}</h2>
        <p>Capital · {details.capital}</p>
      </div>
    </div>

    <div className={styles.countryInterest}>
      <span>Your study interest</span>
      <strong>{program}</strong>
    </div>
  </aside>
)}

      
    </section>
  );
}