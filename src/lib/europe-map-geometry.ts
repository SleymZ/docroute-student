import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

// The home map's projection and the outlines it draws. The outlines are
// computed once from world-atlas (countries-50m) by
// `node --experimental-strip-types scripts/europe-map-paths.mjs` and stored
// in src/data/europe-map-paths.json, so browsers do not download the whole
// world (about 800 KB) to draw Europe. A test recomputes them and checks
// the file is identical, so the shape of the map never changes.

export const MAP_WIDTH = 1100;
export const MAP_HEIGHT = 600;

export function mapProjection() {
  return geoMercator()
    .center([16, 50])
    .scale(875)
    .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
    .clipExtent([
      [0, 0],
      [MAP_WIDTH, MAP_HEIGHT],
    ]);
}

/** [id, world-atlas name, SVG path] for every country visible on the map. */
export type CountryPath = [id: string, name: string, path: string];

type WorldTopology = Topology<{ countries: GeometryCollection<{ name: string }> }>;

export function computeCountryPaths(world: unknown): CountryPath[] {
  const topology = world as WorldTopology;
  const pathGenerator = geoPath(mapProjection());
  return feature(topology, topology.objects.countries)
    .features.map((country, index): CountryPath => [
      String(country.id ?? `country-${index}`).padStart(3, "0"),
      country.properties?.name ?? "Country",
      pathGenerator(country) ?? "",
    ])
    .filter((country) => country[2].length > 0);
}
