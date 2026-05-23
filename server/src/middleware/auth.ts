import type { NextFunction, Request, Response } from "express";
import { ensureSessionUser } from "../data/store.js";
import { verifyAccessToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      authUserId?: string;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const queryToken = typeof req.query.token === "string" ? req.query.token : undefined;

  const token = header?.startsWith("Bearer ")
    ? header.replace("Bearer ", "").trim()
    : queryToken;

  if (!token) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    if (!payload.sub) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    ensureSessionUser(payload.sub, payload.profile);
    req.authUserId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Token expired or invalid" });
  }
};
