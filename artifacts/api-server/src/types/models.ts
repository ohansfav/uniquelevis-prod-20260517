export type MembershipTier = "free" | "silver" | "gold" | "diamond";
export type VerificationStatus = "none" | "pending" | "approved" | "rejected";
export type RelationshipIntent = "short-term" | "serious" | "long-term";

export type PublicUser = {
  id: string;
  firstName: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  photos: string[];
  pets?: string;
  drinking?: string;
  smoking?: string;
  workout?: string;
  gender?: "man" | "woman" | "other";
  lookingFor?: "men" | "women" | "everyone";
  datingIntent?: RelationshipIntent;
  membershipTier?: MembershipTier;
  trialExpiresAt?: string;
  verified?: boolean;
  verificationStatus?: VerificationStatus;
};

export type UserRecord = PublicUser & {
  email: string;
  passwordHash: string;
  isAdmin?: boolean;
  verificationStatus?: VerificationStatus;
  pendingVerificationPhoto?: string;
};

export type LikeRecord = {
  id: string;
  byUserId: string;
  targetUserId: string;
  type: "like" | "skip" | "super_like";
  createdAt: string;
};

export type MatchRecord = {
  id: string;
  userA: string;
  userB: string;
  matchedAt: string;
};

export type MessageRecord = {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
  seenBy: string[];
};

export type RefreshSessionRecord = {
  id: string;
  userId: string;
  refreshToken: string;
  createdAt: string;
};
