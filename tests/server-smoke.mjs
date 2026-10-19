import assert from "node:assert/strict";
import { spawn } from "node:child_process";

// Run after npm run build. No Supabase credentials or external writes are used.
// This checks production server output; it does not replace a browser UI test.
const port = process.env.SMOKE_TEST_PORT ?? "3031";
const base = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    port,
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);

try {
  await new Promise((resolve, reject) => {
    let log = "";
    const timer = setTimeout(
      () => reject(new Error(`Server startup timed out: ${log}`)),
      15000,
    );
    const read = (chunk) => {
      log += chunk.toString();
      if (log.includes("Ready in")) {
        clearTimeout(timer);
        resolve();
      }
    };
    server.stdout.on("data", read);
    server.stderr.on("data", read);
    server.once("error", reject);
    server.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited (${code}): ${log}`));
    });
  });

  const params = new URLSearchParams({
    country: "SK",
    program: "Computer Science",
    degree: "bachelor",
    intake: "2027/28",
    citizenship: "IL",
    educationCountry: "SK",
    residenceStatus: "destination-residence",
    educationStatus: "final-year",
    gradeScale: "slovak-1-5",
  });
  params.append("lang", "en|C1|1|certificate|IELTS");
  params.append("lang", "sk|B1|1|none|");
  params.append("lang", "ru|native|0|none|");

  async function html(path) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    return response.text();
  }

  const results = await html(`/route/universities?${params}`);
  assert.ok(results.includes("Current profile options"));
  const links = [
    ...results.matchAll(/<a[^>]+href="([^"]+)"[^>]*>See my requirements/g),
  ].map((match) => match[1].replaceAll("&amp;", "&"));
  assert.equal(links.length, 4);
  const linked = new URL(links[0], base);
  assert.equal(linked.searchParams.get("flow"), "route");
  assert.equal(linked.searchParams.getAll("lang").length, 3);

  const detail = await html(links[0]);
  for (const text of [
    "Documents that apply to you",
    "Published entry conditions",
    "Final secondary-school graduation certificate",
    "2026-10-19",
  ]) {
    assert.ok(detail.includes(text), text);
  }
  const preview = await html(`/route/preview?${linked.searchParams}`);
  assert.ok(preview.includes("Complete language and entrance requirements"));
  assert.ok(preview.includes("Final secondary-school graduation certificate"));

  const onlyEnglish = new URLSearchParams(params);
  onlyEnglish.delete("lang");
  onlyEnglish.append("lang", "en|C1|1|certificate|IELTS");
  assert.ok(
    (await html(`/route/universities?${onlyEnglish}`)).includes(
      "No current profile options yet",
    ),
  );

  const master = new URLSearchParams(params);
  master.set("degree", "master");
  assert.ok(
    (await html(`/route/universities?${master}`)).includes(
      "No verified route matches this profile yet",
    ),
  );
  assert.ok(
    (
      await html(
        `/route/preview?${master}&programId=uniza-fri-informatics-bsc-2027`,
      )
    ).includes("Your route needs a compatible, current program"),
  );
  console.log(
    "PASS: production SSR results → sourced requirements → preview; four profile-preserving links; English-only gaps, unsupported degree and mismatched-preview guards.",
  );
} finally {
  server.kill("SIGTERM");
}
