import type { MembershipTier, UserRecord } from "../types/models.js";

export const DEFAULT_MEMBERSHIP_TIER: MembershipTier = "free";

const TRIAL_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const LIKE_VISIBILITY_TIERS: MembershipTier[] = ["silver", "gold", "diamond"];

const tierRank: Record<MembershipTier, number> = {
  free: 0,
  silver: 1,
  gold: 2,
  diamond: 3,
};

export const resolveMembershipTier = (tier?: MembershipTier): MembershipTier => tier ?? DEFAULT_MEMBERSHIP_TIER;

export const isInTrial = (user?: Pick<UserRecord, "trialExpiresAt"> | null) => {
  if (!user?.trialExpiresAt) return false;
  return new Date(user.trialExpiresAt).getTime() > Date.now();
};

export const trialDaysRemaining = (user?: Pick<UserRecord, "trialExpiresAt"> | null) => {
  if (!isInTrial(user)) return 0;
  const ms = new Date(user!.trialExpiresAt!).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
};

export const canSeeIncomingLikes = (tier?: MembershipTier, user?: Pick<UserRecord, "trialExpiresAt"> | null) =>
  LIKE_VISIBILITY_TIERS.includes(resolveMembershipTier(tier)) || isInTrial(user);

export const canDirectMessage = (viewerTier?: MembershipTier, targetTier?: MembershipTier, viewer?: Pick<UserRecord, "trialExpiresAt"> | null) => {
  const v = resolveMembershipTier(viewerTier);
  const t = resolveMembershipTier(targetTier);
  const vRank = tierRank[v];

  // During trial, users can message anyone (Silver-equivalent access)
  if (isInTrial(viewer)) return true;

  // Free users can only message matches if the target is not gatekeeping
  // Silver+ users can message anyone (subject to target gatekeeping below)
  // Gold/Diamond targets restrict who can message them

  // Silver target: anyone can message
  if (t === "silver") return true;

  // Gold target: only Silver+ can message
  if (t === "gold") return vRank >= 1;

  // Diamond target: only Gold+ can message
  if (t === "diamond") return vRank >= 2;

  return true;
};

export const canViewProfile = (viewerTier?: MembershipTier, targetTier?: MembershipTier, viewer?: Pick<UserRecord, "trialExpiresAt"> | null) => {
  const v = resolveMembershipTier(viewerTier);
  const t = resolveMembershipTier(targetTier);
  const vRank = tierRank[v];
  const tRank = tierRank[t];

  // Trial users can view all profiles (Silver-equivalent access)
  if (isInTrial(viewer)) return true;

  // Free and Silver are always visible (no gatekeeping)
  if (tRank <= 1) return true;

  // Gold: only Silver+ can view
  if (t === "gold") return vRank >= 1;

  // Diamond: only Gold+ can view
  if (t === "diamond") return vRank >= 2;

  return true;
};

export const getMessageAccessError = (viewerTier?: MembershipTier, targetTier?: MembershipTier, viewer?: Pick<UserRecord, "trialExpiresAt"> | null) => {
  const v = resolveMembershipTier(viewerTier);
  const t = resolveMembershipTier(targetTier);
  const vRank = tierRank[v];

  // Trial users have full messaging access
  if (isInTrial(viewer)) return null;

  // Silver target: anyone can message
  if (t === "silver") return null;

  // Gold target: only Silver+ can message
  if (t === "gold" && vRank < 1) {
    return "Upgrade to Silver or start a free trial to message this user.";
  }

  // Diamond target: only Gold+ can message
  if (t === "diamond" && vRank < 2) {
    return "Upgrade to Gold or Diamond to message this user.";
  }

  return null;
};