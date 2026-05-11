import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { addRefreshSession, createUser, findUserByEmail, findUserById, hasRefreshSession, publicUser, revokeRefreshSession, } from "../data/store.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";
export const authRouter = Router();
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
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
});
authRouter.post("/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
        return;
    }
    const user = findUserByEmail(parsed.data.email);
    if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }
    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
        res.status(401).json({ message: "Invalid credentials" });
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
    }
    catch {
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
