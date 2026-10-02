import type { Metadata } from "next";

import { Header } from "@/components/Header";
import { ExploreCatalog } from "@/components/ExploreCatalog";

export const metadata: Metadata = {
  title: "Explore European universities",
  description:
    "Browse European universities by destination and study interest, with verified program coverage marked clearly.",
};

export default function ExplorePage() {
  return (
    <main>
      <Header />
      <ExploreCatalog />
    </main>
  );
}
