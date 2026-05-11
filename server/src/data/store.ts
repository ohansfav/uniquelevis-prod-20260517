import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import bcrypt from "bcryptjs";
import type {
  LikeRecord,
  MatchRecord,
  MessageRecord,
  PublicUser,
  RefreshSessionRecord,
  UserRecord,
  VerificationStatus,
} from "../types/models.js";

const seedPassword = bcrypt.hashSync("Password123!", 10);
const adminPassword = bcrypt.hashSync("AdminPass123!", 10);

const STORE_FILE = join(process.cwd(), "data", "store.json");

type StoreSnapshot = {
  users: UserRecord[];
  likes: LikeRecord[];
  matches: MatchRecord[];
  messages: MessageRecord[];
  refreshSessions: RefreshSessionRecord[];
};

const adminUser: UserRecord = {
  id: "u-admin",
  email: "admin@uniquelevis.com",
  passwordHash: adminPassword,
  firstName: "Admin",
  age: 30,
  city: "Lagos",
  bio: "App Administrator",
  interests: [],
  photos: [],
  isAdmin: true,
  membershipTier: "diamond",
  verified: true,
  verificationStatus: "approved",
};

const seedUsers: UserRecord[] = [
  {
    id: "u-100",
    email: "ava@example.com",
    passwordHash: seedPassword,
    firstName: "Ava",
    membershipTier: "gold",
    verified: true,
    verificationStatus: "approved",
    age: 24,
    city: "Lagos Island",
    bio: "Architect by day, foodie by night. I love deep talks and long drives.",
    interests: ["Travel", "Live Music", "Photography", "Art"],
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80"
    ],
  },
  {
    id: "u-101",
    email: "mila@example.com",
    passwordHash: seedPassword,
    firstName: "Mila",
    age: 27,
    city: "Abuja",
    membershipTier: "diamond",
    verified: true,
    verificationStatus: "approved",
    bio: "Startup builder, gym regular, and sunset chaser.",
    interests: ["Fitness", "Business", "Art"],
    photos: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80"
    ],
  },
  {
    id: "u-102",
    email: "noah@example.com",
    passwordHash: seedPassword,
    firstName: "Noah",
    age: 29,
    city: "Port Harcourt",
    bio: "Product designer, coffee snob, and beach volleyball addict.",
    interests: ["Design", "Coffee", "Beach"],
    photos: [
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=900&q=80"
    ],
  },
  {
    id: "u-103",
    email: "zainab@example.com",
    passwordHash: seedPassword,
    firstName: "Zainab",
    age: 26,
    city: "Kano",
    bio: "Book lover, entrepreneur, and lover of spontaneous weekend trips.",
    interests: ["Books", "Food", "Travel"],
    photos: [
      "https://images.unsplash.com/photo-1542204625-de293a06df02?w=900&q=80",
      "https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=900&q=80"
    ],
  },
  {
    id: "u-104",
    email: "ifeanyi@example.com",
    passwordHash: seedPassword,
    firstName: "Ifeanyi",
    age: 30,
    city: "Enugu",
    bio: "Creative director who enjoys hikes, local art scenes, and deep conversations.",
    interests: ["Hiking", "Art", "Film"],
    photos: [
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900&q=80",
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&q=80"
    ],
  },
  {
    id: "u-105",
    email: "chioma@example.com",
    passwordHash: seedPassword,
    firstName: "Chioma",
    age: 25,
    city: "Owerri",
    bio: "Chef in progress, lover of laughs, rain playlists, and late-night chats.",
    interests: ["Cooking", "Music", "Comedy"],
    photos: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80"
    ],
  },
  {
    id: "u-106",
    email: "temi@example.com",
    passwordHash: seedPassword,
    firstName: "Temi",
    age: 28,
    city: "Ibadan",
    bio: "Civil engineer, football fan, and soft-life advocate with weekend road-trip energy.",
    interests: ["Football", "Road Trips", "Tech"],
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80",
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=900&q=80"
    ],
  },
  {
    id: "u-107",
    email: "amara@example.com",
    passwordHash: seedPassword,
    firstName: "Amara",
    age: 27,
    city: "Uyo",
    bio: "Product manager who loves beach sunsets, podcasts, and trying new restaurants.",
    interests: ["Podcasts", "Beach", "Brunch"],
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80"
    ],
  },
  {
    id: "u-108",
    email: "wale@example.com",
    passwordHash: seedPassword,
    firstName: "Wale",
    age: 31,
    city: "Abeokuta",
    bio: "Photographer and storyteller. Always chasing sunrise and good coffee.",
    interests: ["Photography", "Coffee", "Nature"],
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80"
    ],
  },
  {
    id: "u-109",
    email: "bola@example.com",
    passwordHash: seedPassword,
    firstName: "Bola",
    age: 24,
    city: "Jos",
    bio: "Tech analyst, dance class regular, and believer in kind-hearted love.",
    interests: ["Dance", "Tech", "Movies"],
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80"
    ],
  },
  {
    id: "u-110",
    email: "sophia@example.com",
    passwordHash: seedPassword,
    firstName: "Sophia",
    age: 28,
    city: "London",
    bio: "Art curator, city explorer, and fan of long conversations over coffee.",
    interests: ["Art", "Museums", "Coffee"],
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80"
    ],
  },
  {
    id: "u-111",
    email: "diego@example.com",
    passwordHash: seedPassword,
    firstName: "Diego",
    age: 30,
    city: "Madrid",
    bio: "Food lover and weekend cyclist. Looking for good energy and real chemistry.",
    interests: ["Cycling", "Food", "Travel"],
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80"
    ],
  },
  {
    id: "u-112",
    email: "mei@example.com",
    passwordHash: seedPassword,
    firstName: "Mei",
    age: 26,
    city: "Singapore",
    bio: "UI designer, tea enthusiast, and always planning my next getaway.",
    interests: ["Design", "Tea", "Travel"],
    photos: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&q=80",
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=900&q=80"
    ],
  },
  {
    id: "u-113",
    email: "liam@example.com",
    passwordHash: seedPassword,
    firstName: "Liam",
    age: 32,
    city: "Toronto",
    bio: "Engineer by day, live music hunter by night, and always up for great banter.",
    interests: ["Live Music", "Tech", "Skiing"],
    photos: [
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=900&q=80",
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&q=80"
    ],
  },
  {
    id: "u-114",
    email: "anika@example.com",
    passwordHash: seedPassword,
    firstName: "Anika",
    age: 27,
    city: "Mumbai",
    bio: "Marketer, dancer, and hopeless romantic with a soft spot for beach sunsets.",
    interests: ["Dance", "Beach", "Reading"],
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80"
    ],
  },
  {
    id: "u-115",
    email: "leandro@example.com",
    passwordHash: seedPassword,
    firstName: "Leandro",
    age: 29,
    city: "Sao Paulo",
    bio: "Startup founder, football fan, and lover of spontaneous adventures.",
    interests: ["Football", "Startups", "Travel"],
    photos: [
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=900&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80"
    ],
  },
  {
    id: "u-116",
    email: "hana@example.com",
    passwordHash: seedPassword,
    firstName: "Hana",
    age: 25,
    city: "Tokyo",
    bio: "Photographer, ramen explorer, and fan of cozy rainy evenings.",
    interests: ["Photography", "Food", "Anime"],
    photos: [
      "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=900&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&q=80"
    ],
  },
  {
    id: "u-117",
    email: "amal@example.com",
    passwordHash: seedPassword,
    firstName: "Amal",
    age: 31,
    city: "Dubai",
    bio: "Finance professional, desert-roadtrip lover, and always down for deep talks.",
    interests: ["Business", "Road Trips", "Fitness"],
    photos: [
      "https://images.unsplash.com/photo-1542204625-de293a06df02?w=900&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80"
    ],
  },
  {
    id: "u-118",
    email: "emma@example.com",
    passwordHash: seedPassword,
    firstName: "Emma",
    age: 29,
    city: "Sydney",
    bio: "Surfer, product lead, and believer in laughter-first dates.",
    interests: ["Surfing", "Product", "Outdoors"],
    photos: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80",
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=900&q=80"
    ],
  },
  {
    id: "u-119",
    email: "kofi@example.com",
    passwordHash: seedPassword,
    firstName: "Kofi",
    age: 30,
    city: "Accra",
    bio: "Music producer, weekend chef, and fan of warm-hearted people.",
    interests: ["Music", "Cooking", "Culture"],
    photos: [
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=900&q=80",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80"
    ],
  },
];

