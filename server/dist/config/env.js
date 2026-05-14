import "dotenv/config";
export const env = {
    PORT: Number(process.env.PORT ?? 5000),
    NODE_ENV: process.env.NODE_ENV ?? "development",
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    APP_BASE_URL: process.env.APP_BASE_URL ?? "http://localhost:3000",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "dev_access_secret",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret",
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
    STRIPE_PRICE_SILVER: process.env.STRIPE_PRICE_SILVER ?? "",
    STRIPE_PRICE_GOLD: process.env.STRIPE_PRICE_GOLD ?? "",
    STRIPE_PRICE_DIAMOND: process.env.STRIPE_PRICE_DIAMOND ?? "",
    BILLING_PROVIDER_TOKEN: process.env.BILLING_PROVIDER_TOKEN ?? "",
    ADMIN_UNLOCK_PHRASE: process.env.ADMIN_UNLOCK_PHRASE ?? "diamonds-open",
    ADMIN_ALLOWED_IPS: (process.env.ADMIN_ALLOWED_IPS ?? "127.0.0.1,::1,::ffff:127.0.0.1")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
};
