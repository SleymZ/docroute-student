import {
  germanyVisaFreeLongStay,
  germanyVisaFreeLongStayNoWork,
  netherlandsMvvExempt,
} from "@/data/citizenship-lists";
import { chinaNationalityNote, chinaNotes } from "@/data/china-notes";
import { citizenshipName, citizenshipStage } from "@/data/citizenship-notes";
import { russiaBelarusNotes } from "@/data/russia-belarus";
import type { RouteSource } from "@/types/route-preview";

// The shortest summary of how a passport changes the move to one country,
// shown on the country pages: own citizens, EU/EEA/Swiss free movement
// (easier), nationalities with an official long-stay relief (easier),
// passports with extra national restrictions (harder) and everyone else
// (standard). The full steps stay in the routes, which add the same notes.

export const PASSPORT_TRACK_CHECKED = "2026-11-05";

export type TrackKind = "own" | "eu" | "easier" | "standard" | "harder";

export type PassportTrack = {
  kind: TrackKind;
  label: string;
  title: string;
  points: Array<{ text: string; sources: RouteSource[] }>;
};

const euEeaSwiss = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "CH",
]);

const yourEurope: RouteSource = {
  id: "eu-youreurope-residence-rights",
  title: "Residence rights when living abroad in the EU",
  publisher: "Your Europe, European Union",
  url: "https://europa.eu/youreurope/citizens/residence/residence-rights/index_en.htm",
  checkedAt: PASSPORT_TRACK_CHECKED,
  authority: "official",
};

const swissWork: RouteSource = {
  id: "ch-chch-working-eu-efta",
  title: "Working in Switzerland as a foreign national (EU/EFTA citizens)",
  publisher: "Swiss Confederation, ch.ch",
  url: "https://www.ch.ch/en/foreign-nationals-in-switzerland/working-in-switzerland/",
  checkedAt: PASSPORT_TRACK_CHECKED,
  authority: "official",
};

const germanyFaq: RouteSource = {
  id: "de-aa-visa-free-apply",
  title: "Do I need a visa if I want to study/work in Germany?",
  publisher: "Federal Foreign Office (Auswärtiges Amt)",
  url: "https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/02-arbeiten/606704",
  checkedAt: PASSPORT_TRACK_CHECKED,
  authority: "official",
};

const netherlandsMvv: RouteSource = {
  id: "nl-ind-mvv-exemptions",
  title: "MVV exemptions (last update 6 May 2026)",
  publisher: "Immigration and Naturalisation Service (IND)",
  url: "https://ind.nl/en/mvv-exemptions",
  checkedAt: "2026-11-02",
  authority: "official",
};

const labels: Record<TrackKind, string> = {
  own: "Your own country",
  eu: "Easier: free movement",
  easier: "Easier for your passport",
  standard: "Standard route",
  harder: "Harder: extra restrictions",
};

export function isEuEeaSwiss(code: string) {
  return euEeaSwiss.has(code.toUpperCase());
}

export function passportTrack(citizenship: string, destination: string, destinationName: string): PassportTrack | null {
  const code = citizenship.toUpperCase();
  const country = destination.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  const name = citizenshipName(code);

  if (code === country) {
    return {
      kind: "own",
      label: labels.own,
      title: `You are a citizen of ${destinationName}`,
      points: [{ text: "No visa or residence permit is needed. Use the study pages for universities.", sources: [] }],
    };
  }

  if (euEeaSwiss.has(code) && country === "CH") {
    return {
      kind: "eu",
      label: labels.eu,
      title: `Free movement for citizens of ${name}, with a Swiss permit`,
      points: [
        {
          text: "Work up to 3 months: no residence permit, but your employer notifies the authorities at least a day before you start. Longer employment: apply for a residence permit at your commune before you start work (ID or passport and your contract).",
          sources: [swissWork],
        },
        {
          text: "Self-employed: register your arrival within 14 days, then apply for a residence permit at your commune and show you can support yourself. Job seekers: up to 6 months, no permit for the first 3.",
          sources: [swissWork],
        },
      ],
    };
  }

  if (euEeaSwiss.has(code)) {
    return {
      kind: "eu",
      label: labels.eu,
      title: `Free movement for citizens of ${name}`,
      points: [
        {
          text: `You may live in ${destinationName} as a worker, student, jobseeker or pensioner without a visa or residence permit. Up to 3 months you need no registration (some countries ask you to report your presence); for longer stays you may need to register your residence.`,
          sources: [yourEurope],
        },
        { text: "After five years of legal residence you acquire the right of permanent residence.", sources: [yourEurope] },
      ],
    };
  }

  const restrictions = russiaBelarusNotes(code, country);
  if (restrictions.length) {
    const national = restrictions.filter((item) => !item.id.startsWith("ru-eu-"));
    return {
      kind: "harder",
      label: labels.harder,
      title: national.length
        ? `${destinationName} adds restrictions for citizens of ${name}`
        : `Extra EU rules for citizens of ${name}`,
      points: restrictions.map((item) => ({ text: `${item.title}. ${item.description}`, sources: item.sources })),
    };
  }

  const points: PassportTrack["points"] = [];
  let easier = false;
  if (country === "DE" && (germanyVisaFreeLongStay.includes(code) || germanyVisaFreeLongStayNoWork.includes(code))) {
    easier = true;
    points.push({
      text: germanyVisaFreeLongStayNoWork.includes(code)
        ? "You may enter Germany without a visa and apply for the residence permit there, but only if you do not intend to take up employment."
        : "You may enter Germany without a visa and apply for the residence permit there, instead of getting a visa first.",
      sources: [germanyFaq],
    });
  }
  if (country === "NL" && netherlandsMvvExempt.includes(code)) {
    easier = true;
    points.push({
      text: "You do not need a provisional residence permit (MVV) to enter the Netherlands for a long stay; you still apply for the residence permit.",
      sources: [netherlandsMvv],
    });
  }
  // The entry note is the same one the routes add (citizenship-notes.ts), so
  // Ireland's own list, Switzerland's long-stay list and the biometric-
  // passport condition stay consistent with the route behind the link.
  // Germany and the Netherlands already got their own relief above.
  if (!easier) {
    const stage = citizenshipStage(code, country, destinationName, "work");
    const visa = stage?.stage.tasks.find((task) => task.id.startsWith("citizen-visa"));
    if (visa && stage) {
      points.push({
        text: `${visa.title}. ${visa.description}`,
        sources: stage.sources.filter((source) => visa.sourceIds.includes(source.id)),
      });
    }
  }
  // China: the extra steps on applying from China, for any purpose (the
  // routes add only the ones for the chosen purpose).
  if (code === "CN") {
    const seen = new Set<string>();
    for (const purpose of ["study", "work"] as const) {
      for (const item of chinaNotes(country, purpose)) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        points.push({ text: `${item.title}. ${item.description}`, sources: item.sources });
      }
    }
    const nationality = chinaNationalityNote();
    points.push({ text: `${nationality.title}. ${nationality.description}`, sources: nationality.sources });
  }
  if (!points.length) return null;

  return {
    kind: easier ? "easier" : "standard",
    label: easier ? labels.easier : labels.standard,
    title: easier ? `A lighter entry for citizens of ${name}` : `The standard route for citizens of ${name}`,
    points,
  };
}
