"use client";

import Link from "next/link";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Globe2,
  Languages,
  MapPin,
  Search,
  X,
} from "lucide-react";

import {
  destinationOptions,
} from "@/data/demo-destinations";

import {
  countryDetails,
} from "@/data/country-details";

import type {
  Destination,
} from "@/types/destination";

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
  onDestinationChange: (
    destination: Destination,
  ) => void;
};

type MapCountry =
  (typeof mapCountries)[number];

type MapFocus = {
  id: string;
  name: string;
  point: {
    x: number;
    y: number;
  };
  zoom: number;
  destination?: Destination;
  highlighted: boolean;
};

function calculateCountryZoom(
  width: number,
  height: number,
) {
  const safeWidth = Math.max(width, 24);
  const safeHeight = Math.max(height, 24);

  const horizontalZoom =
    (MAP_WIDTH * 0.36) / safeWidth;

  const verticalZoom =
    (MAP_HEIGHT * 0.58) / safeHeight;

  /*
   * Large countries receive a smaller zoom.
   * Small countries are capped to prevent rendering
   * artefacts and overly aggressive zooming.
   */
  return Math.min(
    2.35,
    Math.max(
      1.25,
      Math.min(
        horizontalZoom,
        verticalZoom,
      ),
    ),
  );
}

