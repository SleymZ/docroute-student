// Dot map of Europe and one route for the entry page. Computed on the
// server (the page is static, so this runs once at build time): only the
// finished SVG path strings reach the browser, never the world atlas.
import { geoBounds, geoContains, geoMercator } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
// The coarse 110m atlas is precise enough for 11-unit dots and much faster.
import worldData from "world-atlas/countries-110m.json";

export const LANDING_MAP_WIDTH = 1100;
export const LANDING_MAP_HEIGHT = 600;
// Distance between dots in map units.
export const LANDING_DOT_STEP = 11;

type Point = { x: number; y: number };

const projection = geoMercator()
  .center([16, 50])
  .scale(875)
  .translate([LANDING_MAP_WIDTH / 2, LANDING_MAP_HEIGHT / 2]);

function project(coordinates: [number, number]): Point {
  const point = projection(coordinates);
  if (!point) throw new Error("Unable to project landing map point");
  return { x: Math.round(point[0] * 10) / 10, y: Math.round(point[1] * 10) / 10 };
}

/** One path of zero-length segments; drawn with a round line cap, each
 *  segment becomes a dot. Relative moves keep the string small. */
function buildDots() {
  const topology = worldData as unknown as Topology<{ countries: GeometryCollection }>;
  const countries = feature(topology, topology.objects.countries).features.map((country) => {
    const [[west, south], [east, north]] = geoBounds(country);
    // Countries across the 180th meridian (Russia, Fiji…) have west > east;
    // they skip the quick box test.
    return { country, west, south, east, north, wraps: west > east };
  });

  let path = "";
  let previous: Point | null = null;
  let count = 0;
  for (let y = LANDING_DOT_STEP / 2; y < LANDING_MAP_HEIGHT; y += LANDING_DOT_STEP) {
    for (let x = LANDING_DOT_STEP / 2; x < LANDING_MAP_WIDTH; x += LANDING_DOT_STEP) {
      const location = projection.invert?.([x, y]);
      if (!location) continue;
      const [lon, lat] = location;
      const onLand = countries.some(
        (item) =>
          lat >= item.south - 0.1 &&
          lat <= item.north + 0.1 &&
          (item.wraps
            ? lon >= item.west - 0.1 || lon <= item.east + 0.1
            : lon >= item.west - 0.1 && lon <= item.east + 0.1) &&
          geoContains(item.country, location),
      );
      if (!onLand) continue;
      path += previous
        ? `m${+(x - previous.x).toFixed(1)} ${+(y - previous.y).toFixed(1)}h0`
        : `M${x} ${y}h0`;
      previous = { x, y };
      count += 1;
    }
  }
  return { path, count };
}

// The route comes in from beyond the map's south-east edge, passes a
// waypoint and ends in Bratislava, where DocRoute's verified routes start.
const entry = project([47, 36.2]);
const waypoint = project([26.1, 44.43]);
const destination = project([17.11, 48.15]);

// Two cubic segments: entry → waypoint, then a smooth turn to the
// destination (the second segment's first control point mirrors the first
// segment's last one, as the SVG "S" command does).
const segments: [Point, Point, Point, Point][] = [
  [
    entry,
    { x: entry.x - 70, y: entry.y - 110 },
    { x: waypoint.x + 90, y: waypoint.y + 6 },
    waypoint,
  ],
  [
    waypoint,
    { x: waypoint.x - 90, y: waypoint.y - 6 },
    { x: destination.x + 45, y: destination.y + 34 },
    destination,
  ],
];

const routePath =
  `M${entry.x} ${entry.y} ` +
  segments
    .map(([, c1, c2, end]) => `C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`)
    .join(" ");

function bezier([p0, p1, p2, p3]: [Point, Point, Point, Point], t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

// Points along the route with their share of its total length, so each
// stop can appear when the drawing line reaches it.
const samples: { point: Point; length: number }[] = [];
let travelled = 0;
for (const segment of segments) {
  let last = samples.length ? samples[samples.length - 1].point : segment[0];
  for (let index = samples.length ? 1 : 0; index <= 200; index += 1) {
    const point = bezier(segment, index / 200);
    travelled += Math.hypot(point.x - last.x, point.y - last.y);
    samples.push({ point, length: travelled });
    last = point;
  }
}

function pointAt(share: number) {
  const target = share * travelled;
  const sample = samples.find((item) => item.length >= target) ?? samples[samples.length - 1];
  return {
    x: Math.round(sample.point.x * 10) / 10,
    y: Math.round(sample.point.y * 10) / 10,
  };
}

const dots = buildDots();

export const landingMap = {
  width: LANDING_MAP_WIDTH,
  height: LANDING_MAP_HEIGHT,
  dots: dots.path,
  dotCount: dots.count,
  route: routePath,
  destination,
  // Stages of a route, shown one after another while the line is drawn;
  // `at` is the share of the route's length where each one appears.
  stops: [
    // `side`: which side of the dot the label sits on, chosen so it stays
    // on screen and off the line.
    { label: "Application", at: 0.46, side: "left" as const },
    { label: "Documents", at: 0.76, side: "right" as const },
    { label: "Residence permit", at: 1, side: "left" as const },
  ].map((stop) => ({ ...stop, ...pointAt(stop.at) })),
};
