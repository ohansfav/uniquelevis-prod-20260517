# Memory

- [Replit `.replit` env updates](replit-env-updates.md) — userenv.shared values must be updated via `verifyAndReplaceDotReplit({ tempFilePath })` using a temp file; direct edits to `.replit` are rejected. Environment changes take effect only after the relevant workflow is restarted.
- [Unique Levi's membership tiers](unique-levis-tiers.md) — free/Silver/Gold/Diamond only; Platinum removed. New users receive a 30-day free trial (`trialExpiresAt`) that grants Silver-equivalent access (see incoming likes, message gated profiles). Prices are Silver ₦500, Gold ₦1,000, Diamond ₦1,500; configured in `.replit` userenv.shared and `env.ts` defaults.