export function EuropeMap({
  destination,
  program,
  onDestinationChange,
}: EuropeMapProps) {
  const titleId = useId();
  const searchId = useId();

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    isZoomed,
    setIsZoomed,
  ] = useState(false);

  const [
    mapFocus,
    setMapFocus,
  ] = useState<MapFocus | null>(null);

  const previousDestinationRef =
    useRef(destination);

  const internalDestinationRef =
    useRef<Destination | null>(null);

  const defaultDetails =
    countryDetails[destination];

  const selectedPoint =
    destinationPoints[destination];

  /*
   * Reset map exploration when the destination
   * is changed through the form.
   *
   * Changes initiated from the map itself do not
   * close the zoomed state.
   */
  useEffect(() => {
    if (
      previousDestinationRef.current ===
      destination
    ) {
      return;
    }

    previousDestinationRef.current =
      destination;

    if (
      internalDestinationRef.current ===
      destination
    ) {
      internalDestinationRef.current =
        null;

      return;
    }

    internalDestinationRef.current = null;
    setMapFocus(null);
    setIsZoomed(false);
  }, [destination]);

  const normalizedQuery =
    query.trim().toLowerCase();

  const results = normalizedQuery
    ? destinationOptions.filter(
        (country) =>
          countryDetails[
            country
          ].searchTerms.includes(
            normalizedQuery,
          ),
      )
    : destinationOptions;

  const activeDetails = mapFocus
    ? mapFocus.destination
      ? countryDetails[
          mapFocus.destination
        ]
      : null
    : defaultDetails;

  const activeCountryName =
    mapFocus?.name ?? destination;

  const activePoint =
    mapFocus?.point ?? selectedPoint;

  const zoom = isZoomed
    ? mapFocus?.zoom ??
      defaultDetails.zoom
    : 1;

  const translateX = isZoomed
    ? MAP_WIDTH * 0.35 -
      activePoint.x * zoom
    : 0;

  const translateY = isZoomed
    ? MAP_HEIGHT * 0.52 -
      activePoint.y * zoom
    : 0;

  const markerX =
    activePoint.x * zoom + translateX;

  const markerY =
    activePoint.y * zoom + translateY;

  const markerLabel =
    activeDetails?.capital ??
    activeCountryName;

  const universitiesHref =
    activeDetails
      ? `/explore/universities?${new URLSearchParams(
          {
            country:
              activeDetails.code,
            program,
          },
        ).toString()}`
      : null;

  function selectDestination(
    country: Destination,
  ) {
    const mapCountry =
      mapCountries.find(
        (item) =>
          item.destination === country,
      );

    const details =
      countryDetails[country];

    setMapFocus({
      id: mapCountry?.id ?? country,
      name:
        mapCountry?.name ?? country,
      point:
        destinationPoints[country],
      zoom: details.zoom,
      destination: country,
      highlighted: true,
    });

    internalDestinationRef.current =
      country;

    onDestinationChange(country);

    setIsZoomed(true);
    setQuery("");
    setSearchOpen(false);
  }

  function selectMapCountry(
    country: MapCountry,
    element: SVGPathElement,
  ) {
    if (!country.interactive) {
      return;
    }

    const bounds = element.getBBox();

    const geometricPoint = {
      x:
        bounds.x +
        bounds.width / 2,

      y:
        bounds.y +
        bounds.height / 2,
    };

    const countryDestination =
      country.destination;

    const point = countryDestination
      ? destinationPoints[
          countryDestination
        ]
      : geometricPoint;

    const countryZoom =
      countryDestination
        ? countryDetails[
            countryDestination
          ].zoom
        : calculateCountryZoom(
            bounds.width,
            bounds.height,
          );

    setMapFocus({
      id: country.id,
      name: country.name,
      point,
      zoom: countryZoom,
      destination:
        countryDestination,
      highlighted:
        country.highlighted,
    });

    if (countryDestination) {
      internalDestinationRef.current =
        countryDestination;

      onDestinationChange(
        countryDestination,
      );
    }

    setIsZoomed(true);
    setQuery("");
    setSearchOpen(false);
  }

  function showEurope() {
    setMapFocus(null);
    setIsZoomed(false);
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
            if (
              !event.currentTarget.contains(
                event.relatedTarget,
              )
            ) {
              setSearchOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Escape"
            ) {
              setSearchOpen(false);
            }
          }}
        >
          <label
            className={styles.srOnly}
            htmlFor={searchId}
          >
            Search a country or capital
          </label>

          <div
            className={styles.searchField}
          >
            <Search
              size={18}
              aria-hidden="true"
            />

            <input
              id={searchId}
              type="search"
              autoComplete="off"
              placeholder="Search a featured destination"
              value={query}
              onFocus={() =>
                setSearchOpen(true)
              }
              onChange={(event) => {
                setQuery(
                  event.target.value,
                );

                setSearchOpen(true);
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  results.length > 0
                ) {
                  event.preventDefault();

                  selectDestination(
                    results[0],
                  );
                }
              }}
            />

            {query && (
              <button
                className={
                  styles.clearButton
                }
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(true);
                }}
              >
                <X
                  size={16}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          {searchOpen && (
            <div
              className={
                styles.searchResults
              }
            >
              <p
                className={
                  styles.resultsHeading
                }
              >
                Featured destinations
              </p>

              {results.length > 0 ? (
                <ul>
                  {results.map(
                    (country) => {
                      const information =
                        countryDetails[
                          country
                        ];

                      return (
                        <li key={country}>
                          <button
                            type="button"
                            className={
                              styles.searchResult
                            }
                            onClick={() =>
                              selectDestination(
                                country,
                              )
                            }
                          >
                            <span
                              className={
                                styles.resultFlag
                              }
                              aria-hidden="true"
                            >
                              {
                                information.flag
                              }
                            </span>

                            <span>
                              <strong>
                                {country}
                              </strong>

                              <small>
                                {
                                  information.capital
                                }
                              </small>
                            </span>

                            {country ===
                              destination && (
                              <span
                                className={
                                  styles.selectedBadge
                                }
                              >
                                Selected
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    },
                  )}
                </ul>
              ) : (
                <p
                  className={
                    styles.emptyResult
                  }
                  role="status"
                >
                  No matching featured
                  destination. You can
                  still select other
                  European countries
                  directly on the map.
                </p>
              )}
            </div>
          )}
        </div>

        {isZoomed && (
          <button
            className={
              styles.backButton
            }
            type="button"
            onClick={showEurope}
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
            />

            Europe
          </button>
        )}
      </div>

      <div
        className={`${
          styles.mapViewport
        } ${
          isZoomed
            ? styles.zoomedViewport
            : ""
        }`}
      >
        <svg
          className={styles.map}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="xMidYMid slice"
          role="group"
          aria-labelledby={titleId}
        >
          <title id={titleId}>
            Interactive map of Europe.
            Select a country to explore it.
          </title>

          <g
            className={styles.mapScene}
            style={{
              transform:
                `translate(` +
                `${translateX}px, ` +
                `${translateY}px) ` +
                `scale(${zoom})`,
            }}
          >
            <path
              d={graticulePath}
              className={
                styles.graticule
              }
              vectorEffect="non-scaling-stroke"
              aria-hidden="true"
            />

            {mapCountries.map(
              (country) => {
                const isDefaultSelection =
                  !isZoomed &&
                  country.destination ===
                    destination;

                const isFocused =
                  isZoomed &&
                  mapFocus?.id ===
                    country.id;

                const isHighlightedSelection =
                  country.highlighted &&
                  (isFocused ||
                    isDefaultSelection);

                const isUnhighlightedFocus =
                  isFocused &&
                  !country.highlighted;

                return (
                  <path
                    key={country.id}
                    d={country.path}
                    className={[
                      styles.country,

                      country.interactive
                        ? styles.interactive
                        : "",

                      country.highlighted
                        ? styles.available
                        : "",

                      isHighlightedSelection
                        ? styles.selected
                        : "",

                      isUnhighlightedFocus
                        ? styles.focused
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    role={
                      country.interactive
                        ? "button"
                        : undefined
                    }
                    tabIndex={
                      country.interactive
                        ? 0
                        : undefined
                    }
                    aria-label={
                      country.interactive
                        ? country.highlighted
                          ? `${country.name}, featured destination`
                          : `Explore ${country.name}`
                        : undefined
                    }
                    aria-pressed={
                      country.interactive
                        ? isFocused ||
                          isDefaultSelection
                        : undefined
                    }
                    aria-hidden={
                      country.interactive
                        ? undefined
                        : true
                    }
                    onMouseDown={
                      country.interactive
                        ? (event) => {
                            event.preventDefault();
                          }
                        : undefined
                    }
                    onClick={
                      country.interactive
                        ? (event) =>
                            selectMapCountry(
                              country,
                              event.currentTarget,
                            )
                        : undefined
                    }
                    onKeyDown={
                      country.interactive
                        ? (event) => {
                            if (
                              event.key ===
                                "Enter" ||
                              event.key ===
                                " "
                            ) {
                              event.preventDefault();

                              selectMapCountry(
                                country,
                                event.currentTarget,
                              );
                            }
                          }
                        : undefined
                    }
                  />
                );
              },
            )}

            <g
              className={`${
                styles.labels
              } ${
                isZoomed
                  ? styles.labelsHidden
                  : ""
              }`}
              aria-hidden="true"
            >
              {mapLabels.map(
                (label) => (
                  <text
                    key={label.name}
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                  >
                    {label.name}
                  </text>
                ),
              )}
            </g>
          </g>

          <g
            className={
              styles.capitalMarker
            }
            style={{
              transform:
                `translate(` +
                `${markerX}px, ` +
                `${markerY}px)`,
            }}
            aria-hidden="true"
          >
            <circle
              r="13"
              className={
                styles.markerRing
              }
            />

            <circle
              r="4.5"
              className={
                styles.markerDot
              }
            />

            {isZoomed && (
              <text
                x="19"
                y="5"
                className={
                  styles.capitalLabel
                }
              >
                {markerLabel}
              </text>
            )}
          </g>
        </svg>
      </div>

      {isZoomed && (
        <aside
          key={activeCountryName}
          className={
            styles.countryDetails
          }
          aria-label={`Information about ${activeCountryName}`}
          aria-live="polite"
        >
          <div
            className={
              styles.cardTopline
            }
          >
            <span
              className={styles.flag}
              aria-hidden="true"
            >
              {activeDetails ? (
                activeDetails.flag
              ) : (
                <Globe2 size={20} />
              )}
            </span>

            <p
              className={
                styles.cardEyebrow
              }
            >
              {activeDetails
                ? "Destination guide"
                : "Explore Europe"}
            </p>

            <span
              className={
                activeDetails
                  ? styles.previewBadge
                  : styles.pendingBadge
              }
            >
              {activeDetails
                ? "Preview"
                : "Coverage in progress"}
            </span>
          </div>

          <div
            className={
              styles.countryHeading
            }
          >
            <h2>
              {activeCountryName}
            </h2>

            <p
              className={
                styles.capital
              }
            >
              <MapPin
                size={15}
                aria-hidden="true"
              />

              {activeDetails
                ? activeDetails.capital
                : "European destination"}
            </p>
          </div>

          <p
            className={
              styles.countryDescription
            }
          >
            {activeDetails
              ? activeDetails.description
              : `You can explore ${activeCountryName} on the map. University, admission and residence information for this destination is still being prepared.`}
          </p>

          {activeDetails ? (
            <dl
              className={
                styles.countryFacts
              }
            >
              <div>
                <dt>
                  <Globe2
                    size={14}
                    aria-hidden="true"
                  />
                  Region
                </dt>

                <dd>
                  {
                    activeDetails.region
                  }
                </dd>
              </div>

              <div>
                <dt>
                  <Languages
                    size={14}
                    aria-hidden="true"
                  />
                  Language
                </dt>

                <dd>
                  {
                    activeDetails.language
                  }
                </dd>
              </div>

              <div
                className={
                  styles.wideFact
                }
              >
                <dt>
                  <MapPin
                    size={14}
                    aria-hidden="true"
                  />
                  Cities to explore
                </dt>

                <dd>
                  {activeDetails.studentCities.join(
                    " · ",
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <div
              className={
                styles.pendingCoverage
              }
            >
              <Clock3
                size={18}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Country coverage is
                  being prepared
                </strong>

                <p>
                  We will add universities
                  and document requirements
                  only after reviewing
                  official sources.
                </p>
              </div>
            </div>
          )}

          <div
            className={
              styles.countryInterest
            }
          >
            <div
              className={
                styles.interestHeader
              }
            >
              <span>
                Your study interest
              </span>

              <BookOpen
                size={15}
                aria-hidden="true"
              />
            </div>

            <strong>{program}</strong>
          </div>

          <div
            className={`${
              styles.verificationNote
            } ${
              !activeDetails
                ? styles.pendingVerification
                : ""
            }`}
          >
            {activeDetails ? (
              <CheckCircle2
                size={17}
                aria-hidden="true"
              />
            ) : (
              <Clock3
                size={17}
                aria-hidden="true"
              />
            )}

            <p>
              <strong>
                {activeDetails
                  ? "Source-first information"
                  : "Verification pending"}
              </strong>

              <span>
                {activeDetails
                  ? "Requirements are shown only after an official university source is reviewed."
                  : "This country is explorable, but it is not yet included in the verified route builder."}
              </span>
            </p>
          </div>

          {universitiesHref ? (
            <Link
              href={universitiesHref}
              className={
                styles.universitiesButton
              }
            >
              <span>
                Explore universities
              </span>

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className={`${
                styles.universitiesButton
              } ${
                styles.disabledButton
              }`}
            >
              <span>
                University coverage
                coming soon
              </span>

              <Clock3
                size={16}
                aria-hidden="true"
              />
            </button>
          )}
        </aside>
      )}
    </section>
  );
}
