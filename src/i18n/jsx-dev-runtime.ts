// Development twin of jsx-runtime.ts (Next uses it in `next dev`).
import { jsxDEV as reactJsxDEV } from "react/jsx-dev-runtime";

import { transform } from "./jsx-runtime";

export { Fragment } from "react/jsx-runtime";
export type { JSX } from "react/jsx-runtime";

type DevArgs = Parameters<typeof reactJsxDEV>;

export function jsxDEV(type: DevArgs[0], props: DevArgs[1], key: DevArgs[2], isStatic: DevArgs[3], source?: DevArgs[4], self?: DevArgs[5]) {
  const result = transform(type, props as Record<string, unknown>);
  if (result.element) {
    const inner = (result.element as { type: DevArgs[0]; props: DevArgs[1] });
    return reactJsxDEV(inner.type, inner.props, key, isStatic, source, self);
  }
  const next = result.props as DevArgs[1];
  // When the runtime replaced the children, they are static only if they
  // are still an array (a translated sentence with links), not when they
  // became one string or one Tr element.
  const staticChildren = next === props ? isStatic : Array.isArray((next as { children?: unknown })?.children);
  return reactJsxDEV(type, next, key, staticChildren, source, self);
}
