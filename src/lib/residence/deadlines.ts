import type { ResidenceFiling } from "@/lib/residence/slovakia";

// Turns a planned move date into dated steps for Slovak temporary residence
// for study. Only rules that give a fixed period are dated; steps that
// count from an unknown date (collecting the residence card) stay relative.
// Dates are ISO strings (YYYY-MM-DD) computed in UTC so the server and the
// browser always agree.

export type DeadlineTone = "done" | "ok" | "soon" | "late" | "info";

export type DeadlineItem = {
  id: string;
  taskId?: string;
  title: string;
  date?: string;
  dateLabel: string;
  detail: string;
  tone: DeadlineTone;
};

export type StudyDeadlinePlan = {
  moveDate: string;
  latestFilingDate: string;
  items: DeadlineItem[];
  warnings: string[];
};

type PlanInput = {
  moveDate: string;
  today: string;
  filing: ResidenceFiling;
  applicationDeadline: string;
  admissionDate: string;
  processingDays: number;
  documentMaxAgeDays?: number;
  reportWorkingDays?: number;
  soonDays?: number;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string | null | undefined): value is string {
  if (!value || !ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(value: string, days: number) {
  const date = toDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

// Monday–Friday only. Slovak public holidays are not included, so the
// result can be one or two days too late around holidays; the UI says so.
export function addWorkingDays(value: string, days: number) {
  const date = toDate(value);
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return toIso(date);
}

function daysBetween(from: string, to: string) {
  return Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Formatted by hand: Intl month abbreviations differ between ICU versions
// ("Sep" vs "Sept"), which would make server and browser HTML disagree.
export function formatPlanDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function toneFor(date: string, today: string, soonDays: number): DeadlineTone {
  if (date < today) return "late";
  return daysBetween(today, date) <= soonDays ? "soon" : "ok";
}

export function planStudyResidenceDeadlines({
  moveDate,
  today,
  filing,
  applicationDeadline,
  admissionDate,
  processingDays,
  documentMaxAgeDays = 90,
  reportWorkingDays = 3,
  soonDays = 30,
}: PlanInput): StudyDeadlinePlan | null {
  if (!isIsoDate(moveDate) || !isIsoDate(today) || moveDate <= today) {
    return null;
  }

  const latestFilingDate = addDays(moveDate, -processingDays);
  const recordEarliest = addDays(latestFilingDate, -documentMaxAgeDays);
  const warnings: string[] = [];

  if (latestFilingDate < today) {
    warnings.push(
      `To have a decision by ${formatPlanDate(moveDate)}, the residence application would have had to be filed by ${formatPlanDate(latestFilingDate)}. The authority may decide sooner, but up to ${processingDays} days is allowed; consider a later move date.`,
    );
  }

  if (admissionDate > latestFilingDate) {
    warnings.push(
      `Admission results follow the entrance exam on ${formatPlanDate(admissionDate)}, after your latest filing date (${formatPlanDate(latestFilingDate)}). The admission letter is needed to file, so a decision may not arrive before ${formatPlanDate(moveDate)}.`,
    );
  }

  if (filing === "unclear") {
    warnings.push(
      "Your current status does not map to one filing place. Confirm with the Foreign Police or the embassy where you may apply before relying on these dates.",
    );
  }

  const items: DeadlineItem[] = [
    {
      id: "university-application",
      title: "Submit the university application",
      date: applicationDeadline,
      dateLabel: `By ${formatPlanDate(applicationDeadline)}`,
      detail: "Fixed faculty deadline, independent of your move date.",
      tone: toneFor(applicationDeadline, today, soonDays),
    },
    {
      id: "criminal-record",
      taskId: "criminal-record",
      title: "Request criminal-record documents",
      date: recordEarliest,
      dateLabel: `${formatPlanDate(recordEarliest)} – ${formatPlanDate(latestFilingDate)}`,
      detail: `They must be no older than ${documentMaxAgeDays} days on the day you file. Requesting them earlier than this window risks them expiring.`,
      tone: toneFor(latestFilingDate, today, soonDays),
    },
    {
      id: "authentication-translation",
      taskId: "authentication-translation",
      title: "Apostille and official translation",
      date: latestFilingDate,
      dateLabel: `By ${formatPlanDate(latestFilingDate)}`,
      detail: "Every foreign document must be authenticated and translated before filing.",
      tone: toneFor(latestFilingDate, today, soonDays),
    },
    {
      id: "residence-filing",
      taskId: "residence-submission-place",
      title:
        filing === "in-country"
          ? "File at the Foreign Police in Slovakia"
          : filing === "abroad"
            ? "File at the Slovak embassy"
            : "File the residence application",
      date: latestFilingDate,
      dateLabel: `By ${formatPlanDate(latestFilingDate)}`,
      detail:
        filing === "in-country"
          ? `The decision can take up to ${processingDays} days. Your current status must still be valid on the filing day.`
          : `The decision can take up to ${processingDays} days. Book the embassy appointment early; an interview is part of the procedure.`,
      tone: toneFor(latestFilingDate, today, soonDays),
    },
  ];

  if (filing !== "in-country") {
    const reportBy = addWorkingDays(moveDate, reportWorkingDays);
    items.push({
      id: "report-arrival",
      taskId: "post-card-duties",
      title: "Report the start of residence",
      date: reportBy,
      dateLabel: `By ${formatPlanDate(reportBy)}`,
      detail: `Within ${reportWorkingDays} working days of arriving on ${formatPlanDate(moveDate)} (weekends skipped; public holidays are not counted here).`,
      tone: "info",
    });
  }

  items.push(
    {
      id: "health-insurance",
      title: "Take out health insurance",
      dateLabel: "3 working days after collecting the card",
      detail: "Counts from the day you collect the residence card. Students do not have to submit the proof.",
      tone: "info",
    },
    {
      id: "medical-report",
      title: "Submit a medical report",
      dateLabel: "30 days after collecting the card",
      detail: "The report must be no older than 30 days. Students are not exempt.",
      tone: "info",
    },
  );

  return { moveDate, latestFilingDate, items, warnings };
}
