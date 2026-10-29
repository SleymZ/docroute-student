import { isSlovakDayOff } from "@/lib/residence/slovak-holidays";
import type { ResidenceFiling } from "@/lib/residence/slovakia";
import type { WorkAuthorisationRoute } from "@/lib/work-profile";

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

// Same shape for every purpose; the study name is kept for existing code.
export type ResidenceDeadlinePlan = StudyDeadlinePlan;

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
  // Slovak residence for another purpose changed to study: no new criminal
  // record or medical report, and no arrival to report.
  changeOfPurpose?: boolean;
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

function isWorkingDay(date: Date) {
  const weekday = date.getUTCDay();
  return weekday !== 0 && weekday !== 6 && !isSlovakDayOff(toIso(date));
}

// Monday–Friday, skipping Slovak days off (Act No. 241/1993, see
// slovak-holidays.ts).
export function addWorkingDays(value: string, days: number) {
  const date = toDate(value);
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (isWorkingDay(date)) added += 1;
  }
  return toIso(date);
}

// Same rule, counting backwards.
export function subtractWorkingDays(value: string, days: number) {
  const date = toDate(value);
  let removed = 0;
  while (removed < days) {
    date.setUTCDate(date.getUTCDate() - 1);
    if (isWorkingDay(date)) removed += 1;
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
  changeOfPurpose = false,
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

  if (changeOfPurpose) {
    warnings.push(
      "File the change of purpose no later than the last day of your current permit, even if that is earlier than the date below.",
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
  ];

  if (!changeOfPurpose) {
    items.push({
      id: "criminal-record",
      taskId: "criminal-record",
      title: "Request criminal-record documents",
      date: recordEarliest,
      dateLabel: `${formatPlanDate(recordEarliest)} – ${formatPlanDate(latestFilingDate)}`,
      detail: `They must be no older than ${documentMaxAgeDays} days on the day you file. Requesting them earlier than this window risks them expiring.`,
      tone: toneFor(latestFilingDate, today, soonDays),
    });
  }

  items.push(
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
      title: changeOfPurpose
        ? "File the change of purpose at the Foreign Police"
        : filing === "in-country"
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
  );

  if (filing !== "in-country") {
    const reportBy = addWorkingDays(moveDate, reportWorkingDays);
    items.push({
      id: "report-arrival",
      taskId: "post-card-duties",
      title: "Report the start of residence",
      date: reportBy,
      dateLabel: `By ${formatPlanDate(reportBy)}`,
      detail: `Within ${reportWorkingDays} working days of arriving on ${formatPlanDate(moveDate)} (weekends and Slovak public holidays skipped).`,
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
  );

  if (!changeOfPurpose) {
    items.push({
      id: "medical-report",
      title: "Submit a medical report",
      dateLabel: "30 days after collecting the card",
      detail: "The report must be no older than 30 days. Students are not exempt.",
      tone: "info",
    });
  }

  return { moveDate, latestFilingDate, items, warnings };
}

type WorkPlanInput = {
  moveDate: string;
  today: string;
  filing: ResidenceFiling;
  route: WorkAuthorisationRoute;
  processingDays: number;
  hasJobOffer: boolean;
  shortageOccupation: "yes" | "no" | "unsure";
  vacancyReportWorkingDays: number;
  fileWithinDaysOfConfirmation: number;
  documentMaxAgeDays: number;
  reportWorkingDays: number;
  soonDays?: number;
};

// Work route: the move date is the day you need to be living and working in
// Slovakia. The Labour Office has no published processing time, so the
// employer's steps are given as "no later than" limits, never as a schedule.
export function planWorkResidenceDeadlines({
  moveDate,
  today,
  filing,
  route,
  processingDays,
  hasJobOffer,
  shortageOccupation,
  vacancyReportWorkingDays,
  fileWithinDaysOfConfirmation,
  documentMaxAgeDays,
  reportWorkingDays,
  soonDays = 30,
}: WorkPlanInput): ResidenceDeadlinePlan | null {
  if (!isIsoDate(moveDate) || !isIsoDate(today) || moveDate <= today) {
    return null;
  }

  const latestFilingDate = addDays(moveDate, -processingDays);
  const recordEarliest = addDays(latestFilingDate, -documentMaxAgeDays);
  const warnings: string[] = [];

  if (latestFilingDate < today) {
    warnings.push(
      `To have a decision by ${formatPlanDate(moveDate)}, the residence application would have had to be filed by ${formatPlanDate(latestFilingDate)}. The authority may decide sooner, but up to ${processingDays} days is allowed; consider a later start date.`,
    );
  }

  if (!hasJobOffer) {
    warnings.push(
      "You do not have a job offer yet. Every date below assumes an employer is found in time to complete its steps first.",
    );
  }

  if (filing === "unclear") {
    warnings.push(
      "Your current status does not map to one filing place. Confirm with the Foreign Police or the embassy where you may apply before relying on these dates.",
    );
  }

  const items: DeadlineItem[] = [];

  if (route !== "slovak-graduate") {
    const examined = route === "single-permit" && shortageOccupation !== "yes";
    if (examined) {
      // The confirmation request itself must come before filing, so the
      // report is due at least N working days before the latest filing day.
      const reportBy = subtractWorkingDays(latestFilingDate, vacancyReportWorkingDays);
      items.push({
        id: "vacancy-report",
        taskId: "vacancy-report",
        title: "Employer reports the vacancy",
        date: reportBy,
        dateLabel: `No later than ${formatPlanDate(reportBy)}`,
        detail: `At least ${vacancyReportWorkingDays} working days before the confirmation request. The Labour Office's own processing time comes on top and is not published, so in practice this has to happen earlier.`,
        tone: toneFor(reportBy, today, soonDays),
      });
    }

    const confirmationEarliest = addDays(latestFilingDate, -fileWithinDaysOfConfirmation);
    items.push({
      id: "labour-office-confirmation",
      taskId: route === "blue-card" ? "blue-card-confirmation" : "labour-office-confirmation",
      title: "Labour Office confirmation issued",
      date: latestFilingDate,
      dateLabel: `Before ${formatPlanDate(latestFilingDate)}`,
      detail: `You must file within ${fileWithinDaysOfConfirmation} days of the confirmation. If you file on the latest date, a confirmation issued before ${formatPlanDate(confirmationEarliest)} would already be too old.`,
      tone: toneFor(latestFilingDate, today, soonDays),
    });
  }

  items.push(
    {
      id: "criminal-record",
      taskId: "criminal-record",
      title: "Request criminal-record documents",
      date: recordEarliest,
      dateLabel: `${formatPlanDate(recordEarliest)} – ${formatPlanDate(latestFilingDate)}`,
      detail: `They must be no older than ${documentMaxAgeDays} days on the day you file. Requesting them earlier risks them expiring.`,
      tone: toneFor(latestFilingDate, today, soonDays),
    },
    {
      id: "accommodation",
      taskId: "accommodation",
      title: "Arrange proof of accommodation",
      date: recordEarliest,
      dateLabel: `${formatPlanDate(recordEarliest)} – ${formatPlanDate(latestFilingDate)}`,
      detail: `The document must also be no older than ${documentMaxAgeDays} days when you file.`,
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
      detail: `The decision can take up to ${processingDays} days.`,
      tone: toneFor(latestFilingDate, today, soonDays),
    },
  );

  if (filing !== "in-country") {
    const reportBy = addWorkingDays(moveDate, reportWorkingDays);
    items.push({
      id: "report-arrival",
      taskId: "post-card-duties",
      title: "Report the start of residence",
      date: reportBy,
      dateLabel: `By ${formatPlanDate(reportBy)}`,
      detail: `Within ${reportWorkingDays} working days of arriving on ${formatPlanDate(moveDate)} (weekends and Slovak public holidays skipped).`,
      tone: "info",
    });
  }

  items.push(
    {
      id: "health-insurance",
      title: "Take out health insurance",
      dateLabel: "3 working days after receiving the card",
      detail: "Counts from the day you receive the residence card.",
      tone: "info",
    },
    {
      id: "medical-report",
      title: "Submit a medical report",
      dateLabel: "30 days after receiving the card",
      detail: "The report must be no older than 30 days.",
      tone: "info",
    },
  );

  return { moveDate, latestFilingDate, items, warnings };
}

// Family and business residence: no Labour Office steps, so the work plan
// with the graduate path gives the documents, filing and arrival dates.
export function planPurposeResidenceDeadlines(input: {
  moveDate: string;
  today: string;
  filing: ResidenceFiling;
  processingDays: number;
  documentMaxAgeDays: number;
  reportWorkingDays: number;
}): ResidenceDeadlinePlan | null {
  return planWorkResidenceDeadlines({
    ...input,
    route: "slovak-graduate",
    hasJobOffer: true,
    shortageOccupation: "no",
    vacancyReportWorkingDays: 0,
    fileWithinDaysOfConfirmation: 0,
  });
}
