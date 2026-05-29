import { Router } from "express";
import { z } from "zod";
import {
  createLike,
  createMatchIfNeeded,
  findUserById,
  findMutualLike,
  flushStorePersistence,
  likes,
  matches,
  publicUser,
  refreshSessions,
  users,
} from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";
import type { UserRecord } from "../types/models.js";
import { canSeeIncomingLikes, canViewProfile } from "../utils/membership.js";

export const discoverRouter = Router();

const CITY_REGION_MAP: Record<string, string> = {
  lagos: "west-africa",
  "lagos island": "west-africa",
  abuja: "west-africa",
  "port harcourt": "west-africa",
  kano: "west-africa",
  enugu: "west-africa",
  owerri: "west-africa",
  ibadan: "west-africa",
  uyo: "west-africa",
  abeokuta: "west-africa",
  jos: "west-africa",
  london: "europe",
  madrid: "europe",
  singapore: "asia",
  toronto: "north-america",
  mumbai: "asia",
  "sao paulo": "south-america",
  tokyo: "asia",
  dubai: "middle-east",
  sydney: "oceania",
  accra: "west-africa",
};

const DATE_IDEAS = [
  "Sunset walk + coffee",
  "Bookshop date + brunch",
  "Street-food tour",
  "Live music night",
  "Museum and chill",
  "Mini road trip",
  "Cooking challenge date",
];

type CompatibilityBand = "Top Pick" | "Great Match" | "Good Vibe";

const normalize = (value: string) => value.trim().toLowerCase();

const preferenceMatchesGender = (
  lookingFor?: UserRecord["lookingFor"],
  gender?: UserRecord["gender"],
) => {
  if (!lookingFor || lookingFor === "everyone") {
    return true;
  }

  if (!gender) {
    return true;
  }

  if (gender === "other") {
    return false;
  }

  if (lookingFor === "men") {
    return gender === "man";
  }

  if (lookingFor === "women") {
    return gender === "woman";
  }

  return true;
};

const isDiscoverCompatible = (viewer: UserRecord, candidate: UserRecord) => {
  if (!preferenceMatchesGender(viewer.lookingFor, candidate.gender)) {
    return false;
  }

  if (!candidate.lookingFor || !viewer.gender) {
    return true;
  }

  return preferenceMatchesGender(candidate.lookingFor, viewer.gender);
};

const shuffle = <T>(items: T[]) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
};

const pickDateIdea = (sharedInterests: string[]) => {
  const lower = sharedInterests.map(normalize);
  if (lower.some((i) => ["music", "live music"].includes(i))) return "Live music night";
  if (lower.some((i) => ["food", "cooking", "brunch", "coffee"].includes(i))) return "Street-food tour";
  if (lower.some((i) => ["travel", "road trips", "outdoors", "nature"].includes(i))) return "Mini road trip";
  return DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)]!;
};

const scoreCandidate = (me: UserRecord, candidate: UserRecord) => {
  const myInterests = new Set(me.interests.map(normalize));
  const theirInterests = candidate.interests.map(normalize);
  const sharedInterests = [...new Set(theirInterests.filter((i) => myInterests.has(i)))];
  const sharedInterestsScore = Math.min(45, sharedInterests.length * 15);

  const ageGap = Math.abs(me.age - candidate.age);
  const ageScore = Math.max(4, 22 - ageGap * 2);

  const myRegion = CITY_REGION_MAP[normalize(me.city)] ?? "global";
  const candidateRegion = CITY_REGION_MAP[normalize(candidate.city)] ?? "global";
  const distanceLabel =
    normalize(me.city) === normalize(candidate.city)
      ? "Same city"
      : myRegion === candidateRegion
        ? "Same region"
        : "Global connection";
  const locationScore = distanceLabel === "Same city" ? 18 : distanceLabel === "Same region" ? 10 : 5;

  const meBioWords = new Set(
    me.bio
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 4),
  );
  const bioOverlap = candidate.bio
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 4 && meBioWords.has(w)).length;
  const bioScore = Math.min(10, bioOverlap * 3);

  const noveltyScore = Math.floor(Math.random() * 8);

  const score = Math.min(99, Math.round(sharedInterestsScore + ageScore + locationScore + bioScore + noveltyScore));
  const reasons = [
    sharedInterests.length > 0
      ? `${sharedInterests.length} shared interest${sharedInterests.length > 1 ? "s" : ""}`
      : "Fresh vibe outside your usual type",
    `Age match confidence ${Math.max(55, 100 - ageGap * 6)}%`,
    distanceLabel,
  ];

  const compatibilityBand: CompatibilityBand = score >= 84 ? "Top Pick" : score >= 70 ? "Great Match" : "Good Vibe";

  return {
    score,
    reasons,
    compatibilityBand,
    dateIdea: pickDateIdea(sharedInterests),
    distanceLabel,
  };
};

