import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import fs from "node:fs";
const world = JSON.parse(fs.readFileSync("node_modules/world-atlas/countries-50m.json"));
const cs = feature(world, world.objects.countries).features;
const W = 1080, H = 1920;
const proj = geoMercator().center([12, 50]).scale(1500).translate([W / 2, 1230]).clipExtent([[-40, 560], [W + 40, H + 40]]);
const path = geoPath(proj);
const all = cs.map(c => path(c)).filter(Boolean).join("");
// the route: Lisbon → Madrid → Paris → Munich → Vienna → Bratislava → High Tatras
const stops = [[-9.14, 38.72], [-3.70, 40.42], [2.35, 48.86], [11.58, 48.14], [16.37, 48.21], [17.11, 48.15], [20.08, 49.18]].map(p => proj(p).map(v => +v.toFixed(1)));
fs.writeFileSync(process.argv[2], JSON.stringify({ all, stops }));
console.log(stops.map(s => s.join(",")).join(" "), fs.statSync(process.argv[2]).size);
