import { waitlistRoutes, type WaitlistRoute } from "@/lib/waitlist";

/**
 * Anonymous feedback: a 1–5 rating and/or a short message, with the page it
 * came from (path only, never the query string, which can hold route
 * answers). Insert-only table; the operator reads it in Supabase.
 */
export const FEEDBACK_MAX_LENGTH = 2000;
export const FEEDBACK_KEEP_MONTHS = 24;

export type FeedbackInsert = {
  page: string;
  route: WaitlistRoute | null;
  rating: number | null;
  message: string | null;
};

/** Path only, at most 200 characters, always starting with "/". */
export function feedbackPage(pathname: string) {
  const path = pathname.split(/[?#]/)[0] || "/";
  return (path.startsWith("/") ? path : `/${path}`).slice(0, 200);
}

export function buildFeedbackInsert(input: {
  pathname: string;
  route?: string | null;
  rating?: number | null;
  message?: string | null;
}): FeedbackInsert | null {
  const message = input.message?.trim() || null;
  const rating =
    input.rating && Number.isInteger(input.rating) && input.rating >= 1 && input.rating <= 5
      ? input.rating
      : null;
  if (!rating && !message) return null;
  if (message && message.length > FEEDBACK_MAX_LENGTH) return null;
  const route = waitlistRoutes.includes(input.route as WaitlistRoute)
    ? (input.route as WaitlistRoute)
    : null;
  return { page: feedbackPage(input.pathname), route, rating, message };
}
