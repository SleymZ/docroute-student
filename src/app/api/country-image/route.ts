import {
  NextRequest,
  NextResponse,
} from "next/server";

type MetadataValue = {
  value?: string;
};

type CommonsImageInfo = {
  url?: string;
  thumburl?: string;
  mime?: string;
  width?: number;
  height?: number;
  extmetadata?: Record<string, MetadataValue>;
};

type CommonsPage = {
  pageid?: number;
  index?: number;
  title: string;
  imageinfo?: CommonsImageInfo[];
};

type CommonsResponse = {
  query?: {
    pages?: CommonsPage[];
  };
};

type ImageCandidate = {
  page: CommonsPage;
  info: CommonsImageInfo;
};

const placeByCountry: Record<string, string> = {
  slovakia: "Bratislava",
  czechia: "Prague",
  "czech republic": "Prague",
  romania: "Bucharest",
  bulgaria: "Sofia",
  austria: "Vienna",
  germany: "Berlin",
  france: "Paris",
  italy: "Rome",
  spain: "Madrid",
  portugal: "Lisbon",
  netherlands: "Amsterdam",
  belgium: "Brussels",
  poland: "Warsaw",
  hungary: "Budapest",
  croatia: "Zagreb",
  slovenia: "Ljubljana",
  serbia: "Belgrade",
  greece: "Athens",
  finland: "Helsinki",
  sweden: "Stockholm",
  norway: "Oslo",
  denmark: "Copenhagen",
  ireland: "Dublin",
  "united kingdom": "London",
  ukraine: "Kyiv",
  estonia: "Tallinn",
  latvia: "Riga",
  lithuania: "Vilnius",
  switzerland: "Bern",
  luxembourg: "Luxembourg",
  iceland: "Reykjavik",
  malta: "Valletta",
  cyprus: "Nicosia",
  turkey: "Istanbul",
  moldova: "Chișinău",
  albania: "Tirana",
  "north macedonia": "Skopje",
  "bosnia and herzegovina": "Sarajevo",
  montenegro: "Podgorica",
  kosovo: "Pristina",
};

const blockedTitleWords = [
  "logo",
  "flag",
  "map",
  "coat of arms",
  "seal",
  "diagram",
  "locator",
  "icon",
  "symbol",
  "route",
  "metro map",
  "tram map",
  "poster",
  "emblem",
];

function cleanSearchValue(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s.'’-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);

    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function cleanMetadataText(value?: string) {
  if (!value) {
    return null;
  }

  const cleanedValue = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedValue) {
    return null;
  }

  return cleanedValue.slice(0, 120);
}

