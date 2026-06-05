import { timingSafeEqual } from "node:crypto";
import express, { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { findUserById, setMembershipTier } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

export const billingRouter = Router();
export const billingWebhookRouter = Router();

type PaymentProvider = "flutterwave";
type PaidPlan = "platinum" | "silver" | "gold" | "diamond";

const paidPlanSchema = z.enum(["platinum", "silver", "gold", "diamond"]);
const paymentProviderSchema = z.enum(["flutterwave"]);
const PAYMENT_IDEMPOTENCY_TTL_MS = 1000 * 60 * 60 * 24;

const processedPaymentReferences = new Map<string, {
  userId: string;
  plan: PaidPlan;
  processedAt: number;
}>();

const cleanupProcessedPaymentReferences = () => {
  const cutoff = Date.now() - PAYMENT_IDEMPOTENCY_TTL_MS;
  for (const [reference, details] of processedPaymentReferences.entries()) {
    if (details.processedAt < cutoff) {
      processedPaymentReferences.delete(reference);
    }
  }
};

const getProcessedPaymentReference = (reference: string) => {
  cleanupProcessedPaymentReferences();
  return processedPaymentReferences.get(reference);
};

const markPaymentReferenceProcessed = (reference: string, userId: string, plan: PaidPlan) => {
  cleanupProcessedPaymentReferences();
  processedPaymentReferences.set(reference, {
    userId,
    plan,
    processedAt: Date.now(),
  });
};

const flutterwaveWebhookSchema = z.object({
  event: z.string().optional(),
  data: z
    .object({
      tx_ref: z.string().optional(),
      status: z.string().optional(),
      amount: z.number().optional(),
      currency: z.string().optional(),
      meta: z
        .object({
          userId: z.string().optional(),
          plan: paidPlanSchema.optional(),
        })
        .passthrough()
        .optional(),
    })
    .passthrough(),
});

const resolveFlutterwaveSecret = () => env.FLUTTERWAVE_SECRET_KEY || env.FLUTTERWAVE_CLIENT_SECRET;

const isFlutterwaveConfigured = () => Boolean(resolveFlutterwaveSecret());

const resolveActiveProvider = (): PaymentProvider => "flutterwave";

const safeRouteUrl = (path: string) => new URL(path, env.APP_BASE_URL);

const flutterwaveApiBase = () => (env.FLUTTERWAVE_API_BASE || "https://api.flutterwave.com").replace(/\/$/, "");

const parseReferencePayload = (reference: string) => {
  const parsed = /^ul_([^_]+)_(platinum|silver|gold|diamond)_\d+$/i.exec(reference);
  if (!parsed) {
    return null;
  }
  const [, userId, plan] = parsed;
  return { userId, plan: plan.toLowerCase() as PaidPlan };
};

const resolveAmount = (plan: PaidPlan) => {
  if (plan === "platinum") return env.BILLING_AMOUNT_PLATINUM;
  if (plan === "silver") return env.BILLING_AMOUNT_SILVER;
  if (plan === "gold") return env.BILLING_AMOUNT_GOLD;
  return env.BILLING_AMOUNT_DIAMOND;
};

const isSafeHeaderMatch = (expected: string, candidate: string) => {
  const expectedBuffer = Buffer.from(expected);
  const candidateBuffer = Buffer.from(candidate);
  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, candidateBuffer);
};

billingWebhookRouter.post("/billing/webhook/flutterwave", express.json(), (req, res) => {
  if (!env.FLUTTERWAVE_WEBHOOK_SECRET_HASH) {
    res.status(501).json({ message: "Flutterwave webhook secret hash is not configured" });
    return;
  }

  const signatureHeader = req.header("verif-hash") ?? "";
  if (!signatureHeader || !isSafeHeaderMatch(env.FLUTTERWAVE_WEBHOOK_SECRET_HASH, signatureHeader)) {
    res.status(400).json({ message: "Invalid Flutterwave webhook signature" });
    return;
  }

  const parsed = flutterwaveWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid Flutterwave webhook payload", issues: parsed.error.issues });
    return;
  }

  const event = parsed.data;
  const eventStatus = event.data.status?.toLowerCase();
  if (eventStatus === "successful") {
    const reference = event.data.tx_ref;
    const metadata = event.data.meta;
    const parsedReference = reference ? parseReferencePayload(reference) : null;
    const userId = metadata?.userId ?? parsedReference?.userId;
    const plan = metadata?.plan ?? parsedReference?.plan;

    if (userId && plan && reference) {
      const processed = getProcessedPaymentReference(reference);
      if (processed) {
        res.json({ received: true, idempotent: true });
        return;
      }

      setMembershipTier(userId, plan);
      markPaymentReferenceProcessed(reference, userId, plan);
    }
  }

  res.json({ received: true });
});

