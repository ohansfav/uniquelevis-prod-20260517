import { Router } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  addRefreshSession,
  createUser,
  findUserByEmail,
  findUserById,
  hasRefreshSession,
  publicUser,
  revokeRefreshSession,
} from "../data/store.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 10 * 60 * 1000;
const HUMAN_CHALLENGE_TTL_MS = 5 * 60 * 1000;

type LoginAttemptState = {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number;
};

type HumanChallengeState = {
  answer: string;
  expiresAt: number;
};

const loginAttempts = new Map<string, LoginAttemptState>();
const humanChallenges = new Map<string, HumanChallengeState>();

const buildLoginAttemptKey = (ip: string, email: string) => `${ip}|${email.trim().toLowerCase()}`;

const cleanupLoginAttempts = (now: number) => {
  for (const [key, state] of loginAttempts.entries()) {
    if (state.lockedUntil > 0 && state.lockedUntil <= now) {
      loginAttempts.delete(key);
      continue;
    }
    if (state.lockedUntil === 0 && now - state.firstAttemptAt > LOCK_WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
};

const registerFailedAttempt = (key: string, now: number) => {
  const existing = loginAttempts.get(key);
  if (!existing || now - existing.firstAttemptAt > LOCK_WINDOW_MS) {
    loginAttempts.set(key, {
      count: 1,
      firstAttemptAt: now,
      lockedUntil: 0,
    });
    return;
  }

  const nextCount = existing.count + 1;
  const nextLockedUntil = nextCount >= MAX_FAILED_ATTEMPTS ? now + LOCK_WINDOW_MS : 0;
  loginAttempts.set(key, {
    count: nextCount,
    firstAttemptAt: existing.firstAttemptAt,
    lockedUntil: nextLockedUntil,
  });
};

const clearFailedAttempts = (key: string) => {
  loginAttempts.delete(key);
};

const cleanupHumanChallenges = (now: number) => {
  for (const [key, challenge] of humanChallenges.entries()) {
    if (challenge.expiresAt <= now) {
      humanChallenges.delete(key);
    }
  }
};

const createHumanChallenge = () => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const mode = Math.random() > 0.5 ? "add" : "sub";
  const challengeId = randomUUID();
  const now = Date.now();
  cleanupHumanChallenges(now);

  if (mode === "add") {
    humanChallenges.set(challengeId, {
      answer: String(a + b),
      expiresAt: now + HUMAN_CHALLENGE_TTL_MS,
    });
    return { challengeId, prompt: `${a} + ${b} = ?` };
  }

  const high = Math.max(a, b);
  const low = Math.min(a, b);
  humanChallenges.set(challengeId, {
    answer: String(high - low),
    expiresAt: now + HUMAN_CHALLENGE_TTL_MS,
  });
  return { challengeId, prompt: `${high} - ${low} = ?` };
};

authRouter.get("/auth/human-check", (_req, res) => {
  const challenge = createHumanChallenge();
  res.json(challenge);
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  firstName: z.string().min(2),
  age: z.number().int().min(18).max(80),
  city: z.string().min(2),
  bio: z.string().max(500).optional(),
});

authRouter.post("/auth/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const existing = findUserByEmail(parsed.data.email);
  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const user = await createUser(parsed.data);
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  addRefreshSession(user.id, refreshToken);

  res.status(201).json({
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  challengeId: z.string().min(1),
  challengeAnswer: z.string().min(1),
});

authRouter.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const ip = req.ip ?? "unknown";
  const now = Date.now();
  cleanupLoginAttempts(now);
  const attemptKey = buildLoginAttemptKey(ip, parsed.data.email);
  const lockState = loginAttempts.get(attemptKey);
  if (lockState?.lockedUntil && lockState.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((lockState.lockedUntil - now) / 1000);
    res.status(429).json({ message: `Too many login attempts. Try again in ${retryAfterSeconds} seconds.` });
    return;
  }

  cleanupHumanChallenges(now);
  const challenge = humanChallenges.get(parsed.data.challengeId);
  if (!challenge || challenge.expiresAt <= now) {
    res.status(403).json({ message: "Human verification expired. Please solve a new challenge." });
    return;
  }

  if (challenge.answer !== parsed.data.challengeAnswer.trim()) {
    humanChallenges.delete(parsed.data.challengeId);
    res.status(403).json({ message: "Human verification failed. Please try again." });
    return;
  }
  humanChallenges.delete(parsed.data.challengeId);

  const user = findUserByEmail(parsed.data.email);
  if (!user) {
    registerFailedAttempt(attemptKey, now);
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    registerFailedAttempt(attemptKey, now);
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  clearFailedAttempts(attemptKey);

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  addRefreshSession(user.id, refreshToken);

  res.json({
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
});

authRouter.post("/auth/admin/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const user = findUserByEmail(parsed.data.email);
  if (!user || !user.isAdmin) {
    res.status(401).json({ message: "Invalid admin credentials" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Invalid admin credentials" });
    return;
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  addRefreshSession(user.id, refreshToken);

  res.json({
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

authRouter.post("/auth/refresh", (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    const userId = payload.sub;
    if (!userId || !hasRefreshSession(userId, parsed.data.refreshToken)) {
      res.status(401).json({ message: "Refresh token is invalid" });
      return;
    }

    const user = findUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const accessToken = signAccessToken(user.id);
    res.json({ accessToken, user: publicUser(user) });
  } catch {
    res.status(401).json({ message: "Refresh token expired or invalid" });
  }
});

authRouter.post("/auth/logout", requireAuth, (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (parsed.success) {
    revokeRefreshSession(parsed.data.refreshToken);
  }

  res.json({ ok: true });
});
