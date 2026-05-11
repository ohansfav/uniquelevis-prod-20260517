import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { initStore } from "./data/store.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { discoverRouter } from "./routes/discover.js";
import { healthRouter } from "./routes/health.js";
import { matchesRouter } from "./routes/matches.js";
import { messagesRouter } from "./routes/messages.js";
import { profilesRouter } from "./routes/profiles.js";
const app = express();
initStore();
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.get("/", (_req, res) => {
    res.json({
        name: "Unique Levi's API",
        version: "0.1.0",
        docs: "Use /health plus /api/* routes",
    });
});
app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", profilesRouter);
app.use("/api", discoverRouter);
app.use("/api", matchesRouter);
app.use("/api", messagesRouter);
app.use("/api", adminRouter);
app.use(errorHandler);
app.listen(env.PORT, () => {
    console.log(`Unique Levi's API running on port ${env.PORT}`);
});
