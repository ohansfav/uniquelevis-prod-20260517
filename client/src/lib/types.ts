export type MembershipTier = "free" | "silver" | "gold" | "diamond";
export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export type PublicUser = {
  id: string;
  firstName: string;
  age: number;
  city: string;
  bio: string;
  interests: string[];
  photos: string[];
  gender?: "man" | "woman" | "other";
  lookingFor?: "men" | "women" | "everyone";
  membershipTier?: MembershipTier;
  verified?: boolean;
  verificationStatus?: VerificationStatus;
};

export type DiscoverCard = PublicUser & {
  matchScore: number;
  compatibilityBand: "Top Pick" | "Great Match" | "Good Vibe";
  aiReasons: string[];
  dateIdea: string;
  distanceLabel: string;
  modeReasons?: string[];
};

export type AuthResponse = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

export type MatchItem = {
  id: string;
  matchedAt: string;
  otherUser: PublicUser;
  unreadCount: number;
};

export type MessageItem = {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
  seenBy?: string[];
};

export type TypingEventPayload = {
  matchId: string;
  byUserId: string;
  byName: string;
  isTyping: boolean;
};

export type VerificationRequest = {
  id: string;
  firstName: string;
  email: string;
  city: string;
  pendingVerificationPhoto?: string;
  currentPhotos: string[];
};

export type AdminUser = {
  id: string;
  firstName: string;
  email: string;
  age: number;
  city: string;
  photos: string[];
  membershipTier: MembershipTier;
  verified: boolean;
  verificationStatus: VerificationStatus;
  pendingVerificationPhoto?: string;
};

export type AdminStats = {
  totalUsers: number;
  pendingVerifications: number;
  totalMatches: number;
  totalMessages: number;
  totalLikes: number;
};