const parseAgeRange = (raw: string) => {
  const match = raw.trim().match(/^(\d{1,2})\s*[-:]\s*(\d{1,2})$/);
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 18 || max > 99 || min > max) {
    return null;
  }
  return { min, max };
};

type DiscoverFeedCard = ReturnType<typeof publicUser> & {
  matchScore: number;
  compatibilityBand: CompatibilityBand;
  aiReasons: string[];
  dateIdea: string;
  distanceLabel: string;
};

const buildModeReasons = (
  card: DiscoverFeedCard,
  options: { mode: string; intent: string; verifiedOnly: boolean },
) => {
  const reasons: string[] = [];

  if (options.mode === "nearby") {
    reasons.push(card.distanceLabel === "Same city" ? "Nearby now" : "Close to your region");
  } else if (options.mode === "passport") {
    reasons.push("Passport pick");
  } else if (options.mode === "boost") {
    reasons.push("Boost priority");
  } else {
    reasons.push("For you today");
  }

  if (card.compatibilityBand === "Top Pick") {
    reasons.push("Top chemistry");
  } else if (card.compatibilityBand === "Great Match") {
    reasons.push("Strong compatibility");
  }

  if (card.verified) {
    reasons.push("Verified profile");
  }

  if (options.verifiedOnly) {
    reasons.push("Trusted only");
  }

  if (options.intent === "serious") {
    reasons.push("Intent aligned: serious");
  } else if (options.intent === "casual") {
    reasons.push("Intent aligned: casual");
  }

  if (card.distanceLabel === "Global connection" && options.mode === "passport") {
    reasons.push("Global connection");
  }

  return reasons.slice(0, 3);
};

const applyDiscoverFilters = (
  cards: Array<DiscoverFeedCard & { datingIntent?: "short-term" | "serious" | "long-term" }>,
  query: {
    mode?: string;
    distance?: string;
    ageRange?: string;
    intent?: string;
    verifiedOnly?: string;
  },
) => {
  let next = [...cards];

  const verifiedOnly = String(query.verifiedOnly ?? "false").toLowerCase() === "true";
  if (verifiedOnly) {
    next = next.filter((card) => Boolean(card.verified));
  }

  if (typeof query.ageRange === "string") {
    const parsed = parseAgeRange(query.ageRange);
    if (parsed) {
      next = next.filter((card) => card.age >= parsed.min && card.age <= parsed.max);
    }
  }

  if (typeof query.distance === "string") {
    const distance = query.distance.trim().toLowerCase();
    if (distance.includes("1") || distance.includes("5")) {
      next = next.filter((card) => card.distanceLabel === "Same city");
    } else if (distance.includes("10")) {
      next = next.filter((card) => card.distanceLabel === "Same city" || card.distanceLabel === "Same region");
    } else if (distance.includes("passport")) {
      next = next.filter((card) => card.distanceLabel === "Global connection");
    }
  }

  if (typeof query.intent === "string") {
    const intent = query.intent.trim().toLowerCase();
    if (intent === "serious") {
      next = next.filter((card) => card.datingIntent === "serious");
    } else if (intent === "casual") {
      next = next.filter((card) => card.datingIntent === "short-term");
    } else if (intent === "long-term") {
      next = next.filter((card) => card.datingIntent === "long-term");
    }
  }

  if (typeof query.mode === "string") {
    const mode = query.mode.trim().toLowerCase();
    if (mode === "nearby") {
      next = next.filter((card) => card.distanceLabel === "Same city" || card.distanceLabel === "Same region");
    } else if (mode === "passport") {
      next = next.filter((card) => card.distanceLabel === "Global connection");
    } else if (mode === "boost") {
      const boosted = next.filter((card) => card.matchScore >= 65);
      if (boosted.length > 0) {
        next = boosted;
      } else {
        const fallbackSize = Math.max(6, Math.ceil(next.length * 0.35));
        next = [...next].sort((a, b) => b.matchScore - a.matchScore).slice(0, fallbackSize);
      }
    }
  }

  return next;
};

