import type {
  AdminStats,
  AdminUser,
  AuthResponse,
  BillingProvider,
  DiscoverCard,
  IncomingLikeItem,
  MatchItem,
  MembershipTier,
  MessageItem,
  PaidMembershipTier,
  PublicUser,
  TypingEventPayload,
  VerificationRequest,
  VerificationStatus,
} from "./types";

// Always use the Next.js same-origin proxy so browser requests stay stable
// across environments and do not depend on cross-origin CORS/runtime behavior.
const API_BASE = "/api";

export type DiscoverQueryFilters = {
  mode?: "for-you" | "nearby" | "passport" | "boost";
  distance?: string;
  ageRange?: string;
  intent?: "Serious" | "Casual" | "Open" | "All" | "Long-term";
  verifiedOnly?: boolean;
  recycle?: boolean;
};

export type HumanCheckChallenge = {
  challengeId: string;
  prompt: string;
};

const readResponseDetails = async (res: Response) => {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await res.json().catch(() => null)) as { message?: unknown } | null;
    return typeof payload?.message === "string" ? payload.message.trim() : "";
  }

  return (await res.text().catch(() => "")).trim();
};

const readErrorMessage = async (res: Response, fallback: string) => {
  const details = await readResponseDetails(res);

  if (res.status >= 500) {
    // Prefer the server's own error message (e.g. Flutterwave passthrough errors on 502)
    if (details) return details;
    return `${fallback}. We hit a temporary server issue. Please try again in a moment.`;
  }

  if (res.status === 401 && /invalid credentials/i.test(details)) {
    return "Incorrect email or password. Check your details and try again.";
  }

  if (res.status === 403 && /human verification/i.test(details)) {
    return details;
  }

  if (details) {
    return details;
  }

  if (res.status === 429) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  if (res.status === 404) {
    return `${fallback}. API route not found. Deployment proxy may be misconfigured.`;
  }

  if (res.status === 431) {
    return `${fallback}. Request headers were too large. Please sign out and sign in again.`;
  }

  return `${fallback}. Please try again.`;
};

export const getHumanCheckChallenge = async () => {
  const res = await fetch(`${API_BASE}/auth/human-check`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to load human verification"));
  }
  return (await res.json()) as HumanCheckChallenge;
};

export const login = async (
  email: string,
  password: string,
  verification?: { challengeId: string; challengeAnswer: string },
) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      challengeId: verification?.challengeId,
      challengeAnswer: verification?.challengeAnswer,
    }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Login failed"));
  }
  return (await res.json()) as AuthResponse;
};

export const signup = async (payload: {
  email: string;
  password: string;
  firstName: string;
  age: number;
  city: string;
}) => {
  const url = `${API_BASE}/auth/signup`;
  console.log(`[API] Signup request to: ${url}`);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log(`[API] Signup response status: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const errorMsg = await readErrorMessage(res, "Signup failed");
    console.error(`[API] Signup error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
  return (await res.json()) as AuthResponse;
};

export const adminLogin = async (
  email: string,
  password: string,
  verification?: { challengeId: string; challengeAnswer: string },
) => {
  const res = await fetch(`${API_BASE}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      challengeId: verification?.challengeId,
      challengeAnswer: verification?.challengeAnswer,
    }),
  });
  if (!res.ok) {
    throw new Error("Admin login failed");
  }
  return (await res.json()) as AuthResponse;
};

export const getDiscoverCards = async (token: string, filters: DiscoverQueryFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.distance) params.set("distance", filters.distance);
  if (filters.ageRange) params.set("ageRange", filters.ageRange);
  if (filters.intent) params.set("intent", filters.intent);
  if (typeof filters.verifiedOnly === "boolean") params.set("verifiedOnly", String(filters.verifiedOnly));
  if (typeof filters.recycle === "boolean") params.set("recycle", String(filters.recycle));

  const query = params.toString();
  const res = await fetch(`${API_BASE}/discover${query ? `?${query}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to fetch profiles"));
  }
  const data = (await res.json()) as { cards: DiscoverCard[] };
  return data.cards;
};

export const sendSwipe = async (
  token: string,
  targetUserId: string,
  type: "like" | "skip" | "super_like",
) => {
  const res = await fetch(`${API_BASE}/interactions/swipe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetUserId, type }),
  });

  if (!res.ok) {
    throw new Error("Swipe failed");
  }

  return (await res.json()) as { ok: boolean; match: MatchItem | null };
};

export const getMatches = async (token: string) => {
  const res = await fetch(`${API_BASE}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to fetch matches"));
  }
  const data = (await res.json()) as { matches: MatchItem[] };
  return data.matches;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Refresh failed"));
  }
  return (await res.json()) as { accessToken: string; user: PublicUser };
};

export const logout = async (token: string, refreshToken: string) => {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
};

export const getMyProfile = async (token: string) => {
  const res = await fetch(`${API_BASE}/profiles/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to get profile"));
  }
  const data = (await res.json()) as { profile: PublicUser };
  return data.profile;
};

export const updateMyProfile = async (
  token: string,
  payload: Partial<Pick<PublicUser, "firstName" | "age" | "city" | "bio" | "interests" | "photos" | "gender" | "lookingFor" | "datingIntent">>,
) => {
  const res = await fetch(`${API_BASE}/profiles/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Profile update failed"));
  }
  const data = (await res.json()) as { profile: PublicUser };
  return data.profile;
};

export const requestProfileVerification = async (token: string, photoUrl: string) => {
  const res = await fetch(`${API_BASE}/profiles/me/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ photoUrl }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Verification request failed"));
  }
  return (await res.json()) as { ok: boolean; status: VerificationStatus; message: string };
};

