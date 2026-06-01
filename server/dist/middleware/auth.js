import { ensureSessionUser, ensureStoreLoadedOnce } from "../data/store.js";
import { verifyAccessToken } from "../utils/jwt.js";
export const requireAuth = async (req, res, next) => {
    // On a Vercel cold start the in-memory store may only have seed users.
    // Load the full KV snapshot once so every authenticated route sees real accounts.
    await ensureStoreLoadedOnce();
    const header = req.headers.authorization;
    const queryToken = typeof req.query.token === "string" ? req.query.token : undefined;
    const token = header?.startsWith("Bearer ")
        ? header.replace("Bearer ", "").trim()
        : queryToken;
    if (!token) {
        res.status(401).json({ message: "Missing bearer token" });
        return;
    }
    try {
        const payload = verifyAccessToken(token);
        if (!payload.sub) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        ensureSessionUser(payload.sub, payload.profile);
        req.authUserId = payload.sub;
        next();
    }
    catch {
        res.status(401).json({ message: "Token expired or invalid" });
    }
};