const checkoutSchema = z.object({
  plan: paidPlanSchema,
  provider: paymentProviderSchema.optional(),
  successPath: z.string().optional(),
  cancelPath: z.string().optional(),
});

billingRouter.post("/billing/checkout", requireAuth, async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid checkout payload", issues: parsed.error.issues });
    return;
  }

  const provider = resolveActiveProvider();
  const userId = req.authUserId!;
  const user = findUserById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const amount = resolveAmount(parsed.data.plan);
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(501).json({ message: "Payments are not configured yet. Plan amount is invalid." });
    return;
  }

  const successUrl = safeRouteUrl(parsed.data.successPath ?? "/?upgrade=success");
  const cancelUrl = safeRouteUrl(parsed.data.cancelPath ?? "/?upgrade=cancelled");

  if (!isFlutterwaveConfigured()) {
    res.status(501).json({ message: "Flutterwave is not configured" });
    return;
  }

  const reference = `ul_${user.id}_${parsed.data.plan}_${Date.now()}`;
  successUrl.searchParams.set("provider", provider);
  successUrl.searchParams.set("reference", reference);
  cancelUrl.searchParams.set("provider", provider);
  cancelUrl.searchParams.set("reference", reference);

  const requestPayload = {
    tx_ref: reference,
    amount,
    currency: env.BILLING_CURRENCY,
    redirect_url: successUrl.toString(),
    payment_options: env.FLUTTERWAVE_PAYMENT_OPTIONS || undefined,
    customer: {
      email: user.email,
      name: user.firstName,
    },
    customizations: {
      title: `Unique Levi's ${parsed.data.plan.toUpperCase()} Membership`,
      description: `Upgrade to ${parsed.data.plan.toUpperCase()} tier`,
    },
    meta: {
      userId: user.id,
      plan: parsed.data.plan,
      cancelUrl: cancelUrl.toString(),
    },
  };

  try {
    const flutterwaveSecret = resolveFlutterwaveSecret();
    if (!flutterwaveSecret) {
      res.status(501).json({ message: "Flutterwave is not configured" });
      return;
    }

    const response = await fetch(`${flutterwaveApiBase()}/v3/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flutterwaveSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      res.status(502).json({ message: `Flutterwave checkout creation failed: ${details || response.statusText}` });
      return;
    }

    const payload = (await response.json()) as {
      status?: string;
      message?: string;
      data?: { link?: string };
    };

    if (payload.status !== "success" || !payload.data?.link) {
      res.status(502).json({ message: `Flutterwave checkout creation failed: ${payload.message || "Unknown error"}` });
      return;
    }

    res.json({
      ok: true,
      provider,
      checkoutUrl: payload.data.link,
      sessionId: reference,
      reference,
    });
  } catch {
    res.status(502).json({ message: "Unable to connect to Flutterwave" });
  }
});

billingRouter.get("/billing/config", (_req, res) => {
  const planAmounts = {
    platinum: env.BILLING_AMOUNT_PLATINUM,
    silver: env.BILLING_AMOUNT_SILVER,
    gold: env.BILLING_AMOUNT_GOLD,
    diamond: env.BILLING_AMOUNT_DIAMOND,
  };

  const checkoutMissing: string[] = [];
  const flutterwaveSecret = resolveFlutterwaveSecret();
  if (!flutterwaveSecret) checkoutMissing.push("FLUTTERWAVE_SECRET_KEY|FLUTTERWAVE_CLIENT_SECRET");
  if (!Number.isFinite(planAmounts.platinum) || planAmounts.platinum <= 0) checkoutMissing.push("BILLING_AMOUNT_PLATINUM");
  if (!Number.isFinite(planAmounts.silver) || planAmounts.silver <= 0) checkoutMissing.push("BILLING_AMOUNT_SILVER");
  if (!Number.isFinite(planAmounts.gold) || planAmounts.gold <= 0) checkoutMissing.push("BILLING_AMOUNT_GOLD");
  if (!Number.isFinite(planAmounts.diamond) || planAmounts.diamond <= 0) checkoutMissing.push("BILLING_AMOUNT_DIAMOND");

  const optionalMissing: string[] = [];
  if (!env.FLUTTERWAVE_WEBHOOK_SECRET_HASH) optionalMissing.push("FLUTTERWAVE_WEBHOOK_SECRET_HASH");
  if (!env.FLUTTERWAVE_PUBLIC_KEY) optionalMissing.push("FLUTTERWAVE_PUBLIC_KEY");
  if (!env.FLUTTERWAVE_CLIENT_ID) optionalMissing.push("FLUTTERWAVE_CLIENT_ID");
  if (!env.FLUTTERWAVE_ENCRYPTION_KEY) optionalMissing.push("FLUTTERWAVE_ENCRYPTION_KEY");

  res.json({
    provider: resolveActiveProvider(),
    checkoutConfigured: checkoutMissing.length === 0,
    webhookConfigured: Boolean(env.FLUTTERWAVE_WEBHOOK_SECRET_HASH),
    publicKeyConfigured: Boolean(env.FLUTTERWAVE_PUBLIC_KEY),
    planAmounts,
    providers: {
      flutterwave: {
        checkoutConfigured: checkoutMissing.length === 0,
        missing: checkoutMissing,
      },
    },
    missing: [...checkoutMissing, ...optionalMissing],
    checkoutMissing,
    optionalMissing,
  });
});

const completeUpgradeSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(["platinum", "silver", "gold", "diamond"]),
  providerToken: z.string().min(1),
});

const verifyCheckoutSchema = z.object({
  reference: z.string().min(4),
  provider: paymentProviderSchema.optional(),
});

billingRouter.post("/billing/verify-checkout", requireAuth, async (req, res) => {
  const parsed = verifyCheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const provider = resolveActiveProvider();
  const userId = req.authUserId!;

  const parsedReference = parseReferencePayload(parsed.data.reference);
  if (!parsedReference) {
    res.status(422).json({ message: "Invalid Flutterwave reference format" });
    return;
  }

  const processed = getProcessedPaymentReference(parsed.data.reference);
  if (processed) {
    if (processed.userId !== userId) {
      res.status(403).json({ message: "This transaction does not belong to the authenticated user" });
      return;
    }
    res.json({
      ok: true,
      provider,
      tier: processed.plan,
      reference: parsed.data.reference,
      alreadyProcessed: true,
    });
    return;
  }

  if (parsedReference.userId !== userId) {
    res.status(403).json({ message: "This transaction does not belong to the authenticated user" });
    return;
  }

  const flutterwaveSecret = resolveFlutterwaveSecret();
  if (!flutterwaveSecret) {
    res.status(501).json({ message: "Flutterwave secret key is not configured" });
    return;
  }

  try {
    const response = await fetch(
      `${flutterwaveApiBase()}/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(parsed.data.reference)}`,
      {
      method: "GET",
      headers: {
          Authorization: `Bearer ${flutterwaveSecret}`,
      },
      },
    );

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      res.status(502).json({ message: `Flutterwave verification failed: ${details || response.statusText}` });
      return;
    }

    const payload = (await response.json()) as {
      status?: string;
      message?: string;
      data?: {
        status?: string;
        tx_ref?: string;
        amount?: number;
        currency?: string;
        meta?: { userId?: string; plan?: PaidPlan };
      };
    };

    if (payload.status !== "success") {
      res.status(502).json({ message: `Flutterwave verification failed: ${payload.message || "Unknown error"}` });
      return;
    }

    if (payload.data?.tx_ref !== parsed.data.reference) {
      res.status(409).json({ message: "Verified transaction reference does not match request" });
      return;
    }

    const paid = payload.data?.status?.toLowerCase() === "successful";
    const metadataUserId = payload.data?.meta?.userId;
    const plan = payload.data?.meta?.plan ?? parsedReference.plan;

    if (!paid) {
      res.status(409).json({ message: "Transaction is not successful yet" });
      return;
    }

    if (!plan) {
      res.status(422).json({ message: "Missing plan metadata on verified transaction" });
      return;
    }

    if (!metadataUserId || metadataUserId !== userId) {
      if (metadataUserId) {
        res.status(403).json({ message: "This transaction does not belong to the authenticated user" });
        return;
      }
    }

    const expectedAmount = resolveAmount(plan);
    const paidAmount = payload.data?.amount;
    if (typeof paidAmount !== "number" || paidAmount < expectedAmount) {
      res.status(409).json({ message: "Verified payment amount is lower than the selected plan price" });
      return;
    }

    if (payload.data?.currency && payload.data.currency.toUpperCase() !== env.BILLING_CURRENCY.toUpperCase()) {
      res.status(409).json({ message: "Verified payment currency does not match configured billing currency" });
      return;
    }

    const updated = setMembershipTier(userId, plan);
    if (!updated) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    markPaymentReferenceProcessed(parsed.data.reference, userId, plan);

    res.json({ ok: true, provider, tier: plan, reference: parsed.data.reference });
  } catch {
    res.status(502).json({ message: "Unable to verify payment with Flutterwave" });
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
