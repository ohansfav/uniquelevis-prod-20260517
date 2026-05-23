import { createHmac, timingSafeEqual } from "node:crypto";
import express, { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { findUserById, setMembershipTier } from "../data/store.js";
import { requireAuth } from "../middleware/auth.js";

export const billingRouter = Router();
export const billingWebhookRouter = Router();

type PaymentProvider = "paystack" | "opay";
type PaidPlan = "platinum" | "silver" | "gold" | "diamond";

const paidPlanSchema = z.enum(["platinum", "silver", "gold", "diamond"]);
const paymentProviderSchema = z.enum(["paystack", "opay"]);

const webhookPayloadSchema = z.object({
  event: z.string(),
  data: z.object({
    metadata: z
      .object({
        userId: z.string().optional(),
        plan: paidPlanSchema.optional(),
      })
      .optional(),
  }),
});

const opayWebhookSchema = z.object({
  payload: z.object({
    reference: z.string(),
    status: z.string(),
  }),
  sha512: z.string().optional(),
  type: z.string().optional(),
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

const isOpayConfigured = () => Boolean(env.OPAY_PUBLIC_KEY && env.OPAY_PRIVATE_KEY && env.OPAY_MERCHANT_ID);
const isPaystackConfigured = () => Boolean(env.PAYSTACK_SECRET_KEY);

const resolveActiveProvider = (): PaymentProvider => {
  if (env.BILLING_DEFAULT_PROVIDER === "opay" && isOpayConfigured()) {
    return "opay";
  }
  if (env.BILLING_DEFAULT_PROVIDER === "paystack" && isPaystackConfigured()) {
    return "paystack";
  }
  if (isOpayConfigured()) {
    return "opay";
  }
  return "paystack";
};

const resolveCheckoutProvider = (requested?: PaymentProvider): PaymentProvider => {
  if (requested === "opay") {
    return "opay";
  }
  if (requested === "paystack") {
    return "paystack";
  }
  return resolveActiveProvider();
};

const safeRouteUrl = (path: string) => new URL(path, env.APP_BASE_URL);

const opayApiBase = () => (env.OPAY_API_BASE || "https://liveapi.opaycheckout.com").replace(/\/$/, "");

const opaySignature = (payload: unknown) =>
  createHmac("sha512", env.OPAY_PRIVATE_KEY).update(JSON.stringify(payload)).digest("hex");

const parseReferencePayload = (reference: string) => {
  const parsed = /^ul_([^_]+)_(platinum|silver|gold|diamond)_\d+$/i.exec(reference);
  if (!parsed) {
    return null;
  }
  const [, userId, plan] = parsed;
  return { userId, plan: plan.toLowerCase() as PaidPlan };
};

const resolveAmount = (plan: PaidPlan) => {
  if (plan === "platinum") return env.PAYSTACK_AMOUNT_PLATINUM;
  if (plan === "silver") return env.PAYSTACK_AMOUNT_SILVER;
  if (plan === "gold") return env.PAYSTACK_AMOUNT_GOLD;
  return env.PAYSTACK_AMOUNT_DIAMOND;
};

const isOpayCallbackSignatureValid = (payload: unknown, providedSha512: string, privateKey: string) => {
  const expected = createHmac("sha512", privateKey).update(JSON.stringify(payload)).digest("hex");
  return expected.toLowerCase() === providedSha512.toLowerCase();
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

billingWebhookRouter.post("/billing/webhook/opay", express.json(), (req, res) => {
  if (!env.OPAY_PRIVATE_KEY) {
    res.status(501).json({ message: "OPay private key is not configured" });
    return;
  }

  const parsed = opayWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid OPay callback payload", issues: parsed.error.issues });
    return;
  }

  const event = parsed.data;
  if (event.sha512 && !isOpayCallbackSignatureValid(event.payload, event.sha512, env.OPAY_PRIVATE_KEY)) {
    res.status(400).json({ message: "Invalid OPay callback signature" });
    return;
  }

  if (event.payload.status.toUpperCase() === "SUCCESS") {
    const parsedReference = parseReferencePayload(event.payload.reference);
    if (parsedReference) {
      setMembershipTier(parsedReference.userId, parsedReference.plan);
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

  const provider = resolveCheckoutProvider(parsed.data.provider);
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

  if (provider === "paystack") {
    if (!env.PAYSTACK_SECRET_KEY) {
      res.status(501).json({ message: "Paystack is not configured" });
      return;
    }

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
          callback_url: successUrl.toString(),
          metadata: {
            userId: user.id,
            plan: parsed.data.plan,
            cancelUrl: cancelUrl.toString(),
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
      res.json({
        ok: true,
        provider,
        checkoutUrl: payload.data?.authorization_url ?? null,
        sessionId: payload.data?.reference ?? "",
      });
    } catch {
      res.status(502).json({ message: "Unable to connect to Paystack" });
    }
    return;
  }

  if (!isOpayConfigured()) {
    res.status(501).json({ message: "OPay is not configured" });
    return;
  }

  const reference = `ul_${user.id}_${parsed.data.plan}_${Date.now()}`;
  successUrl.searchParams.set("provider", "opay");
  successUrl.searchParams.set("reference", reference);
  cancelUrl.searchParams.set("provider", "opay");
  cancelUrl.searchParams.set("reference", reference);

  const requestPayload = {
    country: env.OPAY_COUNTRY,
    reference,
    amount: {
      total: amount,
      currency: "NGN",
    },
    returnUrl: successUrl.toString(),
    callbackUrl: `${env.APP_BASE_URL}/api/billing/webhook/opay`,
    cancelUrl: cancelUrl.toString(),
    userInfo: {
      userEmail: user.email,
      userId: user.id,
      userName: user.firstName,
    },
    product: {
      name: `Unique Levi's ${parsed.data.plan.toUpperCase()} Membership`,
      description: `Upgrade to ${parsed.data.plan.toUpperCase()} tier`,
    },
    customerVisitSource: "BROWSER",
    payMethod: env.OPAY_PAY_METHOD || undefined,
  };

  try {
    const response = await fetch(`${opayApiBase()}/api/v1/international/cashier/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPAY_PUBLIC_KEY}`,
        MerchantId: env.OPAY_MERCHANT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      res.status(502).json({ message: `OPay checkout creation failed: ${details || response.statusText}` });
      return;
    }

    const payload = (await response.json()) as {
      code?: string;
      message?: string;
      data?: { cashierUrl?: string; reference?: string; orderNo?: string };
    };

    if (payload.code !== "00000") {
      res.status(502).json({ message: `OPay checkout creation failed: ${payload.message || "Unknown error"}` });
      return;
    }

    res.json({
      ok: true,
      provider,
      checkoutUrl: payload.data?.cashierUrl ?? null,
      sessionId: payload.data?.orderNo ?? payload.data?.reference ?? reference,
      reference,
    });
  } catch {
    res.status(502).json({ message: "Unable to connect to OPay" });
  }
});

billingRouter.get("/billing/config", (_req, res) => {
  const planAmounts = {
    platinum: env.PAYSTACK_AMOUNT_PLATINUM,
    silver: env.PAYSTACK_AMOUNT_SILVER,
    gold: env.PAYSTACK_AMOUNT_GOLD,
    diamond: env.PAYSTACK_AMOUNT_DIAMOND,
  };

  const paystackCheckoutMissing: string[] = [];
  if (!env.PAYSTACK_SECRET_KEY) paystackCheckoutMissing.push("PAYSTACK_SECRET_KEY");
  if (!Number.isFinite(planAmounts.platinum) || planAmounts.platinum <= 0) paystackCheckoutMissing.push("PAYSTACK_AMOUNT_PLATINUM");
  if (!Number.isFinite(planAmounts.silver) || planAmounts.silver <= 0) paystackCheckoutMissing.push("PAYSTACK_AMOUNT_SILVER");
  if (!Number.isFinite(planAmounts.gold) || planAmounts.gold <= 0) paystackCheckoutMissing.push("PAYSTACK_AMOUNT_GOLD");
  if (!Number.isFinite(planAmounts.diamond) || planAmounts.diamond <= 0) paystackCheckoutMissing.push("PAYSTACK_AMOUNT_DIAMOND");

  const opayCheckoutMissing: string[] = [];
  if (!env.OPAY_PUBLIC_KEY) opayCheckoutMissing.push("OPAY_PUBLIC_KEY");
  if (!env.OPAY_PRIVATE_KEY) opayCheckoutMissing.push("OPAY_PRIVATE_KEY");
  if (!env.OPAY_MERCHANT_ID) opayCheckoutMissing.push("OPAY_MERCHANT_ID");
  if (!env.OPAY_COUNTRY) opayCheckoutMissing.push("OPAY_COUNTRY");

  const checkoutMissing = resolveActiveProvider() === "opay" ? opayCheckoutMissing : paystackCheckoutMissing;

  const optionalMissing: string[] = [];
  if (!env.PAYSTACK_WEBHOOK_SECRET) optionalMissing.push("PAYSTACK_WEBHOOK_SECRET");
  if (!env.PAYSTACK_PUBLIC_KEY) optionalMissing.push("PAYSTACK_PUBLIC_KEY");
  if (!env.OPAY_WEBHOOK_SECRET) optionalMissing.push("OPAY_WEBHOOK_SECRET");

  res.json({
    provider: resolveActiveProvider(),
    checkoutConfigured: checkoutMissing.length === 0,
    webhookConfigured: Boolean(env.PAYSTACK_WEBHOOK_SECRET),
    publicKeyConfigured: Boolean(env.PAYSTACK_PUBLIC_KEY),
    planAmounts,
    providers: {
      paystack: {
        checkoutConfigured: paystackCheckoutMissing.length === 0,
        missing: paystackCheckoutMissing,
      },
      opay: {
        checkoutConfigured: opayCheckoutMissing.length === 0,
        missing: opayCheckoutMissing,
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

  const provider = resolveCheckoutProvider(parsed.data.provider);
  const userId = req.authUserId!;

  if (provider === "opay") {
    if (!isOpayConfigured()) {
      res.status(501).json({ message: "OPay is not configured" });
      return;
    }

    const parsedReference = parseReferencePayload(parsed.data.reference);
    if (!parsedReference) {
      res.status(422).json({ message: "Invalid OPay reference format" });
      return;
    }

    if (parsedReference.userId !== userId) {
      res.status(403).json({ message: "This OPay transaction does not belong to the authenticated user" });
      return;
    }

    const statusPayload = {
      reference: parsed.data.reference,
      country: env.OPAY_COUNTRY,
    };

    try {
      const response = await fetch(`${opayApiBase()}/api/v1/international/cashier/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opaySignature(statusPayload)}`,
          MerchantId: env.OPAY_MERCHANT_ID,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(statusPayload),
      });

      if (!response.ok) {
        const details = await response.text().catch(() => "");
        res.status(502).json({ message: `OPay verification failed: ${details || response.statusText}` });
        return;
      }

      const payload = (await response.json()) as {
        code?: string;
        message?: string;
        data?: {
          status?: string;
          amount?: { total?: number };
        };
      };

      if (payload.code !== "00000") {
        res.status(502).json({ message: `OPay verification failed: ${payload.message || "Unknown error"}` });
        return;
      }

      if (payload.data?.status !== "SUCCESS") {
        res.status(409).json({ message: "Transaction is not successful yet" });
        return;
      }

      const expectedAmount = resolveAmount(parsedReference.plan);
      const paidAmount = payload.data?.amount?.total;
      if (typeof paidAmount !== "number" || paidAmount < expectedAmount) {
        res.status(409).json({ message: "Verified payment amount is lower than the selected plan price" });
        return;
      }

      const updated = setMembershipTier(userId, parsedReference.plan);
      if (!updated) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({ ok: true, provider, tier: parsedReference.plan, reference: parsed.data.reference });
    } catch {
      res.status(502).json({ message: "Unable to verify payment with OPay" });
    }
    return;
  }

  if (!env.PAYSTACK_SECRET_KEY) {
    res.status(501).json({ message: "Paystack secret key is not configured" });
    return;
  }

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

    res.json({ ok: true, provider, tier: plan, reference: parsed.data.reference });
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
