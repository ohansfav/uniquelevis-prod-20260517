import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { findUserById, setMembershipTier } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

export const billingRouter = Router();

const checkoutSchema = z.object({
  plan: z.enum(["silver", "gold", "diamond"]),
  successPath: z.string().optional(),
  cancelPath: z.string().optional(),
});

const resolvePriceId = (plan: "silver" | "gold" | "diamond") => {
  if (plan === "silver") return env.STRIPE_PRICE_SILVER;
  if (plan === "gold") return env.STRIPE_PRICE_GOLD;
  return env.STRIPE_PRICE_DIAMOND;
};

billingRouter.post("/billing/checkout", requireAuth, async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid checkout payload", issues: parsed.error.issues });
    return;
  }

  const userId = req.authUserId!;
  const user = findUserById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const priceId = resolvePriceId(parsed.data.plan);
  if (!env.STRIPE_SECRET_KEY || !priceId) {
    res.status(501).json({
      message: "Payments are not configured yet. Add Stripe keys and price IDs in server env.",
    });
    return;
  }

  const successUrl = `${env.APP_BASE_URL}${parsed.data.successPath ?? "/?upgrade=success"}`;
  const cancelUrl = `${env.APP_BASE_URL}${parsed.data.cancelPath ?? "/?upgrade=cancelled"}`;

  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("success_url", successUrl);
  body.set("cancel_url", cancelUrl);
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("customer_email", user.email);
  body.set("metadata[userId]", user.id);
  body.set("metadata[plan]", parsed.data.plan);

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      res.status(502).json({ message: `Stripe checkout creation failed: ${details || response.statusText}` });
      return;
    }

    const session = (await response.json()) as { id: string; url?: string };
    res.json({ ok: true, checkoutUrl: session.url ?? null, sessionId: session.id });
  } catch {
    res.status(502).json({ message: "Unable to connect to Stripe" });
  }
});

const completeUpgradeSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(["silver", "gold", "diamond"]),
  providerToken: z.string().min(1),
});

billingRouter.post("/billing/complete-upgrade", (req, res) => {
  // This endpoint is a safe server-side hook for wiring webhook confirmation later.
  // It is intentionally protected by a shared token for now and should be replaced
  // with Stripe webhook signature verification in production.
  const parsed = completeUpgradeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  if (!env.BILLING_PROVIDER_TOKEN || parsed.data.providerToken !== env.BILLING_PROVIDER_TOKEN) {
    res.status(401).json({ message: "Invalid provider token" });
    return;
  }

  const updated = setMembershipTier(parsed.data.userId, parsed.data.plan);
  if (!updated) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ ok: true, tier: parsed.data.plan });
});
