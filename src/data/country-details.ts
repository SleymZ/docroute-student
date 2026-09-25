import type { Destination } from "@/types/destination";

type CountryDetails = {
  code: string;
  flag: string;
  capital: string;
  region: string;
  language: string;
  studentCities: readonly string[];
  description: string;
  searchTerms: string;
  zoom: number;
};

export const countryDetails: Record<
  Destination,
  CountryDetails
> = {
  Slovakia: {
    code: "SK",
    flag: "🇸🇰",
    capital: "Bratislava",
    region: "Central Europe",
    language: "Slovak",
    studentCities: ["Bratislava", "Košice", "Martin"],
    description:
      "A compact Central European destination with several university cities to explore. Compare programmes first, then build one clear route from admission documents to residence steps.",
    searchTerms:
      "slovakia slovensko словакия братислава bratislava",
    zoom: 2.05,
  },

  Czechia: {
    code: "CZ",
    flag: "🇨🇿",
    capital: "Prague",
    region: "Central Europe",
    language: "Czech",
    studentCities: ["Prague", "Brno", "Olomouc"],
    description:
      "Explore universities across historic student cities and modern academic centres. Compare your options before opening the exact document route for a programme.",
    searchTerms:
      "czechia czech republic cesko чехия прага prague",
    zoom: 1.95,
  },

  Romania: {
    code: "RO",
    flag: "🇷🇴",
    capital: "Bucharest",
    region: "Southeastern Europe",
    language: "Romanian",
    studentCities: ["Bucharest", "Cluj-Napoca", "Iași"],
    description:
      "Romania offers a broad university landscape across several major cities. Start with your subject, compare universities and then inspect their verified admission requirements.",
    searchTerms:
      "romania румыния бухарест bucharest",
    zoom: 1.72,
  },

  Bulgaria: {
    code: "BG",
    flag: "🇧🇬",
    capital: "Sofia",
    region: "Southeastern Europe",
    language: "Bulgarian",
    studentCities: ["Sofia", "Plovdiv", "Varna"],
    description:
      "Compare programmes across Bulgaria’s main university cities. DocRoute connects university discovery with the documents and residence steps that follow.",
    searchTerms:
      "bulgaria болгария софия sofia",
    zoom: 1.85,
  },
};