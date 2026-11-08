// Server-side email through DocRoute's mailbox docroutestu@gmail.com (Gmail
// SMTP with a Google app password), the same settings as
// scripts/send-plus-email.mjs. Vercel environment: SMTP_PASS (required),
// optional SMTP_HOST, SMTP_PORT, SMTP_USER, MAIL_FROM. Without SMTP_PASS
// nothing is sent.

import { after } from "next/server";

import type { Locale } from "@/i18n/config";
import { sendWelcomeIfNew, type AuthLike, type WelcomeMail } from "./welcome";

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
    // a slow or unreachable mail server gives up instead of hanging
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  const from = env.MAIL_FROM || `DocRoute <${DOCROUTE_MAILBOX}>`;
  return async (mail: WelcomeMail) => {
    await transport.sendMail({ from, replyTo: DOCROUTE_MAILBOX, ...mail });
  };
}

/** Claim and schedule the welcome email for a new account; never throws.
 *  The email itself leaves after the response (Next's after()). */
export async function welcomeNewAccount(supabase: AuthLike, locale: Locale, siteUrl: string) {
  try {
    if (!process.env.SMTP_PASS) return "no-mailer";
    return await sendWelcomeIfNew({
      supabase,
      locale,
      siteUrl,
      send: async (mail) => {
        const send = await mailerFromEnv();
        if (send) await send(mail);
      },
      schedule: (task) => after(task),
    });
  } catch (error) {
    console.error("Welcome email failed", error);
    return "failed";
  }
}
