import type { BillingProvider, PaidMembershipTier } from "@/lib/types";

export type CheckoutPlan = {
  plan: PaidMembershipTier;
  label: string;
  price: string;
  accent: string;
  description: string;
  features: string[];
};

type Props = {
  plan: CheckoutPlan;
  isLoading: boolean;
  error: string | null;
  onConfirm: (plan: PaidMembershipTier, provider: BillingProvider) => Promise<void> | void;
  onClose: () => void;
};

export default function CheckoutSheet({ plan, isLoading, error, onConfirm, onClose }: Props) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={() => { if (!isLoading) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg animate-slide-up rounded-t-3xl bg-[var(--color-surface-elevated)] shadow-[0_-24px_60px_rgba(0,0,0,0.45)]"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[var(--color-border)]" />

        <div className="px-6 pt-4 pb-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Upgrade to</p>
              <h2 className="mt-0.5 text-2xl font-bold text-[var(--color-text)]">{plan.label}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-full p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] disabled:opacity-40"
              aria-label="Close"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Price badge */}
          <div className={`mt-4 inline-flex items-baseline gap-1.5 rounded-2xl px-4 py-2 ${plan.accent}`}>
            <span className="text-3xl font-extrabold">{plan.price}</span>
            <span className="text-sm font-semibold opacity-70">/ month</span>
          </div>

          {/* Features */}
          <ul className="mt-5 space-y-2">
            {plan.features.map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-sm text-[var(--color-text)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold">✓</span>
                {feat}
              </li>
            ))}
          </ul>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-300/50 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Pay button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void onConfirm(plan.plan, "flutterwave")}
            className="mt-5 w-full rounded-2xl romance-gradient py-4 text-base font-bold text-white shadow-[0_10px_28px_rgba(255,79,122,0.4)] transition active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                </svg>
                Opening Flutterwave…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11z" fill="currentColor" opacity=".3"/>
                  <path d="M8.75 12.5l2 2 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Pay {plan.price} with Flutterwave
              </span>
            )}
          </button>

          {/* Trust note */}
          <p className="mt-3 text-center text-[11px] text-[var(--color-text-muted)]">
            Secured by Flutterwave · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
