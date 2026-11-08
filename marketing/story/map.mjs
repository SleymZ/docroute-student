import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import fs from "node:fs";
const world = JSON.parse(fs.readFileSync("node_modules/world-atlas/countries-50m.json"));
const cs = feature(world, world.objects.countries).features;
const W = 1080, H = 1100;
const proj = geoMercator().center([14, 50]).scale(1150).translate([W / 2, H / 2]).clipExtent([[-40, -40], [W + 40, H + 40]]);
const path = geoPath(proj);
const EU = new Set("008 020 040 056 070 100 112 191 196 203 208 233 246 250 276 300 348 352 372 380 428 438 440 442 470 498 492 499 528 807 578 616 620 642 688 703 705 724 752 756 804 826".split(" "));
const eu = [], other = [];
for (const c of cs) { const d = path(c); if (!d) continue; (EU.has(c.id) || c.properties.name === "Kosovo" ? eu : other).push(d); }
const pt = ll => proj(ll).map(v => Math.round(v));
const ends = { main: pt([13, 49.5]), many: [[2.3, 47], [10, 51], [19, 49.5], [12.5, 42.5], [24, 58.5], [-3.7, 40.4], [16.4, 48.2], [5, 52.2], [21, 52.2]].map(pt) };
fs.writeFileSync(process.argv[2], JSON.stringify({ W, H, eu: eu.join(""), other: other.join(""), ends }));
console.log(eu.length, other.length, JSON.stringify(ends).length, fs.statSync(process.argv[2]).size);
