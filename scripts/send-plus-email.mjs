// One-off email to Plus members. Dry run by default: it only prints who would
// receive the message. Pass --send to actually send.
//
// Usage:
//   node scripts/send-plus-email.mjs --csv plus-emails.csv            # dry run
//   RESEND_API_KEY=... MAIL_FROM="DocRoute <hello@your-domain>" \
//     node scripts/send-plus-email.mjs --csv plus-emails.csv --send
//
// The CSV comes from the owner's Supabase SQL editor (never commit it):
//   select u.email from public.account_plans p
//   join auth.users u on u.id = p.user_id
//   where p.plan = 'plus' and (p.plus_until is null or p.plus_until > now());
// The first line must be "email". API keys are read from the environment only.

import { readFileSync } from "node:fs";

const SUBJECT = "Your DocRoute Plus is active";

// The link comes from SITE_URL, so the email never points at a domain that
// is not live yet.
function messageText(siteUrl) {
  return `Hello,

Thank you for being part of the DocRoute Plus beta.

With Plus you can set your move or start date, see a date for every step,
save your route, and download it as a PDF or PNG.

Open your route: ${siteUrl}/home

Thank you,
DocRoute
`;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DELAY_MS = 700;

export function parseEmails(csvText) {
  const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0 || lines[0].toLowerCase() !== "email") {
    throw new Error('The CSV must start with a header line "email".');
  }
  const emails = lines
    .slice(1)
    .map((line) => line.replace(/^"|"$/g, "").trim().toLowerCase())
    .filter((email) => EMAIL_PATTERN.test(email));
  return [...new Set(emails)];
}

async function sendOne({ apiKey, from, to, text }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject: SUBJECT, text }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`HTTP ${response.status} for ${to}: ${detail.slice(0, 200)}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const csvIndex = args.indexOf("--csv");
  const csvPath = csvIndex >= 0 ? args[csvIndex + 1] : undefined;
  const shouldSend = args.includes("--send");

  if (!csvPath) {
    console.error("Give the list with --csv <file>.");
    process.exit(1);
  }

  const emails = parseEmails(readFileSync(csvPath, "utf8"));
  console.log(`Recipients: ${emails.length}`);

  if (!shouldSend) {
    for (const email of emails) console.log(`  would send to ${email}`);
    console.log("Dry run: nothing sent. Add --send to send.");
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const siteUrl = process.env.SITE_URL;
  if (!apiKey || !from || !siteUrl) {
    console.error("Set RESEND_API_KEY, MAIL_FROM and SITE_URL before using --send.");
    process.exit(1);
  }
  const text = messageText(siteUrl.replace(/\/$/, ""));

  let sent = 0;
  const failed = [];
  for (const to of emails) {
    try {
      await sendOne({ apiKey, from, to, text });
      sent += 1;
    } catch (error) {
      failed.push(error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }
  console.log(`Sent: ${sent}. Failed: ${failed.length}.`);
  for (const message of failed) console.log(`  ${message}`);
  if (failed.length > 0) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