const scoreByMode = (
  card: {
    matchScore: number;
    distanceLabel: string;
    age: number;
    verified?: boolean;
    compatibilityBand: CompatibilityBand;
  },
  mode: string,
  intent: string,
  verifiedOnly: boolean,
) => {
  const distanceBoost =
    card.distanceLabel === "Same city"
      ? 10
      : card.distanceLabel === "Same region"
        ? 5
        : 0;
  const globalBoost = card.distanceLabel === "Global connection" ? 12 : 0;
  const verifiedBoost = card.verified ? 8 : 0;
  const bandBoost = card.compatibilityBand === "Top Pick" ? 8 : card.compatibilityBand === "Great Match" ? 4 : 0;

  let modeScore = card.matchScore;

  if (mode === "nearby") {
    modeScore += distanceBoost * 2;
    modeScore += card.matchScore >= 80 ? 5 : 0;
  } else if (mode === "passport") {
    modeScore += globalBoost * 2;
    modeScore -= distanceBoost;
  } else if (mode === "boost") {
    modeScore += verifiedBoost + bandBoost + 10;
  } else {
    modeScore += distanceBoost + bandBoost;
  }

  if (intent === "serious") {
    modeScore += card.matchScore >= 70 ? 8 : -6;
  } else if (intent === "casual") {
    modeScore += card.matchScore < 70 ? 8 : -4;
  } else if (intent === "long-term") {
    modeScore += card.matchScore >= 80 ? 10 : -8;
    modeScore += card.verified ? 6 : 0;
  }

  if (verifiedOnly) {
    modeScore += card.verified ? 5 : -20;
  }

  const ageCenterPenalty = Math.abs(card.age - 27);
  modeScore -= Math.min(8, Math.floor(ageCenterPenalty / 4));

  const jitter = Math.floor(Math.random() * 4);
  return modeScore + jitter;
};

const rankDiscoverCards = (
  cards: DiscoverFeedCard[],
  query: {
    mode?: string;
    intent?: string;
    verifiedOnly?: string;
  },
) => {
  const mode = query.mode?.trim().toLowerCase() ?? "for-you";
  const intent = query.intent?.trim().toLowerCase() ?? "all";
  const verifiedOnly = String(query.verifiedOnly ?? "false").toLowerCase() === "true";

  return [...cards].sort((a, b) => {
    const scoreA = scoreByMode(a, mode, intent, verifiedOnly);
    const scoreB = scoreByMode(b, mode, intent, verifiedOnly);
    return scoreB - scoreA;
  });
};

