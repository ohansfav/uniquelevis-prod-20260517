import type { MembershipTier } from "../types/models.js";

export const DEFAULT_MEMBERSHIP_TIER: MembershipTier = "free";

const LIKE_VISIBILITY_TIERS: MembershipTier[] = ["platinum", "silver", "gold", "diamond"];

const tierRank: Record<MembershipTier, number> = {
  free: 0,
  platinum: 1,
  silver: 2,
  gold: 3,
  diamond: 4,
};

export const resolveMembershipTier = (tier?: MembershipTier): MembershipTier => tier ?? DEFAULT_MEMBERSHIP_TIER;

export const canSeeIncomingLikes = (tier?: MembershipTier) =>
  LIKE_VISIBILITY_TIERS.includes(resolveMembershipTier(tier));

export const canDirectMessage = (_tier?: MembershipTier) => true;

export const canViewProfile = (viewerTier?: MembershipTier, targetTier?: MembershipTier) => {
  const v = resolveMembershipTier(viewerTier);
  const t = resolveMembershipTier(targetTier);
  const vRank = tierRank[v];
  const tRank = tierRank[t];

  // Free and Platinum are always visible (no gatekeeping)
  if (tRank <= 1) return true;

  // Silver is visible to Silver+
  if (t === "silver") return vRank >= 2;

  // Gold: only Gold and Silver can view
  if (t === "gold") return vRank >= 2;

  // Diamond: only Diamond and Gold can view
  if (t === "diamond") return vRank >= 3;

  return true;
};

export const getMessageAccessError = (viewerTier?: MembershipTier, targetTier?: MembershipTier) => {
  const v = resolveMembershipTier(viewerTier);
  const t = resolveMembershipTier(targetTier);
  const vRank = tierRank[v];
  const tRank = tierRank[t];

  // Free/Platinum/Silver targets: anyone can message
  if (tRank <= 2) return null;

  // Gold target: only Gold and Silver can message
  if (t === "gold" && vRank < 2) {
    return "Upgrade to Silver or Gold to message this user.";
  }

  // Diamond target: only Diamond and Gold can message
  if (t === "diamond" && vRank < 3) {
    return "Upgrade to Gold or Diamond to message this user.";
  }

  return null;
};