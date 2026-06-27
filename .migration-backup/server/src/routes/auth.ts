import { Router } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { UserRecord } from "../types/models.js";
import {
  addRefreshSession,
  canEnforceRefreshSessions,
  createUser,
  ensureSessionUser,
  findUserByEmail,
  findUserById,
  flushStorePersistence,
  hasRefreshSession,
  publicUser,
  reloadStorePersistence,
  revokeRefreshSession,
  revokeUserRefreshSessions,
} from "../data/store.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const toSessionProfile = (user: UserRecord | null | undefined) => {
  if (!user) return undefined;
  return {
    email: user.email,
    firstName: user.firstName,
    age: user.age,
    city: user.city,
    // Keep JWT payload lean to avoid oversized Authorization headers.
    datingIntent: user.datingIntent,
    membershipTier: user.membershipTier,
    verified: user.verified,
    verificationStatus: user.verificationStatus,
  };
};

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

const normalizePasswordInput = (password: string) => password.normalize("NFKC").trim();

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

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const normalizedPassword = normalizePasswordInput(parsed.data.password);

  if (!normalizedPassword) {
    res.status(400).json({ message: "Password cannot be empty" });
    return;
  }

  await reloadStorePersistence();

  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const user = await createUser({
    ...parsed.data,
    email: normalizedEmail,
    password: normalizedPassword,
  });
  const accessToken = signAccessToken(user.id, toSessionProfile(user));
  const refreshToken = signRefreshToken(user.id, toSessionProfile(user));
  addRefreshSession(user.id, refreshToken);
  await flushStorePersistence();

  res.status(201).json({
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  challengeId: z.string().trim().min(1).optional(),
  challengeAnswer: z.string().trim().min(1).optional(),
});

