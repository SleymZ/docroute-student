// Builds the phone home map (PhoneHero) as three static SVG masks from
// src/data/europe-map-paths.json: every country, the highlighted ones, and
// the two with a checked study route. The page colours them with CSS
// (mask-image), so the map follows the site theme and adds nothing to the
// HTML. Run: node --experimental-strip-types scripts/phone-map-masks.mjs
import { readFileSync, writeFileSync } from "node:fs";

import { highlightedCountryIds } from "../src/data/highlighted-countries.ts";

export const PHONE_VIEW = { x: 130, y: 60, w: 640, h: 520 };
const STUDY_ROUTE = new Set(["703", "203"]); // Slovakia, Czechia

const paths = JSON.parse(readFileSync("src/data/europe-map-paths.json", "utf8"));
const inView = (x, y) => x >= PHONE_VIEW.x - 20 && x <= PHONE_VIEW.x + PHONE_VIEW.w + 20 && y >= PHONE_VIEW.y - 20 && y <= PHONE_VIEW.y + PHONE_VIEW.h + 20;

// Whole units, no repeated points, no islands under 2 units or outside the crop.
function simplify(d) {
  return d
    .split(/(?=M)/)
    .map((ring) => {
      const points = [...ring.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => [Math.round(+m[1]), Math.round(+m[2])]);
      const unique = points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]);
      const xs = unique.map((p) => p[0]);
      const ys = unique.map((p) => p[1]);
      const big = Math.max(...xs) - Math.min(...xs) >= 2 || Math.max(...ys) - Math.min(...ys) >= 2;
      if (unique.length < 3 || !big || !unique.some(([x, y]) => inView(x, y))) return "";
      return `M${unique.map((p) => p.join(",")).join("L")}Z`;
    })
    .join("");
}

// Luminance masks: countries white, borders black, so the borders stay
// visible as gaps between the coloured countries.
function write(file, pick) {
  const body = paths
    .filter(([id]) => pick(id))
    .map(([, , d]) => simplify(d))
    .filter(Boolean)
    .join("");
  const { x, y, w, h } = PHONE_VIEW;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/><path d="${body}" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>\n`;
  writeFileSync(file, svg);
  console.log(file, svg.length);
}

write("public/map/phone-europe.svg", () => true);
write("public/map/phone-listed.svg", (id) => highlightedCountryIds.has(id));
write("public/map/phone-route.svg", (id) => STUDY_ROUTE.has(id));
