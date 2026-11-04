import type { Metadata } from "next";

import { EntryScreen } from "@/components/EntryScreen";

// Entry page: shown at the site address, before the full site at /home.
// Static, so the dot map is computed once at build time.
export const dynamic = "force-static";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function EntryPage() {
  return <EntryScreen />;
}
