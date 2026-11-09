// What the Whop webhook does with one verified event: find the membership,
// read its current state from the Whop API, find the DocRoute account in its
// metadata and write the plan. Kept apart from the route so tests can run it
// with a fake Whop API and a fake database.

import {
  eventReference,
  getMembership,
  getPayment,
  plusFromMembership,
  userIdFromMetadata,
  type WhopConfig,
  type WhopEvent,
} from "./whop";

export type ApplyPlan = (args: {
  p_user_id: string;
  p_membership_id: string;
  p_status: string;
  p_active: boolean;
  p_plus_until: string | null;
  p_manage_url: string | null;
}) => Promise<{ data: string | null; error: { message: string } | null }>;

export type SyncResult =
  | { outcome: "ignored"; reason: string }
  | { outcome: "applied"; result: string; userId: string; membershipId: string; active: boolean };

type FetchLike = Parameters<typeof getMembership>[2];

/** Throws when Whop or the database fails, so the route answers 500 and Whop
 *  retries; returns "ignored" for events that are fine to drop. */
export async function syncWhopEvent(
  config: WhopConfig,
  event: WhopEvent,
  apply: ApplyPlan,
  options: { fetcher?: FetchLike; now?: number } = {},
): Promise<SyncResult> {
  const reference = eventReference(event);
  if (!reference) return { outcome: "ignored", reason: `event ${event.type}` };

  let membershipId: string | null = "membershipId" in reference ? reference.membershipId : null;
  let fallbackMetadata: unknown = event.data.metadata;
  if (!membershipId && "paymentId" in reference) {
    const payment = await getPayment(config, reference.paymentId, options.fetcher);
    membershipId = typeof payment.membership_id === "string" ? payment.membership_id : null;
    fallbackMetadata = payment.metadata ?? fallbackMetadata;
  }
  if (!membershipId) return { outcome: "ignored", reason: "no membership" };

  const membership = await getMembership(config, membershipId, options.fetcher);
  const userId = userIdFromMetadata(membership.metadata) ?? userIdFromMetadata(fallbackMetadata);
  // Bought outside DocRoute's own checkout: nothing to tie it to.
  if (!userId) return { outcome: "ignored", reason: "no DocRoute account in metadata" };

  const state = plusFromMembership(membership, options.now);
  const { data, error } = await apply({
    p_user_id: userId,
    p_membership_id: membership.id,
    p_status: state.status,
    p_active: state.active,
    p_plus_until: state.plusUntil,
    p_manage_url: state.manageUrl,
  });
  if (error) throw new Error(`apply_whop_membership failed: ${error.message}`);
  return { outcome: "applied", result: data ?? "", userId, membershipId: membership.id, active: state.active };
}
