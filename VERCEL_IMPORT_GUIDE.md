# Vercel Import Guide (Monorepo)

Use this guide with the Vercel Import screen you shared.

## What To Deploy

Deploy this repository as **two Vercel projects**:

1. **Backend API project** (root directory: `server`)
2. **Frontend Web project** (root directory: `client`)

This is the cleanest setup for this repo structure.

---

## Project 1: Backend API

From Vercel dashboard:

1. Click **Import** for repo `ohansfav/uniquelevis-prod-20260517`
2. Set:
   - **Application Preset**: `Other`
   - **Root Directory**: `server`
3. Keep default build/output behavior (the repo includes `server/vercel.json`).

### Backend Environment Variables

Add these before first deploy:

- `NODE_ENV=production`
- `PORT=5000`
- `CLIENT_ORIGIN=https://<frontend-domain>`
- `APP_BASE_URL=https://<frontend-domain>`
- `JWT_ACCESS_SECRET=<strong-random-secret>`
- `JWT_REFRESH_SECRET=<strong-random-secret>`
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `ADMIN_UNLOCK_PHRASE=<your-admin-phrase>`
- `ADMIN_ALLOWED_IPS=127.0.0.1,::1,::ffff:127.0.0.1`
- `STORE_BACKEND=kv`
- `KV_REST_API_URL=<vercel-kv-rest-url>`
- `KV_REST_API_TOKEN=<vercel-kv-rest-token>`
- `STORE_KV_KEY=unique-levis:store-snapshot:v1`

Optional billing vars:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_AMOUNT_PLATINUM` (kobo, e.g. `50000` for ₦500)
- `PAYSTACK_AMOUNT_SILVER` (kobo, e.g. `100000` for ₦1,000)
- `PAYSTACK_AMOUNT_GOLD` (kobo, e.g. `300000` for ₦3,000)
- `PAYSTACK_AMOUNT_DIAMOND` (kobo, e.g. `500000` for ₦5,000)
- `OPAY_PUBLIC_KEY`
- `OPAY_PRIVATE_KEY`
- `OPAY_MERCHANT_ID`
- `OPAY_WEBHOOK_SECRET`
- `OPAY_COUNTRY` (default `NG`)
- `OPAY_API_BASE` (prod: `https://liveapi.opaycheckout.com`, test: `https://testapi.opaycheckout.com`)
- `OPAY_PAY_METHOD` (optional)
- `BILLING_DEFAULT_PROVIDER` (`paystack` or `opay`)
- `BILLING_PROVIDER_TOKEN`

Persistence note for launch:

- On Vercel/serverless, local filesystem state is not durable across cold starts.
- Refresh now falls back to signed token validation when durable refresh-session storage is unavailable, which prevents active users from being logged out after a cold start.
- Configure Vercel KV (`KV_REST_API_URL` + `KV_REST_API_TOKEN`) so accounts, profiles, matches, and refresh sessions persist.
- KV is still recommended so logout/revocation and all other state changes remain durable across instances.

Current membership mapping:

- `free`: default signup tier; can browse standard public profiles and swipe
- `platinum`: unlocks exact "who liked you"
- `silver`: unlocks likes visibility plus direct messaging
- `gold`: includes Silver and only allows Silver, Gold, and Diamond members to view or message you
- `diamond`: includes Silver and only allows Gold and Diamond members to view or message you

After deployment, copy API domain, e.g. `https://your-api.vercel.app`.

---

## Project 2: Frontend Web

Create/import a second Vercel project from the same repo:

1. Click **Import** again for `ohansfav/uniquelevis-prod-20260517`
2. Set:
   - **Application Preset**: `Next.js`
   - **Root Directory**: `client`

### Frontend Environment Variables

Set these before deploy:

- `API_PROXY_TARGET=https://<backend-domain>`
- `NEXT_PUBLIC_API_URL=/api`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=<your-paystack-public-key>`

Example:

- `API_PROXY_TARGET=https://your-api.vercel.app`
- `NEXT_PUBLIC_API_URL=/api`

This enables server-side rewrite from frontend `/api/*` to backend `/api/*`.

---

## Paystack Webhook Wiring

To automatically upgrade membership after successful payment:

1. In Paystack dashboard, create a webhook endpoint:
   - URL: `https://<backend-domain>/api/billing/webhook/paystack`
2. Copy the webhook signing secret into backend env as:
   - `PAYSTACK_WEBHOOK_SECRET=<your_paystack_secret_key>`
3. Redeploy backend.

## OPay Webhook Wiring

To automatically upgrade membership after successful OPay checkout:

1. In OPay dashboard, set callback/webhook endpoint:
   - URL: `https://<backend-domain>/api/billing/webhook/opay`
2. Set backend vars:
   - `OPAY_PUBLIC_KEY`
   - `OPAY_PRIVATE_KEY`
   - `OPAY_MERCHANT_ID`
   - `OPAY_WEBHOOK_SECRET` (if provided by OPay)
3. Optional provider switch:
   - `BILLING_DEFAULT_PROVIDER=opay`
4. Redeploy backend.

---

## Final Wiring

1. Deploy backend first.
2. Deploy frontend with backend URL in `API_PROXY_TARGET`.
3. Update backend `CLIENT_ORIGIN` and `APP_BASE_URL` to frontend URL.
4. Redeploy backend.

---

## Quick Health Checks

- Backend health: `https://<backend-domain>/api/health`
- Frontend loads: `https://<frontend-domain>/`
- Frontend API via proxy: `https://<frontend-domain>/api/health`
