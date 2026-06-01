import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
const accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN;
const refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN;
export const signAccessToken = (userId, profile) => jwt.sign({ sub: userId, typ: "access", profile }, env.JWT_ACCESS_SECRET, {
    expiresIn: accessExpiresIn,
});
export const signRefreshToken = (userId, profile) => jwt.sign({ sub: userId, typ: "refresh", profile }, env.JWT_REFRESH_SECRET, {
    expiresIn: refreshExpiresIn,
});
export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);
