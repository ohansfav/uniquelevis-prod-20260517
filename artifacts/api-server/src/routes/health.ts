import { Router } from "express";
import { getStoreDiagnostics } from "../data/store.js";

export const healthRouter = Router();

// Standard health endpoint + Replit deployment /healthz
healthRouter.get("/healthz", (_req, res) => res.json({ status: "ok", service: "unique-levis-api" }));

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "unique-levis-api",
    timestamp: new Date().toISOString(),
    store: getStoreDiagnostics(),
  });
});