export const getMyVerificationStatus = async (token: string) => {
  const res = await fetch(`${API_BASE}/profiles/me/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to get verification status"));
  }
  return (await res.json()) as { verificationStatus: VerificationStatus; verified: boolean };
};

export const getMessages = async (token: string, matchId: string) => {
  const res = await fetch(`${API_BASE}/messages/${matchId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to fetch messages"));
  }
  const data = (await res.json()) as { messages: MessageItem[] };
  return data.messages;
};

export const sendMessage = async (token: string, matchId: string, text: string) => {
  const res = await fetch(`${API_BASE}/messages/${matchId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to send message"));
  }
  const data = (await res.json()) as { message: MessageItem };
  return data.message;
};

export const markMessagesRead = async (token: string, matchId: string) => {
  const res = await fetch(`${API_BASE}/messages/${matchId}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to mark messages read"));
  }
};

export const sendTyping = async (token: string, matchId: string, isTyping: boolean) => {
  const res = await fetch(`${API_BASE}/messages/${matchId}/typing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isTyping }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to send typing event"));
  }
};

export const openMessageStream = (
  token: string,
  onMessage: (payload: { matchId: string; message: MessageItem; from: string }) => void,
  onTyping?: (payload: TypingEventPayload) => void,
  onReady?: () => void,
  onError?: () => void,
) => {
  const source = new EventSource(`${API_BASE}/messages/stream?token=${encodeURIComponent(token)}`);
  source.addEventListener("ready", () => {
    if (onReady) onReady();
  });
  source.addEventListener("message", (event) => {
    const parsed = JSON.parse(event.data) as { matchId: string; message: MessageItem; from: string };
    onMessage(parsed);
  });
  source.addEventListener("typing", (event) => {
    if (!onTyping) return;
    const parsed = JSON.parse(event.data) as TypingEventPayload;
    onTyping(parsed);
  });
  source.addEventListener("error", () => {
    if (onError) onError();
  });
  return source;
};

export const createUpgradeCheckout = async (
  token: string,
  plan: PaidMembershipTier,
  provider?: BillingProvider,
) => {
  const res = await fetch(`${API_BASE}/billing/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      plan,
      provider,
      successPath: "/?upgrade=success",
      cancelPath: "/?upgrade=cancelled",
    }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Unable to start checkout"));
  }
  return (await res.json()) as { ok: boolean; provider: BillingProvider; checkoutUrl: string | null; sessionId: string; reference?: string };
};

export const verifyUpgradeCheckout = async (
  token: string,
  reference: string,
  provider?: BillingProvider,
) => {
  const res = await fetch(`${API_BASE}/billing/verify-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reference, provider }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Unable to verify payment"));
  }

  return (await res.json()) as { ok: boolean; provider: BillingProvider; tier: PaidMembershipTier; reference: string };
};

export const getBillingConfig = async () => {
  const res = await fetch(`${API_BASE}/billing/config`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to load billing config"));
  }

  return (await res.json()) as {
    provider: BillingProvider;
    checkoutConfigured: boolean;
    webhookConfigured: boolean;
    publicKeyConfigured: boolean;
    planAmounts: { platinum: number; silver: number; gold: number; diamond: number };
    providers?: {
      flutterwave: { checkoutConfigured: boolean; missing: string[] };
    };
    missing: string[];
    checkoutMissing: string[];
    optionalMissing: string[];
  };
};

export const getIncomingLikes = async (token: string) => {
  const res = await fetch(`${API_BASE}/likes/incoming`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to fetch incoming likes"));
  }
  return (await res.json()) as {
    count: number;
    canViewLikes: boolean;
    likes: IncomingLikeItem[];
  };
};

export const getAdminStats = async (token: string) => {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch admin stats");
  }
  return (await res.json()) as AdminStats;
};

export const getAdminUsers = async (token: string) => {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch admin users");
  }
  const data = (await res.json()) as { users: AdminUser[] };
  return data.users;
};

export const getPendingVerifications = async (token: string) => {
  const res = await fetch(`${API_BASE}/admin/verifications`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch verification requests");
  }
  const data = (await res.json()) as { verifications: VerificationRequest[] };
  return data.verifications;
};

export const approveVerificationByAdmin = async (token: string, userId: string) => {
  const res = await fetch(`${API_BASE}/admin/verifications/${userId}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to approve verification");
  }
  return (await res.json()) as { ok: boolean; message: string };
};

export const rejectVerificationByAdmin = async (token: string, userId: string) => {
  const res = await fetch(`${API_BASE}/admin/verifications/${userId}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to reject verification");
  }
  return (await res.json()) as { ok: boolean; message: string };
};

export const updateUserTierByAdmin = async (token: string, userId: string, tier: MembershipTier) => {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/tier`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tier }),
  });
  if (!res.ok) {
    throw new Error("Failed to update tier");
  }
  return (await res.json()) as { ok: boolean; tier: MembershipTier };
};

export const runAdminBillingTestUpgrade = async (
  token: string,
  userId: string,
  tier: PaidMembershipTier,
) => {
  const res = await fetch(`${API_BASE}/admin/billing/test-upgrade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, tier }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Failed to run billing test"));
  }

  return (await res.json()) as { ok: boolean; userId: string; tier: PaidMembershipTier; mode: string };
};
