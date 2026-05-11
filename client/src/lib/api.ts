import type {
  AdminStats,
  AdminUser,
  AuthResponse,
  DiscoverCard,
  MatchItem,
  MembershipTier,
  MessageItem,
  PublicUser,
  TypingEventPayload,
  VerificationRequest,
  VerificationStatus,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Login failed");
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
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Signup failed");
  }
  return (await res.json()) as AuthResponse;
};

export const adminLogin = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Admin login failed");
  }
  return (await res.json()) as AuthResponse;
};

export const getDiscoverCards = async (token: string) => {
  const res = await fetch(`${API_BASE}/discover`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch profiles");
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
    throw new Error("Failed to fetch matches");
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
    throw new Error("Refresh failed");
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
    throw new Error("Failed to get profile");
  }
  const data = (await res.json()) as { profile: PublicUser };
  return data.profile;
};

export const updateMyProfile = async (
  token: string,
  payload: Partial<Pick<PublicUser, "firstName" | "age" | "city" | "bio" | "interests" | "photos">>,
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
    throw new Error("Profile update failed");
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
    throw new Error("Verification request failed");
  }
  return (await res.json()) as { ok: boolean; status: VerificationStatus; message: string };
};

export const getMyVerificationStatus = async (token: string) => {
  const res = await fetch(`${API_BASE}/profiles/me/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to get verification status");
  }
  return (await res.json()) as { verificationStatus: VerificationStatus; verified: boolean };
};

export const getMessages = async (token: string, matchId: string) => {
  const res = await fetch(`${API_BASE}/messages/${matchId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch messages");
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
    throw new Error("Failed to send message");
  }
  const data = (await res.json()) as { message: MessageItem };
  return data.message;
};

export const markMessagesRead = async (token: string, matchId: string) => {
  await fetch(`${API_BASE}/messages/${matchId}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const sendTyping = async (token: string, matchId: string, isTyping: boolean) => {
  await fetch(`${API_BASE}/messages/${matchId}/typing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isTyping }),
  });
};

export const openMessageStream = (
  token: string,
  onMessage: (payload: { matchId: string; message: MessageItem; from: string }) => void,
  onTyping?: (payload: TypingEventPayload) => void,
) => {
  const source = new EventSource(`${API_BASE}/messages/stream?token=${encodeURIComponent(token)}`);
  source.addEventListener("message", (event) => {
    const parsed = JSON.parse(event.data) as { matchId: string; message: MessageItem; from: string };
    onMessage(parsed);
  });
  source.addEventListener("typing", (event) => {
    if (!onTyping) return;
    const parsed = JSON.parse(event.data) as TypingEventPayload;
    onTyping(parsed);
  });
  return source;
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
