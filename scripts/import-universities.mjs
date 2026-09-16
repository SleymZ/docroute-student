import { createHash } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";

const SOURCE_URL =
  "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";

const LICENSE_URL =
  "https://raw.githubusercontent.com/Hipo/university-domains-list/master/LICENSE.txt";

const REPOSITORY_URL =
  "https://github.com/Hipo/university-domains-list";

const EUROPE_CODES = new Set([
  "AL",
  "AD",
  "AT",
  "BY",
  "BE",
  "BA",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IS",
  "IE",
  "IT",
  "XK",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "MD",
  "MC",
  "ME",
  "NL",
  "MK",
  "NO",
  "PL",
  "PT",
  "RO",
  "RU",
  "SM",
  "RS",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "TR",
  "UA",
  "GB",
  "VA",
]);

async function download(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${url}`,
    );
  }

  return response.text();
}

function getValidWebsite(webPages) {
  if (!Array.isArray(webPages)) {
    return null;
  }

  const validUrls = webPages
    .map((value) => {
      if (typeof value !== "string") {
        return null;
      }

      try {
        const url = new URL(value);

        if (
          url.protocol !== "https:" &&
          url.protocol !== "http:"
        ) {
          return null;
        }

        return url.href;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return (
    validUrls.find((url) => url.startsWith("https:")) ??
    validUrls[0] ??
    null
  );
}

async function main() {
  console.log("Downloading university directory...");

  const [sourceText, licenseText] = await Promise.all([
    download(SOURCE_URL),
    download(LICENSE_URL),
  ]);

  const source = JSON.parse(sourceText);

  if (!Array.isArray(source)) {
    throw new Error("Unexpected university data format.");
  }

  const universities = new Map();

  for (const item of source) {
    const countryCode = String(
      item.alpha_two_code ?? "",
    ).toUpperCase();

    if (!EUROPE_CODES.has(countryCode)) {
      continue;
    }

    const name =
      typeof item.name === "string"
        ? item.name.trim()
        : "";

    const country =
      typeof item.country === "string"
        ? item.country.trim()
        : "";

    const region =
      typeof item["state-province"] === "string"
        ? item["state-province"].trim()
        : null;

    const website = getValidWebsite(item.web_pages);

    if (!name || !country || !website) {
      continue;
    }

    const identity = [
      countryCode,
      name.toLowerCase(),
      new URL(website).hostname.replace(/^www\./, ""),
    ].join("|");

    const id = createHash("sha256")
      .update(identity)
      .digest("hex")
      .slice(0, 20);

    if (!universities.has(id)) {
      universities.set(id, {
        id,
        name,
        country,
        countryCode,
        region,
        website,
        verificationStatus: "unreviewed",
      });
    }
  }

  const result = [...universities.values()].sort(
    (first, second) =>
      first.country.localeCompare(second.country) ||
      first.name.localeCompare(second.name),
  );

  if (result.length === 0) {
    throw new Error("No universities were imported.");
  }

  const output = {
    source: REPOSITORY_URL,
    importedAt: new Date().toISOString(),
    universities: result,
  };

  const dataDirectory = new URL(
    "../src/data/",
    import.meta.url,
  );

  const temporaryFile = new URL(
    "universities.json.tmp",
    dataDirectory,
  );

  const outputFile = new URL(
    "universities.json",
    dataDirectory,
  );

  await mkdir(dataDirectory, { recursive: true });

  await writeFile(
    temporaryFile,
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8",
  );

  await rename(temporaryFile, outputFile);

  await writeFile(
    new URL("universities.LICENSE.txt", dataDirectory),
    licenseText,
    "utf8",
  );

  console.log(
    `Imported ${result.length} European university records.`,
  );

  console.log("Created src/data/universities.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});