import type { NextRequest } from "next/server";

const BACKEND_BASE = process.env.API_PROXY_TARGET
  ? `${process.env.API_PROXY_TARGET.replace(/\/$/, "")}/api`
  : "https://uniquelevis-api.vercel.app/api";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"] as const;

const filterHeaders = (request: NextRequest) => {
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "content-length") {
      continue;
    }
    headers.set(key, value);
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
    init.body = request.body;
    // Required when streaming request body through fetch in Node runtime.
    (init as RequestInit & { duplex: "half" }).duplex = "half";
  }

  const upstream = await fetch(targetUrl, init);

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set("cache-control", "no-store");

  return new Response(upstream.body, {
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
