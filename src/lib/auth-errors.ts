/**
 * Plain, translatable messages for the sign-in, sign-up, password-reset
 * and new-password forms. Supabase returns technical English text
 * ("Failed to fetch", "Invalid login credentials"); known cases get a
 * sentence that says what to do. Anything unknown keeps Supabase's own
 * message so nothing is hidden.
 */

type AuthLikeError = { message?: string; code?: string; status?: number; name?: string };

export const authErrorMessages = {
  network: "No connection to the sign-in service. Check your internet connection and try again.",
  invalidCredentials: "Wrong email or password. Check both and try again, or reset your password.",
  emailNotConfirmed: "Confirm your email first: open the link we sent you, then log in.",
  rateLimit: "Too many attempts in a short time. Wait a few minutes and try again.",
  emailNotAuthorized: "We could not send an email to this address right now. Use Continue with Google, or try again later.",
  weakPassword: "This password is too weak. Choose a longer one that is hard to guess.",
  userExists: "An account with this email already exists. Log in instead.",
  signupDisabled: "New accounts are paused right now. Please try again later.",
  samePassword: "Choose a password that is different from your current one.",
  fallback: "Something went wrong. Please try again.",
  link: "This sign-in link did not work. It may have expired or been used already. Log in, or ask for a new link.",
} as const;

export function authErrorMessage(error: unknown): string {
  const known = knownAuthErrorMessage(error);
  if (known) return known;
  const message = (error as AuthLikeError | null)?.message;
  return typeof message === "string" && message ? message : authErrorMessages.fallback;
}

/**
 * The text for an error passed in the address (/auth?error=…, set by
 * /auth/callback). Only fixed sentences are shown: free text from a link
 * could otherwise put any words on DocRoute's sign-in page.
 */
export function linkErrorMessage(raw: string | undefined): string {
  if (!raw) return "";
  return knownAuthErrorMessage({ message: raw }) ?? authErrorMessages.link;
}

function knownAuthErrorMessage(error: unknown): string | null {
  const value = (error ?? {}) as AuthLikeError;
  const message = typeof value.message === "string" ? value.message : "";
  const code = value.code ?? "";

  // supabase-js also marks server errors (5xx) as "retryable": those are not
  // a lost connection. A failed confirmation email (for example, the SMTP
  // server refused the login) comes back as 500 "Error sending … email".
  const serverError = typeof value.status === "number" && value.status >= 500;
  if (/error sending .*(e-?mail|mail)|smtp/i.test(message)) return authErrorMessages.emailNotAuthorized;
  if (serverError) return authErrorMessages.fallback;
  if (value.name === "AuthRetryableFetchError" || /failed to fetch|networkerror|load failed|fetch failed|network request failed/i.test(message)) {
    return authErrorMessages.network;
  }
  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) return authErrorMessages.invalidCredentials;
  if (code === "email_not_confirmed" || /email not confirmed/i.test(message)) return authErrorMessages.emailNotConfirmed;
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || value.status === 429 || /rate limit/i.test(message)) {
    return authErrorMessages.rateLimit;
  }
  if (code === "email_address_not_authorized" || /email address not authorized/i.test(message)) return authErrorMessages.emailNotAuthorized;
  if (code === "same_password" || /different from the old password/i.test(message)) return authErrorMessages.samePassword;
  if (code === "weak_password" || /password should (be|contain)/i.test(message)) return authErrorMessages.weakPassword;
  if (code === "user_already_exists" || code === "email_exists" || /already registered/i.test(message)) return authErrorMessages.userExists;
  if (code === "signup_disabled" || /signups not allowed/i.test(message)) return authErrorMessages.signupDisabled;
  return null;
}
