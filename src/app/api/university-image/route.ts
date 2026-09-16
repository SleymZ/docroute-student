import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CACHE_SECONDS = 60 * 60 * 24 * 30;

type WikidataSearchItem = {
  id: string;
  label: string;
  description?: string;
};

type WikidataSearchResponse = {
  search?: WikidataSearchItem[];
};

type WikidataClaim = {
  mainsnak?: {
    datavalue?: {
      value?: unknown;
    };
  };
};

type WikidataEntity = {
  claims?: {
    P18?: WikidataClaim[];
  };
};

type WikidataEntitiesResponse = {
  entities?: Record<string, WikidataEntity>;
};

type CommonsMetadataValue = {
  value?: string;
};

type CommonsImageInfo = {
  url?: string;
  thumburl?: string;
  descriptionurl?: string;
  extmetadata?: Record<string, CommonsMetadataValue>;
};

type CommonsResponse = {
  query?: {
    pages?: Record<
      string,
      {
        imageinfo?: CommonsImageInfo[];
      }
    >;
  };
};

type UniversityImageResponse = {
  imageUrl: string | null;
  sourcePage: string | null;
  author: string | null;
  license: string | null;
  licenseUrl: string | null;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function stripHtml(value?: string) {
  if (!value) {
    return null;
  }

  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function scoreCandidate(
  candidate: WikidataSearchItem,
  universityName: string,
  country: string,
) {
  const label = normalize(candidate.label);
  const description = normalize(candidate.description ?? "");
  const targetName = normalize(universityName);
  const targetCountry = normalize(country);

  let score = 0;

  if (label === targetName) {
    score += 100;
  } else if (
    label.includes(targetName) ||
    targetName.includes(label)
  ) {
    score += 45;
  }

  if (
    /university|college|academy|institute|higher education/.test(
      description,
    )
  ) {
    score += 30;
  }

  if (
    targetCountry &&
    description.includes(targetCountry)
  ) {
    score += 20;
  }

  return score;
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "DocRouteStudent/0.1 (https://github.com/SleymZ/docroute-student)",
    },
    next: {
      revalidate: CACHE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(
      `External API returned ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

function createResponse(
  data: UniversityImageResponse,
  maxAge = CACHE_SECONDS,
) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=604800`,
    },
  });
}

function emptyResponse() {
  return createResponse(
    {
      imageUrl: null,
      sourcePage: null,
      author: null,
      license: null,
      licenseUrl: null,
    },
    60 * 60 * 24,
  );
}

export async function GET(request: NextRequest) {
  const universityName =
    request.nextUrl.searchParams.get("name")?.trim() ?? "";

  const country =
    request.nextUrl.searchParams.get("country")?.trim() ?? "";

  if (!universityName || universityName.length > 180) {
    return NextResponse.json(
      {
        error: "A valid university name is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const searchUrl = new URL(
      "https://www.wikidata.org/w/api.php",
    );

    searchUrl.searchParams.set(
      "action",
      "wbsearchentities",
    );
    searchUrl.searchParams.set("search", universityName);
    searchUrl.searchParams.set("language", "en");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("limit", "8");

    const searchResult =
      await fetchJson<WikidataSearchResponse>(searchUrl);

    const candidates = [...(searchResult.search ?? [])]
      .map((candidate) => ({
        ...candidate,
        score: scoreCandidate(
          candidate,
          universityName,
          country,
        ),
      }))
      .filter((candidate) => candidate.score >= 30)
      .sort((a, b) => b.score - a.score);

    if (candidates.length === 0) {
      return emptyResponse();
    }

    const entitiesUrl = new URL(
      "https://www.wikidata.org/w/api.php",
    );

    entitiesUrl.searchParams.set(
      "action",
      "wbgetentities",
    );
    entitiesUrl.searchParams.set(
      "ids",
      candidates.map((candidate) => candidate.id).join("|"),
    );
    entitiesUrl.searchParams.set("props", "claims");
    entitiesUrl.searchParams.set("format", "json");

    const entitiesResult =
      await fetchJson<WikidataEntitiesResponse>(
        entitiesUrl,
      );

    let fileName: string | null = null;

    for (const candidate of candidates) {
      const value =
        entitiesResult.entities?.[
          candidate.id
        ]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;

      if (typeof value === "string" && value) {
        fileName = value;
        break;
      }
    }

    if (!fileName) {
      return emptyResponse();
    }

    const commonsUrl = new URL(
      "https://commons.wikimedia.org/w/api.php",
    );

    commonsUrl.searchParams.set("action", "query");
    commonsUrl.searchParams.set("prop", "imageinfo");
    commonsUrl.searchParams.set(
      "iiprop",
      "url|extmetadata",
    );
    commonsUrl.searchParams.set("iiurlwidth", "1400");
    commonsUrl.searchParams.set(
      "titles",
      `File:${fileName}`,
    );
    commonsUrl.searchParams.set("format", "json");

    const commonsResult =
      await fetchJson<CommonsResponse>(commonsUrl);

    const pages = commonsResult.query?.pages;
    const page = pages
      ? Object.values(pages)[0]
      : undefined;

    const imageInfo = page?.imageinfo?.[0];

    if (!imageInfo) {
      return emptyResponse();
    }

    const metadata = imageInfo.extmetadata;

    return createResponse({
      imageUrl:
        imageInfo.thumburl ?? imageInfo.url ?? null,
      sourcePage: imageInfo.descriptionurl ?? null,
      author: stripHtml(metadata?.Artist?.value),
      license:
        stripHtml(metadata?.LicenseShortName?.value),
      licenseUrl:
        metadata?.LicenseUrl?.value ?? null,
    });
  } catch (error) {
    console.error(
      "University image lookup failed:",
      error,
    );

    return emptyResponse();
  }
}