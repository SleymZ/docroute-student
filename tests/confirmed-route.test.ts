import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  clampTitle,
  isSameRoute,
  myRouteLoginHref,
  normaliseRoutePath,
} from "../src/lib/confirmed-route";

test("only DocRoute route pages can be stored as My route", () => {
  assert.equal(
    normaliseRoutePath("/route/full?group=uniba-fmfi-computing-bsc-2027&citizenship=IN&status=none"),
    "/route/full?group=uniba-fmfi-computing-bsc-2027&citizenship=IN&status=none",
  );
  for (const bad of [
    "https://evil.example/route/full",
    "//evil.example/route/full",
    "/route//evil.example",
    "/route/\\evil.example",
    "/account",
    "/route/full?x=a b",
    "",
    null,
  ]) {
    assert.equal(normaliseRoutePath(bad), null, String(bad));
  }
});

test("page-only switches are not stored", () => {
  assert.equal(normaliseRoutePath("/route/work?citizenship=IN&edit=1&move=2027-08-01"), "/route/work?citizenship=IN&move=2027-08-01");
});

test("the same route with another move date is still the confirmed route", () => {
  const confirmed = { routePath: "/route/family?a=1&move=2027-08-01" };
  assert.equal(isSameRoute(confirmed, { routePath: "/route/family?move=2027-09-01&a=1" }), true);
  assert.equal(isSameRoute(confirmed, { routePath: "/route/family?a=2&move=2027-08-01" }), false);
  assert.equal(isSameRoute(null, confirmed), false);
});

test("a guide with another citizenship is another route", () => {
  const confirmed = { routePath: "/route/guide?country=DE&purpose=family&citizenship=IN" };
  assert.equal(isSameRoute(confirmed, { routePath: "/route/guide?country=DE&purpose=family&citizenship=UA" }), false);
  assert.equal(isSameRoute(confirmed, { routePath: "/route/guide?country=DE&purpose=family" }), false);
});

test("signing up returns to the same route page", () => {
  assert.equal(myRouteLoginHref("/route/full?group=g&citizenship=IN"), "/auth?mode=signup&next=%2Froute%2Ffull%3Fgroup%3Dg%26citizenship%3DIN");
});

test("titles fit the database limit", () => {
  assert.equal(clampTitle("  A   b "), "A b");
  assert.equal(clampTitle("x".repeat(400)).length, 158);
  assert.equal(clampTitle("   "), "My route");
});

test("the migration keeps rows private and paths on /route/", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261103120000_confirmed_routes.sql", import.meta.url), "utf8");
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table public\.confirmed_routes from anon/);
  assert.match(sql, /route_path like '\/route\/%'/);
  assert.match(sql, /on delete cascade/);
});
