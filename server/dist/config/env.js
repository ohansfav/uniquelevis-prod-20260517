import "dotenv/config";
export const env = {
    PORT: Number(process.env.PORT ?? 5000),
    NODE_ENV: process.env.NODE_ENV ?? "development",
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "dev_access_secret",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret",
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
};
