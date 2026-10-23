import assert from "node:assert/strict";
import { test } from "node:test";

import { planUserSetSync } from "../src/lib/user-set-sync";

const none = new Map<string, boolean>();

test("an item removed on another device is not re-added from a stale cache", () => {
  // The server no longer has "task-b"; this device's cache still did.
  // The cache is not an input, so nothing is re-uploaded.
  const plan = planUserSetSync(new Set(["task-a"]), new Set(), none);
  assert.deepEqual([...plan.merged], ["task-a"]);
  assert.deepEqual(plan.toAdd, []);
  assert.deepEqual(plan.toRemove, []);
});

test("guest progress made before signing in is uploaded once", () => {
  const plan = planUserSetSync(
    new Set(["task-a"]),
    new Set(["task-a", "task-c"]),
    none,
  );
  assert.deepEqual([...plan.merged].sort(), ["task-a", "task-c"]);
  assert.deepEqual(plan.toAdd, ["task-c"]);
});

test("toggles made while loading win over server and guest data", () => {
  const plan = planUserSetSync(
    new Set(["task-a", "task-b"]),
    new Set(["task-c"]),
    new Map([
      ["task-a", false],
      ["task-c", false],
      ["task-d", true],
    ]),
  );
  assert.deepEqual([...plan.merged].sort(), ["task-b", "task-d"]);
  assert.deepEqual(plan.toAdd, ["task-d"]);
  assert.deepEqual(plan.toRemove, ["task-a"]);
});

test("an unchanged set produces no writes", () => {
  const plan = planUserSetSync(new Set(["x", "y"]), new Set(["y"]), none);
  assert.deepEqual(plan.toAdd, []);
  assert.deepEqual(plan.toRemove, []);
});
