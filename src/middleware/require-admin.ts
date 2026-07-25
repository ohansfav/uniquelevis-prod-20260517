import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { findUserById } from "../data/store.js";
import { verifyAccessToken } from "../utils/jwt.js";

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "";
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = getClientIp(req);
  const allowlist = env.ADMIN_ALLOWED_IPS;
  if (allowlist.length > 0 && clientIp && !allowlist.includes(clientIp)) {
    res.status(403).json({ message: "Forbidden: admin access is restricted to trusted IPs" });
    return;
  }

  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.replace("Bearer ", "").trim() : undefined;

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
    const user = findUserById(payload.sub);
    if (!user?.isAdmin) {
      res.status(403).json({ message: "Forbidden: admin only" });
      return;
    }
    req.authUserId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Token expired or invalid" });
  }
};
