import type { Metadata } from "next";

import { EntryScreen } from "@/components/EntryScreen";

// Entry page: shown at the site address, before the full site at /home.
// Rendered per request, in the visitor's language (cookie or browser).

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function EntryPage() {
  return <EntryScreen />;
}
