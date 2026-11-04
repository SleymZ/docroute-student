import { existsSync, statSync } from "node:fs";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = process.env.REPO_ROOT
  ? resolvePath(process.env.REPO_ROOT)
  : resolvePath(dirname(fileURLToPath(import.meta.url)), "../..");
const srcRoot = join(repoRoot, "src");
const extensions = [".ts", ".tsx", ".json", ".mjs", ".js"];

function findFile(base) {
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const ext of extensions) {
    if (existsSync(base + ext)) return base + ext;
  }
  for (const ext of extensions) {
    const index = join(base, `index${ext}`);
    if (existsSync(index)) return index;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let base = null;
  if (specifier.startsWith("@/")) {
    base = join(srcRoot, specifier.slice(2));
  } else if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL?.startsWith("file:")
  ) {
    base = resolvePath(dirname(fileURLToPath(context.parentURL)), specifier);
  }
  if (base) {
    const file = findFile(base);
    if (file) {
      const url = pathToFileURL(file).href;
      if (file.endsWith(".json")) {
        return {
          url,
          format: "json",
          importAttributes: { ...context.importAttributes, type: "json" },
          shortCircuit: true,
        };
      }
      return nextResolve(url, context);
    }
  }
  return nextResolve(specifier, context);
}