discoverRouter.get("/discover", requireAuth, (req, res) => {
  const authUserId = req.authUserId!;
  const me = findUserById(authUserId);

  if (!me) {
    res.status(404).json({ message: "Authenticated user not found" });
    return;
  }

  const recycleDeck = typeof req.query.recycle === "string" && req.query.recycle.trim().toLowerCase() === "true";
  const excluded = recycleDeck
    ? new Set<string>()
    : new Set(
        likes
          .filter((i) => i.byUserId === authUserId)
          .map((i) => i.targetUserId),
      );

  const cards = users
    .filter(
      (u) =>
        u.id !== authUserId
        && !excluded.has(u.id)
        && u.photos.length > 0
        && canViewProfile(me.membershipTier, u.membershipTier)
        && isDiscoverCompatible(me, u),
    )
    .map((candidate) => {
      const scored = scoreCandidate(me, candidate);
      const base = publicUser(candidate);
      return {
        ...base,
        photos: shuffle(base.photos),
        matchScore: scored.score,
        compatibilityBand: scored.compatibilityBand,
        aiReasons: scored.reasons,
        dateIdea: scored.dateIdea,
        distanceLabel: scored.distanceLabel,
        datingIntent: candidate.datingIntent ?? "serious",
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const filteredCards = applyDiscoverFilters(cards, {
    mode: typeof req.query.mode === "string" ? req.query.mode : undefined,
    distance: typeof req.query.distance === "string" ? req.query.distance : undefined,
    ageRange: typeof req.query.ageRange === "string" ? req.query.ageRange : undefined,
    intent: typeof req.query.intent === "string" ? req.query.intent : undefined,
    verifiedOnly: typeof req.query.verifiedOnly === "string" ? req.query.verifiedOnly : undefined,
  });

  // Do not dead-end discover when filters are too strict.
  const cardsForRanking = filteredCards.length > 0 ? filteredCards : cards;

  const rankedCards = rankDiscoverCards(cardsForRanking, {
    mode: typeof req.query.mode === "string" ? req.query.mode : undefined,
    intent: typeof req.query.intent === "string" ? req.query.intent : undefined,
    verifiedOnly: typeof req.query.verifiedOnly === "string" ? req.query.verifiedOnly : undefined,
  })
    .sort((a, b) => {
      const aActive = refreshSessions.some((s) => s.userId === a.id) ? 1 : 0;
      const bActive = refreshSessions.some((s) => s.userId === b.id) ? 1 : 0;
      return bActive - aActive;
    })
    .slice(0, 20);

  const queryMode = typeof req.query.mode === "string" ? req.query.mode.trim().toLowerCase() : "for-you";
  const queryIntent = typeof req.query.intent === "string" ? req.query.intent.trim().toLowerCase() : "all";
  const queryVerifiedOnly =
    typeof req.query.verifiedOnly === "string" && req.query.verifiedOnly.trim().toLowerCase() === "true";

  const responseCards = rankedCards.map((card) => ({
    ...card,
    modeReasons: buildModeReasons(card, {
      mode: queryMode,
      intent: queryIntent,
      verifiedOnly: queryVerifiedOnly,
    }),
  }));

  res.json({ cards: responseCards });
});

discoverRouter.get("/likes/incoming", requireAuth, (req, res) => {
  const authUserId = req.authUserId!;
  const me = findUserById(authUserId);

  if (!me) {
    res.status(404).json({ message: "Authenticated user not found" });
    return;
  }

  const matchedPairs = new Set(
    matches.map((match) => [match.userA, match.userB].sort().join("::")),
  );

  const incoming = likes
    .filter((item) => item.targetUserId === authUserId && (item.type === "like" || item.type === "super_like"))
    .filter((item) => !matchedPairs.has([item.byUserId, item.targetUserId].sort().join("::")))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const canViewLikes = canSeeIncomingLikes(me.membershipTier);
  const visibleLikes = canViewLikes
    ? incoming
        .map((item) => {
          const byUser = findUserById(item.byUserId);
          if (!byUser || !canViewProfile(me.membershipTier, byUser.membershipTier)) {
            return null;
          }

          return {
            id: item.id,
            createdAt: item.createdAt,
            type: item.type,
            byUser: publicUser(byUser),
          };
        })
        .filter(Boolean)
    : [];

  res.json({
    count: incoming.length,
    canViewLikes,
    likes: visibleLikes,
  });
});

const swipeSchema = z.object({
  targetUserId: z.string().min(1),
  type: z.enum(["like", "skip", "super_like"]),
});

discoverRouter.post("/interactions/swipe", requireAuth, async (req, res) => {
  const parsed = swipeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const me = findUserById(req.authUserId!);
  if (!me) {
    res.status(404).json({ message: "Authenticated user not found" });
    return;
  }

  const targetUser = users.find((u) => u.id === parsed.data.targetUserId);
  if (!targetUser) {
    res.status(404).json({ message: "Target user not found" });
    return;
  }

  if (!canViewProfile(me.membershipTier, targetUser.membershipTier)) {
    res.status(403).json({ message: "This profile is only visible to higher membership tiers." });
    return;
  }

  const meId = req.authUserId!;
  createLike(meId, parsed.data.targetUserId, parsed.data.type);

  let match = null;
  if (parsed.data.type === "like" || parsed.data.type === "super_like") {
    const existingMutual = findMutualLike(meId, parsed.data.targetUserId);
    if (!existingMutual) {
      // Demo-friendly behavior: some profiles like back so users can experience matching/chat.
      const shouldLikeBack = parsed.data.type === "super_like" || Math.random() < 0.4;
      if (shouldLikeBack) {
        createLike(parsed.data.targetUserId, meId, "like");
      }
    }

    const mutual = findMutualLike(meId, parsed.data.targetUserId);
    if (mutual) {
      match = createMatchIfNeeded(meId, parsed.data.targetUserId);
    }
  }

  await flushStorePersistence();
  res.json({ ok: true, match });
});
