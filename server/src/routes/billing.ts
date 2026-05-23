import { createHmac, timingSafeEqual } from "node:crypto";
import express, { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { findUserById, setMembershipTier } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

export const billingRouter = Router();
export const billingWebhookRouter = Router();

const webhookPayloadSchema = z.object({
  event: z.string(),
  data: z.object({
    metadata: z
      .object({
        userId: z.string().optional(),
        plan: z.enum(["platinum", "silver", "gold", "diamond"]).optional(),
      })
      .optional(),
  }),
});

const isPaystackWebhookSignatureValid = (rawBody: Buffer, signatureHeader: string, webhookSecret: string) => {
  const expected = createHmac("sha512", webhookSecret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const candidate = Buffer.from(signatureHeader);

  if (candidate.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidate, expectedBuffer);
};

billingWebhookRouter.post("/billing/webhook/paystack", express.raw({ type: "application/json" }), (req, res) => {
  if (!env.PAYSTACK_WEBHOOK_SECRET) {
    res.status(501).json({ message: "Paystack webhook secret is not configured" });
    return;
  }

  const signatureHeader = req.header("x-paystack-signature");
  if (!signatureHeader || !Buffer.isBuffer(req.body)) {
    res.status(400).json({ message: "Missing Paystack signature or raw body" });
    return;
  }

  const isValid = isPaystackWebhookSignatureValid(req.body, signatureHeader, env.PAYSTACK_WEBHOOK_SECRET);
  if (!isValid) {
    res.status(400).json({ message: "Invalid Paystack signature" });
    return;
  }

  let rawEventPayload: unknown;
  try {
    rawEventPayload = JSON.parse(req.body.toString("utf-8"));
  } catch {
    res.status(400).json({ message: "Invalid JSON body" });
    return;
  }

  const parsedEvent = webhookPayloadSchema.safeParse(rawEventPayload);
  if (!parsedEvent.success) {
    res.status(400).json({ message: "Invalid Paystack event payload", issues: parsedEvent.error.issues });
    return;
  }

  const event = parsedEvent.data;
  if (event.event === "charge.success") {
    const userId = event.data.metadata?.userId;
    const plan = event.data.metadata?.plan;

    if (userId && plan) {
      setMembershipTier(userId, plan);
    }
  }

  res.json({ received: true });
});

const checkoutSchema = z.object({
  plan: z.enum(["platinum", "silver", "gold", "diamond"]),
  successPath: z.string().optional(),
  cancelPath: z.string().optional(),
});

const resolveAmount = (plan: "platinum" | "silver" | "gold" | "diamond") => {
  if (plan === "platinum") return env.PAYSTACK_AMOUNT_PLATINUM;
  if (plan === "silver") return env.PAYSTACK_AMOUNT_SILVER;
  if (plan === "gold") return env.PAYSTACK_AMOUNT_GOLD;
  return env.PAYSTACK_AMOUNT_DIAMOND;
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

  const amount = resolveAmount(parsed.data.plan);
  if (!env.PAYSTACK_SECRET_KEY || !Number.isFinite(amount) || amount <= 0) {
    res.status(501).json({
      message: "Payments are not configured yet. Add Paystack secret key and plan amounts in server env.",
    });
    return;
  }

  const successUrl = `${env.APP_BASE_URL}${parsed.data.successPath ?? "/?upgrade=success"}`;
  const cancelUrl = `${env.APP_BASE_URL}${parsed.data.cancelPath ?? "/?upgrade=cancelled"}`;

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount,
        callback_url: successUrl,
        metadata: {
          userId: user.id,
          plan: parsed.data.plan,
          cancelUrl,
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      res.status(502).json({ message: `Paystack checkout creation failed: ${details || response.statusText}` });
      return;
    }

    const payload = (await response.json()) as {
      status: boolean;
      data?: { authorization_url?: string; reference?: string };
    };
    res.json({ ok: true, checkoutUrl: payload.data?.authorization_url ?? null, sessionId: payload.data?.reference ?? "" });
  } catch {
    res.status(502).json({ message: "Unable to connect to Paystack" });
  }
});

billingRouter.get("/billing/config", (_req, res) => {
  const planAmounts = {
    platinum: env.PAYSTACK_AMOUNT_PLATINUM,
    silver: env.PAYSTACK_AMOUNT_SILVER,
    gold: env.PAYSTACK_AMOUNT_GOLD,
    diamond: env.PAYSTACK_AMOUNT_DIAMOND,
  };

  const missing: string[] = [];
  if (!env.PAYSTACK_SECRET_KEY) missing.push("PAYSTACK_SECRET_KEY");
  if (!env.PAYSTACK_WEBHOOK_SECRET) missing.push("PAYSTACK_WEBHOOK_SECRET");
  if (!env.PAYSTACK_PUBLIC_KEY) missing.push("PAYSTACK_PUBLIC_KEY");
  if (!Number.isFinite(planAmounts.platinum) || planAmounts.platinum <= 0) missing.push("PAYSTACK_AMOUNT_PLATINUM");
  if (!Number.isFinite(planAmounts.silver) || planAmounts.silver <= 0) missing.push("PAYSTACK_AMOUNT_SILVER");
  if (!Number.isFinite(planAmounts.gold) || planAmounts.gold <= 0) missing.push("PAYSTACK_AMOUNT_GOLD");
  if (!Number.isFinite(planAmounts.diamond) || planAmounts.diamond <= 0) missing.push("PAYSTACK_AMOUNT_DIAMOND");

  res.json({
    provider: "paystack",
    checkoutConfigured: missing.length === 0,
    webhookConfigured: Boolean(env.PAYSTACK_WEBHOOK_SECRET),
    publicKeyConfigured: Boolean(env.PAYSTACK_PUBLIC_KEY),
    planAmounts,
    missing,
  });
});

const completeUpgradeSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(["platinum", "silver", "gold", "diamond"]),
  providerToken: z.string().min(1),
});

const verifyCheckoutSchema = z.object({
  reference: z.string().min(4),
});

billingRouter.post("/billing/verify-checkout", requireAuth, async (req, res) => {
  const parsed = verifyCheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  if (!env.PAYSTACK_SECRET_KEY) {
    res.status(501).json({ message: "Paystack secret key is not configured" });
    return;
  }

  const userId = req.authUserId!;

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(parsed.data.reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      res.status(502).json({ message: `Paystack verification failed: ${details || response.statusText}` });
      return;
    }

    const payload = (await response.json()) as {
      status: boolean;
      data?: {
        status?: string;
        metadata?: { userId?: string; plan?: "platinum" | "silver" | "gold" | "diamond" };
      };
    };

    const paid = payload.data?.status === "success";
    const metadataUserId = payload.data?.metadata?.userId;
    const plan = payload.data?.metadata?.plan;

    if (!paid) {
      res.status(409).json({ message: "Transaction is not successful yet" });
      return;
    }

    if (!plan) {
      res.status(422).json({ message: "Missing plan metadata on verified transaction" });
      return;
    }

    if (!metadataUserId || metadataUserId !== userId) {
      res.status(403).json({ message: "This transaction does not belong to the authenticated user" });
      return;
    }

    const updated = setMembershipTier(userId, plan);
    if (!updated) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ ok: true, tier: plan, reference: parsed.data.reference });
  } catch {
    res.status(502).json({ message: "Unable to verify payment with Paystack" });
  }
});

billingRouter.post("/billing/complete-upgrade", (req, res) => {
  // This endpoint is a safe server-side hook for wiring webhook confirmation later.
  // It is intentionally protected by a shared token for compatibility fallback.
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
