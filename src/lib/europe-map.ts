import { geoGraticule10, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type {
  GeometryCollection,
  Topology,
} from "topojson-specification";
import worldData from "world-atlas/countries-50m.json";

import type { Destination } from "@/types/destination";

type CountryProperties = {
  name: string;
};

type WorldTopology = Topology<{
  countries: GeometryCollection<CountryProperties>;
}>;

type MapPoint = {
  x: number;
  y: number;
};

export const MAP_WIDTH = 1100;
export const MAP_HEIGHT = 600;

const topology = worldData as unknown as WorldTopology;

const countries = feature(
  topology,
  topology.objects.countries,
).features;

const projection = geoMercator()
  .center([16, 50])
  .scale(875)
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
  .clipExtent([
    [0, 0],
    [MAP_WIDTH, MAP_HEIGHT],
  ]);

const pathGenerator = geoPath(projection);

/*
 * Only these destinations currently have verified route data.
 * Germany is highlighted below, but it is not connected to
 * Destination until its route data is added.
 */
const destinationById: Partial<Record<string, Destination>> = {
  "703": "Slovakia",
  "203": "Czechia",
  "642": "Romania",
  "100": "Bulgaria",
};

/*
 * Featured countries stay highlighted even while another
 * European country is being explored.
 */
const highlightedCountryIds = new Set([
  "703", // Slovakia
  "203", // Czechia
  "642", // Romania
  "100", // Bulgaria
  "276", // Germany
]);

/*
 * Stable English names avoid differences between server and
 * browser locale data during hydration.
 */
const europeanCountryNames: Record<string, string> = {
  "008": "Albania",
  "020": "Andorra",
  "040": "Austria",
  "051": "Armenia",
  "031": "Azerbaijan",
  "112": "Belarus",
  "056": "Belgium",
  "070": "Bosnia and Herzegovina",
  "100": "Bulgaria",
  "191": "Croatia",
  "196": "Cyprus",
  "203": "Czechia",
  "208": "Denmark",
  "233": "Estonia",
  "246": "Finland",
  "250": "France",
  "268": "Georgia",
  "276": "Germany",
  "300": "Greece",
  "348": "Hungary",
  "352": "Iceland",
  "372": "Ireland",
  "380": "Italy",
  "383": "Kosovo",
  "428": "Latvia",
  "438": "Liechtenstein",
  "440": "Lithuania",
  "442": "Luxembourg",
  "470": "Malta",
  "498": "Moldova",
  "492": "Monaco",
  "499": "Montenegro",
  "528": "Netherlands",
  "807": "North Macedonia",
  "578": "Norway",
  "616": "Poland",
  "620": "Portugal",
  "642": "Romania",
  "643": "Russia",
  "674": "San Marino",
  "688": "Serbia",
  "703": "Slovakia",
  "705": "Slovenia",
  "724": "Spain",
  "752": "Sweden",
  "756": "Switzerland",
  "792": "Turkey",
  "804": "Ukraine",
  "826": "United Kingdom",
  "336": "Vatican City",
};

const interactiveCountryIds = new Set(
  Object.keys(europeanCountryNames),
);

export const mapCountries = countries
  .map((country, index) => {
    const id = String(
      country.id ?? `country-${index}`,
    ).padStart(3, "0");

    return {
      id,
      name:
        europeanCountryNames[id] ??
        country.properties?.name ??
        "Country",
      path: pathGenerator(country) ?? "",
      destination: destinationById[id],
      highlighted: highlightedCountryIds.has(id),
      interactive: interactiveCountryIds.has(id),
    };
  })
  .filter((country) => country.path.length > 0);

export const graticulePath =
  pathGenerator(geoGraticule10()) ?? "";

function projectPoint(
  coordinates: [number, number],
): MapPoint {
  const point = projection(coordinates);

  if (!point) {
    throw new Error("Unable to project map coordinates");
  }

  return {
    x: point[0],
    y: point[1],
  };
}

const capitalCoordinates: Record<
  Destination,
  [number, number]
> = {
  Slovakia: [17.1077, 48.1486],
  Czechia: [14.4378, 50.0755],
  Romania: [26.1025, 44.4268],
  Bulgaria: [23.3219, 42.6977],
};

export const destinationPoints: Record<
  Destination,
  MapPoint
> = {
  Slovakia: projectPoint(capitalCoordinates.Slovakia),
  Czechia: projectPoint(capitalCoordinates.Czechia),
  Romania: projectPoint(capitalCoordinates.Romania),
  Bulgaria: projectPoint(capitalCoordinates.Bulgaria),
};

const labelCoordinates: {
  name: string;
  coordinates: [number, number];
}[] = [
  { name: "FRANCE", coordinates: [2, 46.5] },
  { name: "GERMANY", coordinates: [10, 51.5] },
  { name: "POLAND", coordinates: [19, 53] },
  { name: "ITALY", coordinates: [12.5, 42.5] },
  { name: "SPAIN", coordinates: [-4, 40] },
  { name: "SWEDEN", coordinates: [16, 61] },
  { name: "NORWAY", coordinates: [8, 62] },
  { name: "FINLAND", coordinates: [26, 63] },
  { name: "UKRAINE", coordinates: [32, 49] },
];

export const mapLabels = labelCoordinates.map((label) => ({
  name: label.name,
  ...projectPoint(label.coordinates),
}));
