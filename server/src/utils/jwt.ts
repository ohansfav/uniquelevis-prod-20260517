import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { MembershipTier, RelationshipIntent, VerificationStatus } from "../types/models.js";

const accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"];
const refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"];

export type SessionProfileClaim = {
  email: string;
  firstName: string;
  age: number;
  city: string;
  bio?: string;
  interests?: string[];
  photos?: string[];
  datingIntent?: RelationshipIntent;
  membershipTier?: MembershipTier;
  verified?: boolean;
  verificationStatus?: VerificationStatus;
};

type TokenPayload = {
  sub: string;
  typ: string;
  profile?: SessionProfileClaim;
};

export const signAccessToken = (userId: string, profile?: SessionProfileClaim) =>
  jwt.sign({ sub: userId, typ: "access", profile }, env.JWT_ACCESS_SECRET, {
    expiresIn: accessExpiresIn,
  });

export const signRefreshToken = (userId: string, profile?: SessionProfileClaim) =>
  jwt.sign({ sub: userId, typ: "refresh", profile }, env.JWT_REFRESH_SECRET, {
    expiresIn: refreshExpiresIn,
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