export const users: UserRecord[] = [adminUser, ...seedUsers];

export const likes: LikeRecord[] = [];
export const matches: MatchRecord[] = [];
export const messages: MessageRecord[] = [];
export const refreshSessions: RefreshSessionRecord[] = [];

const defaultSnapshot = (): StoreSnapshot => ({
  users: [adminUser, ...seedUsers],
  likes: [],
  matches: [],
  messages: [],
  refreshSessions: [],
});

const ensureSeedUsers = () => {
  for (const seed of [adminUser, ...seedUsers]) {
    const found = users.some((u) => u.email.toLowerCase() === seed.email.toLowerCase());
    if (!found) {
      users.push({ ...seed });
    }
  }
};

const writeSnapshot = () => {
  const snapshot: StoreSnapshot = {
    users,
    likes,
    matches,
    messages,
    refreshSessions,
  };

  mkdirSync(dirname(STORE_FILE), { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(snapshot, null, 2));
};

export const initStore = () => {
  if (!existsSync(STORE_FILE)) {
    writeSnapshot();
    return;
  }

  try {
    const raw = readFileSync(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreSnapshot>;

    const normalizedMessages = (parsed.messages ?? []).map((m) => ({
      ...m,
      seenBy: Array.isArray(m.seenBy) ? m.seenBy : [m.senderId],
    }));

    users.splice(0, users.length, ...(parsed.users ?? defaultSnapshot().users));
    ensureSeedUsers();
    users.forEach((user) => {
      user.membershipTier = user.membershipTier ?? "free";
      user.verified = user.verified ?? false;
      user.verificationStatus = user.verificationStatus ?? "none";
    });
    likes.splice(0, likes.length, ...(parsed.likes ?? []));
    matches.splice(0, matches.length, ...(parsed.matches ?? []));
    messages.splice(0, messages.length, ...normalizedMessages);
    refreshSessions.splice(0, refreshSessions.length, ...(parsed.refreshSessions ?? []));

    writeSnapshot();
  } catch {
    writeSnapshot();
  }
};

export const publicUser = (user: UserRecord): PublicUser => ({
  id: user.id,
  firstName: user.firstName,
  age: user.age,
  city: user.city,
  bio: user.bio,
  interests: user.interests,
  photos: user.photos,
  membershipTier: user.membershipTier ?? "free",
  verified: user.verified ?? false,
  verificationStatus: user.verificationStatus ?? "none",
});

export const submitVerification = (userId: string, photoUrl: string): boolean => {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  user.verificationStatus = "pending";
  user.pendingVerificationPhoto = photoUrl;
  writeSnapshot();
  return true;
};

export const approveVerification = (userId: string): boolean => {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  user.verificationStatus = "approved";
  user.verified = true;
  if (user.pendingVerificationPhoto) {
    if (!user.photos.includes(user.pendingVerificationPhoto)) {
      user.photos.unshift(user.pendingVerificationPhoto);
    }
    user.pendingVerificationPhoto = undefined;
  }
  writeSnapshot();
  return true;
};

export const rejectVerification = (userId: string): boolean => {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  user.verificationStatus = "rejected";
  user.pendingVerificationPhoto = undefined;
  writeSnapshot();
  return true;
};

export const setMembershipTier = (userId: string, tier: UserRecord["membershipTier"]): boolean => {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  user.membershipTier = tier;
  writeSnapshot();
  return true;
};

export const findUserByEmail = (email: string) =>
  users.find((u) => u.email.toLowerCase() === email.toLowerCase());

export const findUserById = (id: string) => users.find((u) => u.id === id);

export const updateUserProfile = (
  userId: string,
  input: Partial<Pick<UserRecord, "firstName" | "age" | "city" | "bio" | "interests" | "photos">>,
) => {
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  Object.assign(user, input);
  writeSnapshot();
  return user;
};

export const createUser = async (input: {
  email: string;
  password: string;
  firstName: string;
  age: number;
  city: string;
  bio?: string;
}) => {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const record: UserRecord = {
    id: randomUUID(),
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    age: input.age,
    city: input.city,
    bio: input.bio ?? "New here and open to meaningful connections.",
    interests: ["Music", "Movies"],
    photos: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&q=80"],
    membershipTier: "free",
    verified: false,
    verificationStatus: "none",
  };
  users.push(record);
  writeSnapshot();
  return record;
};

export const createLike = (byUserId: string, targetUserId: string, type: LikeRecord["type"]) => {
  const existing = likes.find((like) => like.byUserId === byUserId && like.targetUserId === targetUserId);
  if (existing) {
    existing.type = type;
    return existing;
  }
  const item: LikeRecord = {
    id: randomUUID(),
    byUserId,
    targetUserId,
    type,
    createdAt: new Date().toISOString(),
  };
  likes.push(item);
  writeSnapshot();
  return item;
};

export const findMutualLike = (userId: string, targetUserId: string) =>
  likes.find((l) => l.byUserId === targetUserId && l.targetUserId === userId && (l.type === "like" || l.type === "super_like"));

export const createMatchIfNeeded = (userId: string, targetUserId: string) => {
  const pair = [userId, targetUserId].sort();
  const existing = matches.find((m) => m.userA === pair[0] && m.userB === pair[1]);
  if (existing) {
    return existing;
  }
  const match: MatchRecord = {
    id: randomUUID(),
    userA: pair[0],
    userB: pair[1],
    matchedAt: new Date().toISOString(),
  };
  matches.push(match);
  writeSnapshot();
  return match;
};

export const isUserInMatch = (matchId: string, userId: string) => {
  const match = matches.find((m) => m.id === matchId);
  if (!match) return false;
  return match.userA === userId || match.userB === userId;
};

export const createMessage = (matchId: string, senderId: string, text: string) => {
  const message: MessageRecord = {
    id: randomUUID(),
    matchId,
    senderId,
    text,
    createdAt: new Date().toISOString(),
    seenBy: [senderId],
  };
  messages.push(message);
  writeSnapshot();
  return message;
};

export const getMessagesByMatch = (matchId: string) =>
  messages
    .filter((m) => m.matchId === matchId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const markMessagesRead = (matchId: string, userId: string) => {
  let changed = false;
  messages
    .filter((m) => m.matchId === matchId)
    .forEach((m) => {
      if (!Array.isArray(m.seenBy)) {
        m.seenBy = [m.senderId];
        changed = true;
      }
      if (!m.seenBy.includes(userId)) {
        m.seenBy.push(userId);
        changed = true;
      }
    });

  if (changed) {
    writeSnapshot();
  }
};

export const getUnreadCountForMatch = (matchId: string, userId: string) =>
  messages.filter(
    (m) =>
      m.matchId === matchId &&
      m.senderId !== userId &&
      !(Array.isArray(m.seenBy) ? m.seenBy : [m.senderId]).includes(userId),
  ).length;

export const addRefreshSession = (userId: string, refreshToken: string) => {
  const session: RefreshSessionRecord = {
    id: randomUUID(),
    userId,
    refreshToken,
    createdAt: new Date().toISOString(),
  };
  refreshSessions.push(session);
  writeSnapshot();
  return session;
};

export const hasRefreshSession = (userId: string, refreshToken: string) =>
  refreshSessions.some((s) => s.userId === userId && s.refreshToken === refreshToken);

export const revokeRefreshSession = (refreshToken: string) => {
  const index = refreshSessions.findIndex((s) => s.refreshToken === refreshToken);
  if (index >= 0) {
    refreshSessions.splice(index, 1);
    writeSnapshot();
  }
};
