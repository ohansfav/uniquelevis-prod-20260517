import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"];
const refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"];

export const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId, typ: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn: accessExpiresIn,
  });

export const signRefreshToken = (userId: string) =>
  jwt.sign({ sub: userId, typ: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: refreshExpiresIn,
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; typ: string };

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; typ: string };
