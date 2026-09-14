import type { Destination } from "@/types/destination";

type CountryDetails = {
  capital: string;
  searchTerms: string;
  zoom: number;
};

export const countryDetails: Record<Destination, CountryDetails> = {
  Slovakia: {
    capital: "Bratislava",
    searchTerms: "slovakia slovensko словакия братислава bratislava",
    zoom: 4,
  },
  Czechia: {
    capital: "Prague",
    searchTerms: "czechia czech republic cesko чехия прага prague",
    zoom: 3.5,
  },
  Romania: {
    capital: "Bucharest",
    searchTerms: "romania румыния бухарест bucharest",
    zoom: 2.7,
  },
  Bulgaria: {
    capital: "Sofia",
    searchTerms: "bulgaria болгария софия sofia",
    zoom: 3.3,
  },
};