function normalizeUrl(value?: string) {
  if (!value) {
    return null;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  return value;
}

function isUsableImage(
  page: CommonsPage,
  info: CommonsImageInfo,
) {
  const title = page.title.toLowerCase();

  const containsBlockedWord =
    blockedTitleWords.some((word) =>
      title.includes(word),
    );

  if (containsBlockedWord) {
    return false;
  }

  const supportedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

  if (
    !info.mime ||
    !supportedMimeTypes.has(info.mime)
  ) {
    return false;
  }

  const width = info.width ?? 0;
  const height = info.height ?? 0;

  if (width < 1000 || height < 500) {
    return false;
  }

  const aspectRatio = width / height;

  /*
   * Карточка горизонтальная, поэтому вертикальные
   * изображения и слишком узкие панорамы отбрасываем.
   */
  return aspectRatio >= 1.2 && aspectRatio <= 3.4;
}

async function searchCommons(
  searchQuery: string,
): Promise<ImageCandidate[]> {
  const searchParams = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",

    generator: "search",
    gsrsearch: searchQuery,
    gsrnamespace: "6",
    gsrlimit: "32",
    gsrsort: "relevance",

    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: "1400",

    iiextmetadatalanguage: "en",
    iiextmetadatafilter:
      "Artist|Credit|LicenseShortName|LicenseUrl|UsageTerms",
  });

  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${searchParams.toString()}`,
    {
      headers: {
        "User-Agent":
          "DocRouteStudent/0.1 university discovery project",
      },

      /*
       * Результаты поиска города одинаковые для всех
       * университетов, поэтому кэшируем их на неделю.
       */
      next: {
        revalidate: 60 * 60 * 24 * 7,
      },
    },
  );

  if (!response.ok) {
    return [];
  }

  const data =
    (await response.json()) as CommonsResponse;

  const pages = data.query?.pages ?? [];

  return pages
    .sort(
      (firstPage, secondPage) =>
        (firstPage.index ?? 0) -
        (secondPage.index ?? 0),
    )
    .flatMap((page) => {
      const info = page.imageinfo?.[0];

      if (!info || !isUsableImage(page, info)) {
        return [];
      }

      return [
        {
          page,
          info,
        },
      ];
    });
}

function removeDuplicateImages(
  candidates: ImageCandidate[],
) {
  const uniqueCandidates = new Map<
    string,
    ImageCandidate
  >();

  for (const candidate of candidates) {
    const imageUrl =
      candidate.info.thumburl ??
      candidate.info.url;

    if (!imageUrl) {
      continue;
    }

    if (!uniqueCandidates.has(imageUrl)) {
      uniqueCandidates.set(imageUrl, candidate);
    }
  }

  return [...uniqueCandidates.values()];
}

function emptyResponse() {
  return NextResponse.json(
    {
      imageUrl: null,
      sourcePage: null,
      author: null,
      license: null,
      licenseUrl: null,
      label: null,
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

export async function GET(
  request: NextRequest,
) {
  const rawCountry =
    request.nextUrl.searchParams.get("country");

  const rawSeed =
    request.nextUrl.searchParams.get("seed");

  if (!rawCountry || !rawSeed) {
    return NextResponse.json(
      {
        error:
          "Country and seed parameters are required.",
      },
      {
        status: 400,
      },
    );
  }

  const country = cleanSearchValue(rawCountry);
  const seed = rawSeed.trim().slice(0, 200);

  if (!country || !seed) {
    return NextResponse.json(
      {
        error: "Invalid country or seed.",
      },
      {
        status: 400,
      },
    );
  }

  const place =
    placeByCountry[country.toLowerCase()] ??
    country;

  try {
    /*
     * Обычно первого поиска достаточно.
     * Дополнительные запросы используются только тогда,
     * когда Wikimedia нашла слишком мало вариантов.
     */
    let candidates = await searchCommons(
      `${place} skyline`,
    );

    if (candidates.length < 8) {
      const cityscapeCandidates =
        await searchCommons(
          `${place} cityscape architecture`,
        );

      candidates = [
        ...candidates,
        ...cityscapeCandidates,
      ];
    }

    if (candidates.length < 5) {
      const universityCandidates =
        await searchCommons(
          `${country} university campus`,
        );

      candidates = [
        ...candidates,
        ...universityCandidates,
      ];
    }

    const uniqueCandidates =
      removeDuplicateImages(candidates);

    if (uniqueCandidates.length === 0) {
      return emptyResponse();
    }

    /*
     * Разные названия университетов дают разные индексы.
     * Одно и то же название всегда получает одинаковое фото.
     */
    const imageIndex =
      hashString(`${country}:${seed}`) %
      uniqueCandidates.length;

    const selectedCandidate =
      uniqueCandidates[imageIndex];

    const imageInfo =
      selectedCandidate.info;

    const metadata =
      imageInfo.extmetadata ?? {};

    const imageUrl =
      imageInfo.thumburl ??
      imageInfo.url ??
      null;

    const sourcePage =
      `https://commons.wikimedia.org/wiki/` +
      encodeURIComponent(
        selectedCandidate.page.title.replaceAll(
          " ",
          "_",
        ),
      );

    const author =
      cleanMetadataText(
        metadata.Artist?.value,
      ) ??
      cleanMetadataText(
        metadata.Credit?.value,
      );

    const license =
      cleanMetadataText(
        metadata.LicenseShortName?.value,
      ) ??
      cleanMetadataText(
        metadata.UsageTerms?.value,
      );

    const licenseUrl = normalizeUrl(
      metadata.LicenseUrl?.value,
    );

    return NextResponse.json(
      {
        imageUrl,
        sourcePage,
        author,
        license,
        licenseUrl,
        label: `${place} city visual`,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=604800, stale-while-revalidate=2592000",
        },
      },
    );
  } catch (error) {
    console.error(
      "Could not load a country fallback image:",
      error,
    );

    return emptyResponse();
  }
}