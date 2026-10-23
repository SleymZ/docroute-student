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
  assert.match(preview, /<a[^>]+href="\/route\/profile\?[^"]*lang=[^"]*"[^>]*>Edit my profile/);

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
  // A non-null match with canBuildRoute: false must not expose any Preview link
  // (hero or sidebar); it sends people to edit a profile that keeps their data.
  const blockedDetailParams = new URLSearchParams(master);
  blockedDetailParams.set("flow", "route");
  blockedDetailParams.set("programId", "uniza-fri-informatics-bsc-2027");
  const blockedDetail = await html(
    `/universities/b8b5a2e3a15148e5b4a1?${blockedDetailParams}`,
  );
  assert.ok(blockedDetail.includes('content="noindex, nofollow"'));
  assert.ok(!blockedDetail.includes('href="/route/preview'));
  assert.ok(!blockedDetail.includes("Open Preview Route"));
  assert.ok(!blockedDetail.includes("Preview my route"));
  const editLinks = [
    ...blockedDetail.matchAll(/<a[^>]+href="(\/route\/profile[^"]*)"[^>]*>Edit my profile/g),
  ].map((match) => new URL(match[1].replaceAll("&amp;", "&"), base));
  assert.equal(editLinks.length, 2);
  for (const editLink of editLinks) {
    assert.equal(editLink.searchParams.get("degree"), "master");
    assert.equal(editLink.searchParams.get("citizenship"), "IL");
    assert.equal(editLink.searchParams.getAll("lang").length, 3);
  }

  const openDetail = await html(links[0]);
  const previewLinks = [
    ...openDetail.matchAll(/<a[^>]+href="(\/route\/preview[^"]*)"/g),
  ];
  assert.equal(previewLinks.length, 2);

  console.log(
    "PASS: production SSR results → sourced requirements → preview; four profile-preserving links; English-only gaps, unsupported degree and mismatched-preview guards; university page gates every Preview link on canBuildRoute.",
  );
} finally {
  server.kill("SIGTERM");
}
