import "dotenv/config";

const NODE_ENV = process.env.NODE_ENV ?? "development";
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

const env = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV,
  CLIENT_ORIGIN: clientOrigins[0] ?? "http://localhost:3000",
  CLIENT_ORIGINS: clientOrigins,
  APP_BASE_URL: process.env.APP_BASE_URL ?? "http://localhost:3000",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "dev_access_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret",
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
  ADMIN_ALLOWED_IPS: (process.env.ADMIN_ALLOWED_IPS ?? "127.0.0.1,::1,::ffff:127.0.0.1")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  STORE_BACKEND: process.env.STORE_BACKEND ?? "auto",
  KV_REST_API_URL: kvRestUrl,
  KV_REST_API_TOKEN: kvRestToken,
  STORE_KV_KEY: process.env.STORE_KV_KEY ?? "unique-levis:store-snapshot:v1",
};

const assertRequiredInProduction = (name: string, value: string, invalidValues: string[] = []) => {
  if (env.NODE_ENV !== "production") {
    return;
  }

  const normalized = value.trim();
  if (!normalized || invalidValues.includes(normalized)) {
    throw new Error(`Missing or unsafe ${name}. Set a secure value in environment variables.`);
  }
};

assertRequiredInProduction("JWT_ACCESS_SECRET", env.JWT_ACCESS_SECRET, ["dev_access_secret"]);
assertRequiredInProduction("JWT_REFRESH_SECRET", env.JWT_REFRESH_SECRET, ["dev_refresh_secret"]);
assertRequiredInProduction("CLIENT_ORIGIN", env.CLIENT_ORIGIN, ["http://localhost:3000"]);
assertRequiredInProduction("APP_BASE_URL", env.APP_BASE_URL, ["http://localhost:3000"]);

export { env };
