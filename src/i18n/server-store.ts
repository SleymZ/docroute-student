import { cache } from "react";

import type { Catalog } from "./translate";

// Per-request language for server components: the root layout fills it in
// before the page renders (see layout.tsx). React's cache() is scoped to
// one request on the server.
export const serverCatalogStore = cache((): { catalog: Catalog | null; ready: boolean } => ({
  catalog: null,
  ready: false,
}));
