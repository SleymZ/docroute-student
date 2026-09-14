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
  Romania: {
    sourceDocuments: 12,
    requirements: 34,
  },
  Bulgaria: {
    sourceDocuments: 12,
    requirements: 30,
  },
};

export const destinationOptions: Destination[] = [
  "Slovakia",
  "Czechia",
  "Romania",
  "Bulgaria",
];

export const documentCountryOptions = [
  "Israel",
  "Ukraine",
  "India",
  "United Kingdom",
  "Other country",
];

export const programOptions = [
  "Medicine",
  "Dentistry",
  "Pharmacy",
  "Computer Science",
];