// Server-side email through DocRoute's mailbox docroutestu@gmail.com (Gmail
// SMTP with a Google app password), the same settings as
// scripts/send-plus-email.mjs. Vercel environment: SMTP_PASS (required),
// optional SMTP_HOST, SMTP_PORT, SMTP_USER, MAIL_FROM. Without SMTP_PASS
// nothing is sent.

import type { Locale } from "@/i18n/config";
import type { AuthLike, WelcomeMail } from "./welcome";

export const DOCROUTE_MAILBOX = "docroutestu@gmail.com";

export async function mailerFromEnv(env: Record<string, string | undefined> = process.env) {
  if (!env.SMTP_PASS) return null;
  const port = Number(env.SMTP_PORT || 465);
  const { default: nodemailer } = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER || DOCROUTE_MAILBOX, pass: env.SMTP_PASS },
  });
  const from = env.MAIL_FROM || `DocRoute <${DOCROUTE_MAILBOX}>`;
  return async (mail: WelcomeMail) => {
    await transport.sendMail({ from, replyTo: DOCROUTE_MAILBOX, ...mail });
  };
}

/** Send the welcome email if this is a new account; never throws. */
export async function welcomeNewAccount(supabase: AuthLike, locale: Locale, siteUrl: string) {
  try {
    const send = await mailerFromEnv();
    if (!send) return "no-mailer";
    const { sendWelcomeIfNew } = await import("./welcome");
    return await sendWelcomeIfNew({ supabase, locale, siteUrl, send });
  } catch (error) {
    console.error("Welcome email failed", error);
    return "failed";
  }
}
