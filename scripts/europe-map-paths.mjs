// Regenerates src/data/europe-map-paths.json from world-atlas.
// Run: node --experimental-strip-types scripts/europe-map-paths.mjs
import { readFileSync, writeFileSync } from "node:fs";

import { computeCountryPaths } from "../src/lib/europe-map-geometry.ts";

const world = JSON.parse(readFileSync("node_modules/world-atlas/countries-50m.json", "utf8"));
const paths = computeCountryPaths(world);
writeFileSync("src/data/europe-map-paths.json", `${JSON.stringify(paths)}\n`);
console.log(`${paths.length} countries`);
