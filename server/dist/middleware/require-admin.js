import { findUserById } from "../data/store.js";
import { verifyAccessToken } from "../utils/jwt.js";
export const requireAdmin = (req, res, next) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.replace("Bearer ", "").trim() : undefined;
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
        const user = findUserById(payload.sub);
        if (!user?.isAdmin) {
            res.status(403).json({ message: "Forbidden: admin only" });
            return;
        }
        req.authUserId = payload.sub;
        next();
    }
    catch {
        res.status(401).json({ message: "Token expired or invalid" });
    }
};
