import { Router } from "express";
import { z } from "zod";
import { findUserById, publicUser, reloadStorePersistence, submitVerification, updateUserProfile } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";
import { canViewProfile } from "../utils/membership.js";

export const profilesRouter = Router();

profilesRouter.get("/profiles/me", requireAuth, (req, res) => {
  const user = findUserById(req.authUserId!);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ profile: publicUser(user) });
});

profilesRouter.get("/profiles/:userId", requireAuth, (req, res) => {
  const viewer = findUserById(req.authUserId!);
  if (!viewer) {
    res.status(404).json({ message: "Authenticated user not found" });
    return;
  }

  const user = findUserById(req.params.userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (!canViewProfile(viewer.membershipTier, user.membershipTier, viewer)) {
    res.status(403).json({ message: "This profile is only visible to higher membership tiers." });
    return;
  }

  res.json({ profile: publicUser(user) });
});

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  age: z.number().int().min(18).max(80).optional(),
  city: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string().min(1)).max(15).optional(),
  pets: z.string().max(50).optional(),
  drinking: z.string().max(50).optional(),
  smoking: z.string().max(50).optional(),
  workout: z.string().max(50).optional(),
  photos: z.array(z.string().min(1).max(2_000_000)).min(1).max(6).optional(),
  gender: z.enum(["man", "woman", "other"]).optional(),
  lookingFor: z.enum(["men", "women", "everyone"]).optional(),
  datingIntent: z.enum(["short-term", "serious", "long-term"]).optional(),
});

profilesRouter.put("/profiles/me", requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  await reloadStorePersistence();
  const user = updateUserProfile(req.authUserId!, parsed.data);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ profile: publicUser(user) });
});

const verifySchema = z.object({
  photoUrl: z
    .string()
    .max(2_000_000)
    .refine(
      (value) => z.string().url().safeParse(value).success || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value),
      { message: "Provide a valid photoUrl" },
    ),
});

profilesRouter.post("/profiles/me/verify", requireAuth, async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Provide a valid photoUrl" });
    return;
  }
  const user = findUserById(req.authUserId!);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  if (user.verificationStatus === "approved") {
    res.json({ ok: true, status: "approved", message: "Already verified" });
    return;
  }
  if (user.verificationStatus === "pending") {
    res.json({ ok: true, status: "pending", message: "Verification already pending review" });
    return;
  }
  await reloadStorePersistence();
  submitVerification(req.authUserId!, parsed.data.photoUrl);
  res.json({ ok: true, status: "pending", message: "Submitted for admin review" });
});

profilesRouter.get("/profiles/me/verify", requireAuth, (req, res) => {
  const user = findUserById(req.authUserId!);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({
    verificationStatus: user.verificationStatus ?? "none",
    verified: user.verified ?? false,
  });
});
