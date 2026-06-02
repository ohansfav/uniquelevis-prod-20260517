import type { NextRequest } from "next/server";

const BACKEND_BASE = process.env.API_PROXY_TARGET
  ? `${process.env.API_PROXY_TARGET.replace(/\/$/, "")}/api`
  : "https://uniquelevis-api.vercel.app/api";

const HOP_BY_HOP_RESPONSE_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length",
] as const;

const filterHeaders = (request: NextRequest) => {
  const headers = new Headers();
  const passThroughHeaders = [
    "authorization",
    "content-type",
    "accept",
    "cache-control",
    "if-none-match",
    "if-modified-since",
    "last-event-id",
    "x-requested-with",
  ];

  for (const key of passThroughHeaders) {
    const value = request.headers.get(key);
    if (value) {
      headers.set(key, value);
    }
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    headers.set("x-forwarded-for", forwardedFor);
  }

  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    headers.set("user-agent", userAgent);
  }

  return headers;
};

const proxy = async (request: NextRequest, path: string[]) => {
  const targetUrl = new URL(`${BACKEND_BASE}/${path.join("/")}`);
  targetUrl.search = request.nextUrl.search;

  const method = request.method;
  const init: RequestInit = {
    method,
    headers: filterHeaders(request),
    cache: "no-store",
    redirect: "manual",
  };

  if (method !== "GET" && method !== "HEAD") {
    const rawBody = await request.arrayBuffer();
    if (rawBody.byteLength > 0) {
      init.body = rawBody;
    }
  }

  const upstream = await fetch(targetUrl, init);
  const upstreamContentType = upstream.headers.get("content-type") ?? "";

  const responseHeaders = new Headers(upstream.headers);
  HOP_BY_HOP_RESPONSE_HEADERS.forEach((header) => responseHeaders.delete(header));
  responseHeaders.set("cache-control", "no-store");

  // Keep SSE responses streaming for chat events.
  if (upstreamContentType.toLowerCase().includes("text/event-stream")) {
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  }

  const body = await upstream.arrayBuffer();

  return new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
};

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const handler = async (request: NextRequest, context: RouteContext) => {
  const { path } = await context.params;
  return proxy(request, path ?? []);
};

export const runtime = "nodejs";

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