authRouter.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const normalizedPassword = normalizePasswordInput(parsed.data.password);

  await reloadStorePersistence();

  const ip = req.ip ?? "unknown";
  const now = Date.now();
  cleanupLoginAttempts(now);
  const attemptKey = buildLoginAttemptKey(ip, normalizedEmail);
  const lockState = loginAttempts.get(attemptKey);
  if (lockState?.lockedUntil && lockState.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((lockState.lockedUntil - now) / 1000);
    res.status(429).json({ message: `Too many login attempts. Try again in ${retryAfterSeconds} seconds.` });
    return;
  }

  const challengeId = parsed.data.challengeId?.trim() ?? "";
  const challengeAnswer = parsed.data.challengeAnswer?.trim() ?? "";
  const hasChallengePayload = Boolean(challengeId || challengeAnswer);

  if (hasChallengePayload) {
    if (!challengeId || !challengeAnswer) {
      res.status(403).json({ message: "Human verification is incomplete. Please try again." });
      return;
    }

    cleanupHumanChallenges(now);
    const challenge = humanChallenges.get(challengeId);
    if (!challenge || challenge.expiresAt <= now) {
      res.status(403).json({ message: "Human verification expired. Please solve a new challenge." });
      return;
    }

    if (challenge.answer !== challengeAnswer) {
      humanChallenges.delete(challengeId);
      res.status(403).json({ message: "Human verification failed. Please try again." });
      return;
    }
    humanChallenges.delete(challengeId);
  }

  const user = findUserByEmail(normalizedEmail);
  if (!user) {
    registerFailedAttempt(attemptKey, now);
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const validRaw = await bcrypt.compare(parsed.data.password, user.passwordHash);
  const shouldTryNormalized = normalizedPassword.length > 0 && normalizedPassword !== parsed.data.password;
  const validNormalized = shouldTryNormalized
    ? await bcrypt.compare(normalizedPassword, user.passwordHash)
    : false;
  const valid = validRaw || validNormalized;
  if (!valid) {
    registerFailedAttempt(attemptKey, now);
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  clearFailedAttempts(attemptKey);

  const accessToken = signAccessToken(user.id, toSessionProfile(user));
  const refreshToken = signRefreshToken(user.id, toSessionProfile(user));
  addRefreshSession(user.id, refreshToken);
  await flushStorePersistence();

  res.json({
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/auth/admin/login", async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  await reloadStorePersistence();

  const user = findUserByEmail(normalizedEmail);
  if (!user || !user.isAdmin) {
    res.status(401).json({ message: "Invalid admin credentials" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Invalid admin credentials" });
    return;
  }

  const accessToken = signAccessToken(user.id, toSessionProfile(user));
  const refreshToken = signRefreshToken(user.id, toSessionProfile(user));
  addRefreshSession(user.id, refreshToken);
  await flushStorePersistence();

  res.json({
    user: publicUser(user),
    accessToken,
    refreshToken,
  });
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

authRouter.post("/auth/refresh", async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    const userId = payload.sub;

    // Always reload from KV before checking sessions/users.
    // Vercel may route this request to a cold-start instance whose in-memory
    // store is stale (e.g. different from the instance that handled login).
    await reloadStorePersistence();

    const shouldRequireTrackedRefreshSession = canEnforceRefreshSessions();
    if (!userId || (shouldRequireTrackedRefreshSession && !hasRefreshSession(userId, parsed.data.refreshToken))) {
      res.status(401).json({ message: "Refresh token is invalid" });
      return;
    }

    const user = findUserById(userId) ?? ensureSessionUser(userId, payload.profile);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const accessToken = signAccessToken(user.id, toSessionProfile(user));
    res.json({ accessToken, user: publicUser(user) });
  } catch {
    res.status(401).json({ message: "Refresh token expired or invalid" });
  }
});

// Simple Google ID token sign-in scaffold.
// Accepts a Google ID token from the client, verifies it using
// Google's tokeninfo endpoint, and signs the user in (or creates
// a new account if none exists). This is intentionally lightweight
// so you can wire a client-side Google Identity flow later.
authRouter.post("/auth/google", async (req, res) => {
  const idToken = String(req.body?.idToken ?? "").trim();
  if (!idToken) {
    res.status(400).json({ message: "Missing idToken" });
    return;
  }

  try {
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!resp.ok) {
      res.status(401).json({ message: "Invalid Google ID token" });
      return;
    }

    const info = await resp.json();
    const email = (info.email || "").toString().trim().toLowerCase();
    if (!email) {
      res.status(400).json({ message: "Google token did not contain an email" });
      return;
    }

    // Optional: validate audience if GOOGLE_CLIENT_ID is set in env.
    if (process.env.GOOGLE_CLIENT_ID && info.aud && info.aud !== process.env.GOOGLE_CLIENT_ID) {
      res.status(403).json({ message: "Google ID token audience mismatch" });
      return;
    }

    await reloadStorePersistence();

    let user = findUserByEmail(email);
    if (!user) {
      // Create a lightweight account for this Google user. Use a random
      // password so the account can't be used directly with email/password.
      const firstName = info.given_name || (info.name ? String(info.name).split(" ")[0] : "") || "New";
      const randPw = randomUUID();
      const created = await createUser({
        email,
        password: randPw,
        firstName,
        age: 25,
        city: "",
        bio: "",
      });
      user = findUserByEmail(email);
    }

    if (!user) {
      res.status(500).json({ message: "Failed to create or find user" });
      return;
    }

    const accessToken = signAccessToken(user.id, toSessionProfile(user));
    const refreshToken = signRefreshToken(user.id, toSessionProfile(user));
    addRefreshSession(user.id, refreshToken);
    await flushStorePersistence();

    res.json({ user: publicUser(user), accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: "Google token verification failed" });
  }
});

authRouter.post("/auth/logout", requireAuth, async (req, res) => {
  await reloadStorePersistence();
  revokeUserRefreshSessions(req.authUserId!);

  const parsed = refreshSchema.safeParse(req.body);
  if (parsed.success) {
    revokeRefreshSession(parsed.data.refreshToken);
  }

  await flushStorePersistence();

  res.json({ ok: true });
});
