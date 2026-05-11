import { Router } from "express";
import { findUserById, getUnreadCountForMatch, matches, publicUser } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";
export const matchesRouter = Router();
matchesRouter.get("/matches", requireAuth, (req, res) => {
    const me = req.authUserId;
    const mine = matches
        .filter((m) => m.userA === me || m.userB === me)
        .map((m) => {
        const otherId = m.userA === me ? m.userB : m.userA;
        const other = findUserById(otherId);
        return {
            id: m.id,
            matchedAt: m.matchedAt,
            otherUser: other ? publicUser(other) : null,
            unreadCount: getUnreadCountForMatch(m.id, me),
        };
    })
        .filter((m) => m.otherUser);
    res.json({ matches: mine });
});
