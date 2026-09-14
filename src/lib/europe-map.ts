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

const topology = worldData as unknown as WorldTopology;

const countries = feature(
  topology,
  topology.objects.countries,
).features;



/*
 * Европейские страны.
 * Россия включена, но восточная часть выходит за пределы кадра.
 * Заморские территории отсекаются отдельно ниже.
 */
export const MAP_WIDTH = 1100;
export const MAP_HEIGHT = 600;

const projection = geoMercator()
  .center([16, 50])
  .scale(875)
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);
const pathGenerator = geoPath(projection);

const destinationById: Record<string, Destination> = {
  "703": "Slovakia",
  "203": "Czechia",
  "642": "Romania",
  "100": "Bulgaria",
};

export const mapCountries = countries
  .map((country, index) => {
    const id = String(country.id ?? `country-${index}`).padStart(3, "0");

    return {
      id,
      name: country.properties?.name ?? "Country",
      path: pathGenerator(country) ?? "",
      destination: destinationById[id],
    };
  })
  .filter((country) => country.path.length > 0);

export const graticulePath =
  pathGenerator(geoGraticule10()) ?? "";

type MapPoint = {
  x: number;
  y: number;
};

function projectPoint(coordinates: [number, number]): MapPoint {
  const point = projection(coordinates);

  if (!point) {
    throw new Error("Unable to project map coordinates");
  }

  return {
    x: point[0],
    y: point[1],
  };
}

const capitalCoordinates: Record<Destination, [number, number]> = {
  Slovakia: [17.1077, 48.1486],
  Czechia: [14.4378, 50.0755],
  Romania: [26.1025, 44.4268],
  Bulgaria: [23.3219, 42.6977],
};

export const destinationPoints: Record<Destination, MapPoint> = {
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