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

const planConfig: Record<PaidMembershipTier, { emoji: string; gradient: string; ring: string }> = {
  silver: {
    emoji: "✨",
    gradient: "from-slate-400 to-slate-500",
    ring: "ring-slate-400/40",
  },
  gold: {
    emoji: "👑",
    gradient: "from-amber-400 to-yellow-500",
    ring: "ring-amber-400/50",
  },
  diamond: {
    emoji: "💎",
    gradient: "from-cyan-400 to-blue-500",
    ring: "ring-cyan-400/40",
  },
};

export default function CheckoutSheet({ plan, isLoading, error, onConfirm, onClose }: Props) {
  const config = planConfig[plan.plan] ?? planConfig.silver;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center"
      onClick={() => { if (!isLoading) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-fade-in" />

      {/* Sheet */}
      <div
        className="relative flex max-h-[92dvh] w-full max-w-md animate-slide-up flex-col overflow-hidden rounded-t-[2rem] bg-[var(--color-surface-elevated)] shadow-[0_-28px_70px_rgba(0,0,0,0.5)] md:max-h-[90vh] md:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[var(--color-border)]" />

        {/* Tier header */}
        <div className={`mx-4 mt-4 overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} p-5 text-white shadow-lg ring-4 ${config.ring}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Upgrade to</p>
              <h2 className="mt-1 text-2xl font-black">{plan.label} {config.emoji}</h2>
              <p className="mt-1 text-sm opacity-85">{plan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">{plan.price}</p>
              <p className="text-xs opacity-70">/ month</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            What&apos;s included
          </p>
          <ul className="space-y-2.5">
            {plan.features.map((feat, i) => (
              <li key={feat} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${config.gradient} text-white shadow-md`}>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                  </svg>
                </span>
                <span className="text-sm font-medium text-[var(--color-text)]">{feat}</span>
              </li>
            ))}
          </ul>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-500">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              SSL Secured
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-blue-500">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
              Flutterwave
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-purple-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Cancel anytime
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-300/50 bg-red-50/90 px-4 py-3 dark:bg-red-950/30">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-red-500 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div
          className="border-t border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface-elevated)_94%,black_6%)] px-5 pt-4"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }}
        >
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void onConfirm(plan.plan, "flutterwave")}
            className={`w-full rounded-2xl bg-gradient-to-r ${config.gradient} py-4 text-base font-bold text-white shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition active:scale-[0.98] disabled:opacity-60`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/>
                </svg>
                Opening Flutterwave…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2.5">
                <span>{config.emoji}</span>
                Unlock {plan.label} · {plan.price}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="mt-2 w-full py-2 text-sm text-[var(--color-text-muted)] disabled:opacity-40"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
