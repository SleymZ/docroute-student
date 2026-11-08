// Sends the welcome email once per account, right after sign-up. Called from
// /auth/callback (Google, email confirmation links) and /api/welcome (email
// sign-up that returns a session at once). Marked in the user's own
// metadata (welcome_sent_at), so a later sign-in never sends it again, and
// accounts older than a day (made before this feature) never get it.

import type { Locale } from "@/i18n/config";
import { welcomeEmail } from "./welcome-email";

export const WELCOME_WINDOW_MS = 24 * 60 * 60 * 1000;

export type WelcomeMail = { to: string; subject: string; html: string; text: string };

type WelcomeUser = {
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown> | null;
};

export type AuthLike = {
  auth: {
    getUser(): Promise<{ data: { user: WelcomeUser | null } }>;
    updateUser(attributes: { data: Record<string, unknown> }): Promise<{ error: unknown }>;
  };
};

export type WelcomeResult = "sent" | "no-user" | "already-sent" | "not-new";

export async function sendWelcomeIfNew(options: {
  supabase: AuthLike;
  locale: Locale;
  siteUrl: string;
  send: (mail: WelcomeMail) => Promise<void>;
  now?: number;
}): Promise<WelcomeResult> {
  const { supabase, locale, siteUrl, send } = options;
  const now = options.now ?? Date.now();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return "no-user";
  if (user.user_metadata?.welcome_sent_at) return "already-sent";
  const created = Date.parse(user.created_at ?? "");
  if (!Number.isFinite(created) || now - created > WELCOME_WINDOW_MS) return "not-new";

  await send({ to: user.email, ...welcomeEmail(locale, siteUrl) });
  await supabase.auth.updateUser({ data: { welcome_sent_at: new Date(now).toISOString() } });
  return "sent";
}
