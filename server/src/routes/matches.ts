import { Router } from "express";
import { findUserById, getUnreadCountForMatch, matches, publicUser } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";
import { canViewProfile } from "../utils/membership.js";

export const matchesRouter = Router();

matchesRouter.get("/matches", requireAuth, (req, res) => {
  const me = req.authUserId!;
  const viewer = findUserById(me);

  if (!viewer) {
    res.status(404).json({ message: "Authenticated user not found" });
    return;
  }

  const mine = matches
    .filter((m) => m.userA === me || m.userB === me)
    .map((m) => {
      const otherId = m.userA === me ? m.userB : m.userA;
      const other = findUserById(otherId);
      if (!other || !canViewProfile(viewer.membershipTier, other.membershipTier)) {
        return null;
      }
      return {
        id: m.id,
        matchedAt: m.matchedAt,
        otherUser: other ? publicUser(other) : null,
        unreadCount: getUnreadCountForMatch(m.id, me),
      };
    })
    .filter((m): m is NonNullable<typeof m> => Boolean(m?.otherUser));

  res.json({ matches: mine });
});
