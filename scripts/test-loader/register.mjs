// Registers the TypeScript test loader for `npm test`.
// Node strips types itself (--experimental-strip-types); this loader only
// resolves the `@/` alias and extensionless .ts/.tsx/.json imports.
import { register } from "node:module";

register("./hooks.mjs", import.meta.url);
