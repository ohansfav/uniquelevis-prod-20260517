import type { MembershipTier } from "../types/models.js";

export const DEFAULT_MEMBERSHIP_TIER: MembershipTier = "free";

const LIKE_VISIBILITY_TIERS: MembershipTier[] = ["platinum", "silver", "gold", "diamond"];

export const resolveMembershipTier = (tier?: MembershipTier): MembershipTier => tier ?? DEFAULT_MEMBERSHIP_TIER;

export const canSeeIncomingLikes = (tier?: MembershipTier) =>
  LIKE_VISIBILITY_TIERS.includes(resolveMembershipTier(tier));

export const canDirectMessage = (_tier?: MembershipTier) => true;

export const canViewProfile = (viewerTier?: MembershipTier, targetTier?: MembershipTier) => {
  // Discover and matches should remain usable for all authenticated users.
  // Keep visibility open and reserve tier logic for feature upsells.
  void viewerTier;
  void targetTier;
  return true;
};

export const getMessageAccessError = (viewerTier?: MembershipTier, targetTier?: MembershipTier) => {
  // Messaging is allowed once a match exists; do not lock active conversations by tier.
  void viewerTier;
  void targetTier;
  return null;
};