// Collects every piece of English text the site can show, in the form the
// JSX runtime looks it up (src/i18n/translate.ts): whitespace collapsed,
// variables as {0}, {1}…, inline elements as <0/>, <1/>…
// Usage: node scripts/i18n/extract.mjs [out.json]  → { key: [files] }
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.env.REPO_ROOT ?? process.cwd();
const skipFiles = [/src\/data\/universities\.json$/, /src\/i18n\//, /\.test\.ts$/, /src\/app\/api\//, /src\/lib\/supabase\//];
// Properties whose values are names, identifiers or citations, not prose.
const skipProps = new Set([
  "id", "key", "href", "url", "src", "slug", "className", "class", "style", "type", "name", "rel", "target", "method",
  "role", "htmlFor", "autoComplete", "inputMode", "variant", "icon", "as", "lang", "dir", "fill", "stroke",
  "d", "viewBox", "xmlns", "publisher", "authority", "checkedAt", "code", "countryCode", "value", "university",
  "universityName", "faculty", "facultyName", "programName", "programmeName", "nativeName", "localName", "email",
  "website", "sourceIds", "sourceId", "group", "color", "tone", "status", "kind", "field", "level", "mode", "path",
  "image", "alt-src", "domain", "route", "query", "param", "format", "locale", "data-print-hide", "accept", "pattern",
  "transform", "points", "x", "y", "cx", "cy", "r", "width", "height", "strokeWidth", "strokeLinecap", "strokeLinejoin",
  "gradientUnits", "offset", "stopColor", "fillRule", "clipRule", "markerEnd", "preserveAspectRatio", "version",
  "city", "shortName", "abbreviation", "acronym", "titleNative", "originalTitle",
]);
const skipCalls = /^(require|import|getElementById|querySelector|querySelectorAll|from|eq|neq|select|order|in|is|ilike|like|rpc|single|maybeSingle|insert|update|upsert|delete|cookies|get|set|has|getItem|setItem|removeItem|addEventListener|removeEventListener|matchMedia|test|match|replace|split|startsWith|endsWith|includes|indexOf|join|padStart|toLocaleString|format|DateTimeFormat|NumberFormat|DisplayNames|fetch|redirect|URL|URLSearchParams|append|searchParams|createElement|setAttribute|getAttribute|removeAttribute|dispatchEvent|Event|CustomEvent|Error|TypeError|log|warn|error|info|debug|assert|parse|stringify|filter|map|find|some|every|sort|localeCompare|push|channel|on|storage|bucket|upload|download|remove|createSignedUrl|getPublicUrl|signInWithOAuth|signInWithPassword|signUp|resetPasswordForEmail|exchangeCodeForSession|exec|RegExp|notFound|permanentRedirect|revalidatePath|toUpperCase|toLowerCase|trim|slice|substring|at|charAt|normalize|encodeURIComponent|decodeURIComponent|Intl|header|headers|json|text|blob|setHeader|Response|NextResponse|rewrite|next|cache|Symbol|Number|Boolean|String|Date|keys|values|entries|freeze|create|assign|defineProperty|structuredClone|postMessage|open|close|write|scrollIntoView|focus|blur|click|submit|reset|preventDefault|startTransition|useState|useRef|useMemo|useCallback|useId|useEffect|useContext|createContext|localFont|Inter|Geist_Mono|Map|Set|WeakMap|sendBeacon|track|capture|identify)$/;

function files(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) out.push(...files(full));
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

const norm = (text) => text.replace(/\s+/g, " ").trim();
function isProse(text) {
  const value = norm(text);
  if (!/[A-Za-z]{2}/.test(value)) return false;
  if (/^(https?:|mailto:|tel:|\/|@\/|\.\.?\/|#|data:)/.test(value)) return false;
  if (/^[a-z0-9_.:\-\/@#?=&%]+$/.test(value)) return false; // ids, paths, css
  if (/^[A-Z0-9_]+$/.test(value) && value.length <= 3) return false; // codes
  if (/^[\w-]+(\s[\w-]+)*$/.test(value) && /(^|\s)(flex|grid|px|rem|text-|bg-|min-h|h-full|antialiased)/.test(value)) return false;
  if (/^[\d\s.,:%+\-–€$£()]+$/.test(value)) return false;
  if (/^(var|translate|rotate|scale|matrix|rgba?|hsla?|light-dark|url|calc)\(/.test(value)) return false;
  if (/^[MLHVCSQTAZmlhvcsqtaz][\d\s.,MLHVCSQTAZmlhvcsqtaz-]+$/.test(value)) return false; // SVG paths
  if (/^[\w-]+:[\w-]+(\s[\w-]+:[\w-]+)*$/.test(value)) return false;
  return true;
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", ndash: "–", mdash: "—", hellip: "…", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", middot: "·", rarr: "→", larr: "←", times: "×", euro: "€", copy: "©", laquo: "«", raquo: "»" };
function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name) => {
    if (name[0] === "#") return String.fromCodePoint(name[1] === "x" || name[1] === "X" ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
    return ENTITIES[name] ?? whole;
  });
}

function jsxTextValue(raw) {
  const text = decodeEntities(raw);
  // Same whitespace rules as the JSX compiler: lines are trimmed, a line
  // break between words becomes one space.
  const lines = text.split(/\r\n|\n|\r/);
  if (lines.length === 1) return text;
  return lines
    .map((line, index) => {
      let value = line.replace(/\t/g, " ");
      if (index !== 0) value = value.replace(/^\s+/, "");
      if (index !== lines.length - 1) value = value.replace(/\s+$/, "");
      return value;
    })
    .filter(Boolean)
    .join(" ");
}

const keys = new Map();
function add(text, file) {
  const key = norm(text);
  if (!isProse(key.replace(/\{\d+\}|<\d+\/>/g, " "))) return;
  if (!keys.has(key)) keys.set(key, new Set());
  keys.get(key).add(file);
}

function templateKey(node) {
  let text = node.head.text;
  node.templateSpans.forEach((span, index) => {
    text += `{${index}}${span.literal.text}`;
  });
  return text;
}

function stringOf(expr) {
  if (!expr) return null;
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
  return null;
}

function childrenKey(children) {
  let text = "";
  let slot = 0;
  let element = 0;
  let pieces = [];
  for (const child of children) {
    if (ts.isJsxText(child)) {
      const value = jsxTextValue(child.text);
      if (/^\s*$/.test(child.text) && /\n/.test(child.text)) continue;
      text += value;
      pieces.push(value);
    } else if (ts.isJsxExpression(child)) {
      if (!child.expression) continue;
      const literal = stringOf(child.expression);
      if (literal !== null) {
        text += literal;
        pieces.push(literal);
      } else if (ts.isJsxElement(child.expression) || ts.isJsxSelfClosingElement(child.expression) || ts.isJsxFragment(child.expression)) {
        text += `<${element++}/>`;
      } else {
        text += `{${slot++}}`;
      }
    } else {
      text += `<${element++}/>`;
    }
  }
  return { text, pieces };
}

function visit(node, file) {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) || ts.isTypeNode(node) && !ts.isTypeLiteralNode(node)) return;
  if (ts.isLiteralTypeNode(node)) return;

  if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
    const tag = ts.isJsxElement(node) ? node.openingElement.tagName.getText() : "";
    if (!["script", "style", "code", "pre", "kbd", "samp"].includes(tag)) {
      const { text, pieces } = childrenKey(node.children);
      add(text, file);
      // The runtime joins text and variables into one string, so pieces
      // are looked up only next to inline elements, and only when the
      // whole sentence has no entry: keep the ones that read on their own.
      if (/<\d+\/>/.test(text)) {
        for (const piece of pieces) if (/^\s*[A-Z]/.test(piece) && norm(piece).split(" ").length >= 2) add(piece, file);
      }
    }
  }

  if (ts.isJsxAttribute(node)) {
    const name = node.name.getText();
    if (skipProps.has(name) || name.startsWith("on") || name.startsWith("data-")) return;
  }

  if (ts.isPropertyAssignment(node)) {
    const name = node.name.getText().replace(/^["']|["']$/g, "");
    if (skipProps.has(name)) return;
    // A citation object ({ title, url, publisher }) keeps its own words.
    if (ts.isObjectLiteralExpression(node.parent) && node.parent.properties.some((p) => p.name && /^(url|href)$/.test(p.name.getText()))
      && /^(title|publisher|label)$/.test(name)) return;
  }

  if (ts.isCallExpression(node)) {
    const callee = node.expression.getText().split(".").pop();
    if (skipCalls.test(callee)) {
      // still visit arguments that are functions/objects (e.g. map(callback))
      for (const arg of node.arguments) if (!ts.isStringLiteral(arg) && !ts.isNoSubstitutionTemplateLiteral(arg) && !ts.isTemplateExpression(arg)) visit(arg, file);
      visit(node.expression, file);
      return;
    }
  }
  if (ts.isElementAccessExpression(node)) { visit(node.expression, file); return; }
  if (ts.isBinaryExpression(node) && /^(===|!==|==|!=)$/.test(node.operatorToken.getText())) return;
  if (ts.isCaseClause(node)) { node.statements.forEach((s) => visit(s, file)); return; }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    if (ts.isJsxAttribute(node.parent)) add(decodeEntities(node.text), file);
    else if (!ts.isPropertyAssignment(node.parent) || node.parent.initializer === node) add(node.text, file);
    return;
  }
  if (ts.isTemplateExpression(node)) {
    add(templateKey(node), file);
    node.templateSpans.forEach((span) => visit(span.expression, file));
    return;
  }
  ts.forEachChild(node, (child) => visit(child, file));
}

const sourceFiles = files(path.join(root, "src")).filter((file) => !skipFiles.some((re) => re.test(file)));
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  if (/^["']use server["']/.test(text)) continue;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  visit(sf, path.relative(root, file));
}

const result = Object.fromEntries([...keys.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, set]) => [key, [...set].sort()]));
const out = process.argv[2];
if (out) fs.writeFileSync(out, JSON.stringify(result, null, 1));
const words = Object.keys(result).reduce((sum, key) => sum + key.split(" ").length, 0);
console.log(`${Object.keys(result).length} keys, ${words} words`);
