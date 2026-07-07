import "dotenv/config";
import { randomBytes } from "node:crypto";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isProduction = NODE_ENV === "production";
const clientOriginRaw = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

const clientOrigins = clientOriginRaw
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const kvRestUrl =
  process.env.KV_REST_API_URL
  ?? process.env.UPSTASH_REDIS_REST_URL
  ?? "";

const kvRestToken =
  process.env.KV_REST_API_TOKEN
  ?? process.env.UPSTASH_REDIS_REST_TOKEN
  ?? "";

const resolveSecret = (envVar: string, name: string): string => {
  const provided = process.env[envVar];
  if (provided && provided.trim().length >= 16) {
    return provided.trim();
  }
  if (isProduction) {
    console.error(
      `[env] CRITICAL: Missing or too-short ${name} (env: ${envVar}). ` +
      `Set a secure random secret before deploying to production.`
    );
  }
  // Development/test only: generate an ephemeral secret per process start.
  // Tokens will be invalidated on restart — acceptable for local dev.
  const ephemeral = randomBytes(32).toString("hex");
  console.warn(
    `[env] ${name} not set — using ephemeral secret for this process. ` +
    `Set ${envVar} in your environment to keep tokens valid across restarts.`
  );
  return ephemeral;
};

const env = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV,
  CLIENT_ORIGIN: clientOrigins[0] ?? "http://localhost:3000",
  CLIENT_ORIGINS: clientOrigins,
  APP_BASE_URL: process.env.APP_BASE_URL ?? "http://localhost:3000",
  JWT_ACCESS_SECRET: resolveSecret("JWT_ACCESS_SECRET", "JWT access secret"),
  JWT_REFRESH_SECRET: resolveSecret("JWT_REFRESH_SECRET", "JWT refresh secret"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY ?? "",
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY ?? "",
  FLUTTERWAVE_CLIENT_ID: process.env.FLUTTERWAVE_CLIENT_ID ?? "",
  FLUTTERWAVE_CLIENT_SECRET: process.env.FLUTTERWAVE_CLIENT_SECRET ?? "",
  FLUTTERWAVE_ENCRYPTION_KEY: process.env.FLUTTERWAVE_ENCRYPTION_KEY ?? "",
  FLUTTERWAVE_WEBHOOK_SECRET_HASH: process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH ?? "",
  FLUTTERWAVE_API_BASE: process.env.FLUTTERWAVE_API_BASE ?? "https://api.flutterwave.com",
  FLUTTERWAVE_OAUTH_TOKEN_URL:
    process.env.FLUTTERWAVE_OAUTH_TOKEN_URL
    ?? "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
  FLUTTERWAVE_PAYMENT_OPTIONS: process.env.FLUTTERWAVE_PAYMENT_OPTIONS ?? "",
  BILLING_CURRENCY: process.env.BILLING_CURRENCY ?? "NGN",
  BILLING_AMOUNT_PLATINUM: Number(process.env.BILLING_AMOUNT_PLATINUM ?? 50000),
  BILLING_AMOUNT_SILVER: Number(process.env.BILLING_AMOUNT_SILVER ?? 100000),
  BILLING_AMOUNT_GOLD: Number(process.env.BILLING_AMOUNT_GOLD ?? 300000),
  BILLING_AMOUNT_DIAMOND: Number(process.env.BILLING_AMOUNT_DIAMOND ?? 500000),
  BILLING_DEFAULT_PROVIDER: process.env.BILLING_DEFAULT_PROVIDER ?? "flutterwave",
  BILLING_PROVIDER_TOKEN: process.env.BILLING_PROVIDER_TOKEN ?? "",
  ADMIN_UNLOCK_PHRASE: process.env.ADMIN_UNLOCK_PHRASE ?? "diamonds-open",
  // Default admin password — change via Replit Secrets for production security
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "UniqueLevisAdmin2024!",

  ADMIN_ALLOWED_IPS: (process.env.ADMIN_ALLOWED_IPS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  STORE_BACKEND: process.env.STORE_BACKEND ?? "auto",
  KV_REST_API_URL: kvRestUrl,
  KV_REST_API_TOKEN: kvRestToken,
  STORE_KV_KEY: process.env.STORE_KV_KEY ?? "unique-levis:store-snapshot:v1",
};

export { env };
