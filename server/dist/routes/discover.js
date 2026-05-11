import { Router } from "express";
import { z } from "zod";
import { createLike, createMatchIfNeeded, findUserById, findMutualLike, likes, publicUser, users, } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";
export const discoverRouter = Router();
const CITY_REGION_MAP = {
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
const normalize = (value) => value.trim().toLowerCase();
const pickDateIdea = (sharedInterests) => {
    const lower = sharedInterests.map(normalize);
    if (lower.some((i) => ["music", "live music"].includes(i)))
        return "Live music night";
    if (lower.some((i) => ["food", "cooking", "brunch", "coffee"].includes(i)))
        return "Street-food tour";
    if (lower.some((i) => ["travel", "road trips", "outdoors", "nature"].includes(i)))
        return "Mini road trip";
    return DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)];
};
const scoreCandidate = (me, candidate) => {
    const myInterests = new Set(me.interests.map(normalize));
    const theirInterests = candidate.interests.map(normalize);
    const sharedInterests = [...new Set(theirInterests.filter((i) => myInterests.has(i)))];
    const sharedInterestsScore = Math.min(45, sharedInterests.length * 15);
    const ageGap = Math.abs(me.age - candidate.age);
    const ageScore = Math.max(4, 22 - ageGap * 2);
    const myRegion = CITY_REGION_MAP[normalize(me.city)] ?? "global";
    const candidateRegion = CITY_REGION_MAP[normalize(candidate.city)] ?? "global";
    const distanceLabel = normalize(me.city) === normalize(candidate.city)
        ? "Same city"
        : myRegion === candidateRegion
            ? "Same region"
            : "Global connection";
    const locationScore = distanceLabel === "Same city" ? 18 : distanceLabel === "Same region" ? 10 : 5;
    const meBioWords = new Set(me.bio
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 4));
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
    const compatibilityBand = score >= 84 ? "Top Pick" : score >= 70 ? "Great Match" : "Good Vibe";
    return {
        score,
        reasons,
        compatibilityBand,
        dateIdea: pickDateIdea(sharedInterests),
        distanceLabel,
    };
};
discoverRouter.get("/discover", requireAuth, (req, res) => {
    const authUserId = req.authUserId;
    const me = findUserById(authUserId);
    if (!me) {
        res.status(404).json({ message: "Authenticated user not found" });
        return;
    }
    const excluded = new Set(likes
        .filter((i) => i.byUserId === authUserId)
        .map((i) => i.targetUserId));
    const cards = users
        .filter((u) => u.id !== authUserId && !excluded.has(u.id))
        .map((candidate) => {
        const scored = scoreCandidate(me, candidate);
        return {
            ...publicUser(candidate),
            matchScore: scored.score,
            compatibilityBand: scored.compatibilityBand,
            aiReasons: scored.reasons,
            dateIdea: scored.dateIdea,
            distanceLabel: scored.distanceLabel,
        };
    })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 20);
    res.json({ cards });
});
const swipeSchema = z.object({
    targetUserId: z.string().min(1),
    type: z.enum(["like", "skip", "super_like"]),
});
discoverRouter.post("/interactions/swipe", requireAuth, (req, res) => {
    const parsed = swipeSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
        return;
    }
    const targetExists = users.some((u) => u.id === parsed.data.targetUserId);
    if (!targetExists) {
        res.status(404).json({ message: "Target user not found" });
        return;
    }
    const me = req.authUserId;
    createLike(me, parsed.data.targetUserId, parsed.data.type);
    let match = null;
    if (parsed.data.type === "like" || parsed.data.type === "super_like") {
        const mutual = findMutualLike(me, parsed.data.targetUserId);
        if (mutual) {
            match = createMatchIfNeeded(me, parsed.data.targetUserId);
        }
    }
    res.json({ ok: true, match });
});
