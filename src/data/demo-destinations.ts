import { countryPages } from "@/lib/country-list";
import type {
  Destination,
  DestinationPreview,
} from "@/types/destination";

// Временные числа для проверки интерфейса.
// Это не реальные требования университетов или миграционных служб.
export const demoDestinations: Record<Destination, DestinationPreview> = {
  Slovakia: {
    sourceDocuments: 12,
    requirements: 31,
  },
  Czechia: {
    sourceDocuments: 12,
    requirements: 28,
  },
  Austria: {
    sourceDocuments: 9,
    requirements: 20,
  },
  Romania: {
    sourceDocuments: 12,
    requirements: 34,
  },
  Bulgaria: {
    sourceDocuments: 12,
    requirements: 30,
  },
};

// Every country with a page (all EU countries and Switzerland) in the
// route form, the three with verified routes first. The map keeps its five
// featured destinations above (owner decision: map unchanged).
export const plannerDestinationOptions: string[] = [
  "Slovakia",
  "Czechia",
  "Austria",
  ...countryPages.map((item) => item.name).filter((name) => !["Slovakia", "Czechia", "Austria"].includes(name)),
];

export const plannerDestinationCodes: Record<string, string> = Object.fromEntries(
  countryPages.map((item) => [item.name, item.code]),
);

export function isFeaturedDestination(value: string): value is Destination {
  return (destinationOptions as readonly string[]).includes(value);
}

export const destinationOptions: Destination[] = [
  "Slovakia",
  "Czechia",
  "Austria",
  "Romania",
  "Bulgaria",
];

export const programOptions = [
  "Medicine",
  "Law",
  "Economics & Business",
  "Computer Science",
];