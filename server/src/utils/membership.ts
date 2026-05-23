import type { MembershipTier } from "../types/models.js";

export const DEFAULT_MEMBERSHIP_TIER: MembershipTier = "free";

const LIKE_VISIBILITY_TIERS: MembershipTier[] = ["platinum", "silver", "gold", "diamond"];

export const resolveMembershipTier = (tier?: MembershipTier): MembershipTier => tier ?? DEFAULT_MEMBERSHIP_TIER;

export const canSeeIncomingLikes = (tier?: MembershipTier) =>
  LIKE_VISIBILITY_TIERS.includes(resolveMembershipTier(tier));

export const canDirectMessage = (_tier?: MembershipTier) => true;

export const canViewProfile = (viewerTier?: MembershipTier, targetTier?: MembershipTier) => {
  const viewer = resolveMembershipTier(viewerTier);
  const target = resolveMembershipTier(targetTier);

  if (target === "gold") {
    return viewer === "silver" || viewer === "gold" || viewer === "diamond";
  }

  if (target === "diamond") {
    return viewer === "gold" || viewer === "diamond";
  }

  return true;
};

export const getMessageAccessError = (viewerTier?: MembershipTier, targetTier?: MembershipTier) => {
  if (!canViewProfile(viewerTier, targetTier)) {
    const target = resolveMembershipTier(targetTier);
    return target === "diamond"
      ? "This member only accepts chats from Gold and Diamond accounts."
      : "This member only accepts chats from Silver, Gold, and Diamond accounts.";
  }

  return null;
};