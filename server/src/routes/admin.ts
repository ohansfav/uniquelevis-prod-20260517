import { Router } from "express";
import { z } from "zod";
import {
  approveVerification,
  deleteUserCascade,
  findUserById,
  flushStorePersistence,
  likes,
  matches,
  messages,
  rejectVerification,
  reloadStorePersistence,
  setMembershipTier,
  users,
} from "../data/store.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const adminRouter = Router();

// GET /admin/users — all users (no passwords)
adminRouter.get("/admin/users", requireAdmin, async (_req, res) => {
  await reloadStorePersistence();

  const safeUsers = users
    .filter((u) => !u.isAdmin)
    .map((u) => ({
      id: u.id,
      firstName: u.firstName,
      email: u.email,
      age: u.age,
      city: u.city,
      photos: u.photos,
      membershipTier: u.membershipTier ?? "free",
      verified: u.verified ?? false,
      verificationStatus: u.verificationStatus ?? "none",
      pendingVerificationPhoto: u.pendingVerificationPhoto,
    }));
  res.json({ users: safeUsers });
});

// GET /admin/stats — high-level counts
adminRouter.get("/admin/stats", requireAdmin, async (_req, res) => {
  await reloadStorePersistence();

  res.json({
    totalUsers: users.filter((u) => !u.isAdmin).length,
    pendingVerifications: users.filter((u) => u.verificationStatus === "pending").length,
    totalMatches: matches.length,
    totalMessages: messages.length,
    totalLikes: likes.length,
  });
});

// GET /admin/verifications — pending only
adminRouter.get("/admin/verifications", requireAdmin, async (_req, res) => {
  await reloadStorePersistence();

  const pending = users
    .filter((u) => u.verificationStatus === "pending")
    .map((u) => ({
      id: u.id,
      firstName: u.firstName,
      email: u.email,
      city: u.city,
      pendingVerificationPhoto: u.pendingVerificationPhoto,
      currentPhotos: u.photos,
    }));
  res.json({ verifications: pending });
});

// POST /admin/verifications/:userId/approve
adminRouter.post("/admin/verifications/:userId/approve", requireAdmin, async (req, res) => {
  await reloadStorePersistence();

  const ok = approveVerification(req.params.userId);
  if (!ok) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  await flushStorePersistence();
  res.json({ ok: true, message: "Profile verified and checkmark granted" });
});

// POST /admin/verifications/:userId/reject
adminRouter.post("/admin/verifications/:userId/reject", requireAdmin, async (req, res) => {
  await reloadStorePersistence();

  const ok = rejectVerification(req.params.userId);
  if (!ok) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  await flushStorePersistence();
  res.json({ ok: true, message: "Verification rejected" });
});

// PUT /admin/users/:userId/tier
const tierSchema = z.object({
  tier: z.enum(["free", "platinum", "silver", "gold", "diamond"]),
});

adminRouter.put("/admin/users/:userId/tier", requireAdmin, async (req, res) => {
  await reloadStorePersistence();

  const parsed = tierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid tier", issues: parsed.error.issues });
    return;
  }
  const user = findUserById(req.params.userId);
  if (!user || user.isAdmin) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const ok = setMembershipTier(req.params.userId, parsed.data.tier);

  await flushStorePersistence();
  res.json({ ok, tier: parsed.data.tier });
});

const billingTestSchema = z.object({
  userId: z.string().min(1),
  tier: z.enum(["platinum", "silver", "gold", "diamond"]),
});

adminRouter.post("/admin/billing/test-upgrade", requireAdmin, async (req, res) => {
  await reloadStorePersistence();

  const parsed = billingTestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const user = findUserById(parsed.data.userId);
  if (!user || user.isAdmin) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const ok = setMembershipTier(parsed.data.userId, parsed.data.tier);
  if (!ok) {
    res.status(500).json({ message: "Unable to apply test upgrade" });
    return;
  }

  await flushStorePersistence();

  res.json({ ok: true, userId: parsed.data.userId, tier: parsed.data.tier, mode: "simulated-flutterwave-webhook" });
});

// DELETE /admin/users/:userId — remove user and linked records
adminRouter.delete("/admin/users/:userId", requireAdmin, async (req, res) => {
  await reloadStorePersistence();

  const result = deleteUserCascade(req.params.userId);
  if (!result.ok) {
    const status = result.message === "User not found" ? 404 : 400;
    res.status(status).json({ message: result.message });
    return;
  }

  await flushStorePersistence();
  res.json({ ok: true, message: result.message, userId: req.params.userId });
});
