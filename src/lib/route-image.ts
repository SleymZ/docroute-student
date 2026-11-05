// Draws a route as a PNG (Plus). Plain canvas text: no library, nothing
// leaves the device. Always the light theme, like the printed PDF.

export type ImageStage = {
  title: string;
  tasks: { id: string; title: string }[];
};

const WIDTH = 1080;
const PAD = 64;
const CORAL = "#d4502f";
const TEXT = "#22211d";
const MUTED = "#4c616c";
const FONT = "Inter, 'Segoe UI', Arial, sans-serif";

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

type Draw = { kind: "title" | "meta" | "stage" | "task" | "foot"; text: string; done?: boolean };

export function renderRoutePng(
  title: string,
  stages: ImageStage[],
  completed: ReadonlySet<string>,
  asOfDate: string,
  extraLines: string[] = [],
): HTMLCanvasElement {
  const measure = document.createElement("canvas").getContext("2d")!;
  const items: Draw[] = [
    { kind: "title", text: title },
    ...extraLines.map((text) => ({ kind: "meta" as const, text })),
  ];
  stages.forEach((stage, index) => {
    items.push({ kind: "stage", text: `${index + 1}. ${stage.title}` });
    for (const task of stage.tasks) items.push({ kind: "task", text: task.title, done: completed.has(task.id) });
  });
  items.push({
    kind: "foot",
    text: `Saved from DocRoute on ${asOfDate}. Rules change: open the live route before you file anything. Not legal advice.`,
  });

  const style = {
    title: { font: `700 40px ${FONT}`, line: 50, before: 0, indent: 0, color: TEXT },
    meta: { font: `400 22px ${FONT}`, line: 32, before: 6, indent: 0, color: MUTED },
    stage: { font: `700 26px ${FONT}`, line: 36, before: 30, indent: 0, color: CORAL },
    task: { font: `400 22px ${FONT}`, line: 31, before: 10, indent: 44, color: TEXT },
    foot: { font: `400 18px ${FONT}`, line: 26, before: 40, indent: 0, color: MUTED },
  } as const;

  const laid = items.map((item) => {
    const s = style[item.kind];
    measure.font = s.font;
    return { item, lines: wrap(measure, item.text, WIDTH - PAD * 2 - s.indent) };
  });
  const height =
    PAD * 2 + 70 + laid.reduce((sum, { item, lines }) => sum + style[item.kind].before + lines.length * style[item.kind].line, 0);

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = WIDTH * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.textBaseline = "top";

  // Brand line.
  ctx.font = `700 28px ${FONT}`;
  ctx.fillStyle = TEXT;
  ctx.fillText("Doc", PAD, PAD);
  const docWidth = ctx.measureText("Doc").width;
  ctx.fillStyle = CORAL;
  ctx.fillText("Route", PAD + docWidth, PAD);

  let y = PAD + 70;
  for (const { item, lines } of laid) {
    const s = style[item.kind];
    y += s.before;
    ctx.font = s.font;
    if (item.kind === "task") {
      ctx.strokeStyle = item.done ? CORAL : "#809da8";
      ctx.lineWidth = 2;
      ctx.strokeRect(PAD + 6, y + 3, 22, 22);
      if (item.done) {
        ctx.beginPath();
        ctx.moveTo(PAD + 11, y + 14);
        ctx.lineTo(PAD + 16, y + 20);
        ctx.lineTo(PAD + 24, y + 8);
        ctx.stroke();
      }
    }
    ctx.fillStyle = s.color;
    for (const line of lines) {
      ctx.fillText(line, PAD + s.indent, y);
      y += s.line;
    }
  }
  return canvas;
}

export function routeImageFileName(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 60);
  return `docroute-${slug || "route"}.png`;
}
