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

Optional billing vars:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_AMOUNT_SILVER` (kobo, e.g. `500000`)
- `PAYSTACK_AMOUNT_GOLD` (kobo, e.g. `1000000`)
- `PAYSTACK_AMOUNT_DIAMOND` (kobo, e.g. `2000000`)
- `BILLING_PROVIDER_TOKEN`

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
