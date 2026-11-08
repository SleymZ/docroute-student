// One-off email to Plus members. Dry run by default: it only prints who would
// receive the message. Pass --send to actually send.
//
// Sender: DocRoute's mailbox docroutestu@gmail.com (owner decision
// 2026-11-08), through Gmail SMTP with a Google app password. Replies come
// back to the same mailbox.
//
// Usage:
//   node scripts/send-plus-email.mjs --csv plus-emails.csv            # dry run
//   SMTP_PASS="<16-character Google app password>" SITE_URL=https://docroute-student.vercel.app \
//     node scripts/send-plus-email.mjs --csv plus-emails.csv --send
//
// Optional: SMTP_HOST (smtp.gmail.com), SMTP_PORT (465), SMTP_USER and
// MAIL_FROM (both default to the DocRoute mailbox). With RESEND_API_KEY set
// instead of SMTP_PASS, Resend is used (it needs a verified own domain).
//
// The CSV comes from the owner's Supabase SQL editor (never commit it):
//   select u.email from public.account_plans p
//   join auth.users u on u.id = p.user_id
//   where p.plan = 'plus' and (p.plus_until is null or p.plus_until > now());
// The first line must be "email". Passwords and keys are read from the
// environment only; Gmail sends up to about 500 messages a day.

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

export const DOCROUTE_MAILBOX = "docroutestu@gmail.com";

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

/** How messages leave: Gmail SMTP when SMTP_PASS is set, else Resend when
 *  RESEND_API_KEY is set, else null. */
export function mailSettings(env) {
  if (env.SMTP_PASS) {
    return {
      kind: "smtp",
      host: env.SMTP_HOST || "smtp.gmail.com",
      port: Number(env.SMTP_PORT || 465),
      user: env.SMTP_USER || DOCROUTE_MAILBOX,
      pass: env.SMTP_PASS,
      from: env.MAIL_FROM || `DocRoute <${DOCROUTE_MAILBOX}>`,
      replyTo: DOCROUTE_MAILBOX,
    };
  }
  if (env.RESEND_API_KEY && env.MAIL_FROM) {
    return { kind: "resend", apiKey: env.RESEND_API_KEY, from: env.MAIL_FROM, replyTo: DOCROUTE_MAILBOX };
  }
  return null;
}

async function smtpSender(settings) {
  const { default: nodemailer } = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    auth: { user: settings.user, pass: settings.pass },
  });
  await transport.verify();
  return async ({ to, text }) => {
    await transport.sendMail({ from: settings.from, replyTo: settings.replyTo, to, subject: SUBJECT, text });
  };
}

function resendSender(settings) {
  return ({ to, text }) => sendResend({ apiKey: settings.apiKey, from: settings.from, replyTo: settings.replyTo, to, text });
}

async function sendResend({ apiKey, from, replyTo, to, text }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, reply_to: replyTo, to, subject: SUBJECT, text }),
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

  const settings = mailSettings(process.env);
  const siteUrl = process.env.SITE_URL;
  if (!settings || !siteUrl) {
    console.error("Set SMTP_PASS (Google app password for docroutestu@gmail.com) and SITE_URL before using --send.");
    process.exit(1);
  }
  const text = messageText(siteUrl.replace(/\/$/, ""));
  const send = settings.kind === "smtp" ? await smtpSender(settings) : resendSender(settings);
  console.log(`Sending from ${settings.from} via ${settings.kind === "smtp" ? settings.host : "Resend"}.`);

  let sent = 0;
  const failed = [];
  for (const to of emails) {
    try {
      await send({ to, text });
      sent += 1;
    } catch (error) {
      failed.push(`${to}: ${error.message}`);
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
