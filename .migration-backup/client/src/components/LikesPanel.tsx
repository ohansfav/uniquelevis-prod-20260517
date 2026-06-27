import { useMemo, useState } from "react";
import type { BillingProvider, IncomingLikeItem, MembershipTier, PaidMembershipTier } from "@/lib/types";
import { getProfileImage } from "@/lib/image";
import CheckoutSheet, { type CheckoutPlan } from "./CheckoutSheet";

type Props = {
  likesCount: number;
  likes: IncomingLikeItem[];
  likesUnlocked: boolean;
  membershipTier?: MembershipTier;
  billingConfig?: {
    checkoutConfigured?: boolean;
    checkoutMissing?: string[];
    planAmounts?: {
      platinum: number;
      silver: number;
      gold: number;
      diamond: number;
    };
    providers?: {
      flutterwave: { checkoutConfigured: boolean; missing: string[] };
    };
  } | null;
  onUpgrade?: (plan: PaidMembershipTier, provider?: BillingProvider) => Promise<void> | void;
};

const upgradeOptions: CheckoutPlan[] = [
  { plan: "platinum", label: "Platinum", price: "N500",   accent: "bg-[#ffc38a] text-[#3c2414]", description: "See exactly who liked you.",                features: ["See exactly who liked you", "Unlimited likes visibility", "Priority in discovery"] },
  { plan: "silver",   label: "Silver",   price: "N1,000", accent: "bg-[#d8dee8] text-[#233244]", description: "Likes visibility with premium discover access.", features: ["Likes visibility", "Premium discover access", "Send messages first"] },
  { plan: "gold",     label: "Gold",     price: "N3,000", accent: "bg-[#f2cb4d] text-[#2b1d0f]", description: "Gold privacy gate and higher-tier visibility.",  features: ["All Silver perks", "Gold privacy gate", "Higher-tier matches"] },
];

const formatNaira = (amount: number) => `N${amount.toLocaleString("en-NG")}`;

export default function LikesPanel({ likesCount, likes, likesUnlocked, membershipTier, billingConfig, onUpgrade }: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<CheckoutPlan | null>(null);
  const [upgradingPlan, setUpgradingPlan] = useState<PaidMembershipTier | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const cards = likes.slice(0, 4);
  const cardSlots: Array<IncomingLikeItem | null> = cards.length > 0 ? cards : [null, null, null, null];
  const tierLabel = (membershipTier ?? "free").toUpperCase();
  const flutterwaveReady = billingConfig ? billingConfig.checkoutConfigured !== false : true;

  const unavailableReason = !flutterwaveReady
    ? "Flutterwave checkout is currently unavailable right now. Tap any plan to recheck the live gateway."
    : null;

  const missingForProvider = billingConfig?.checkoutMissing ?? [];

  const resolvedUpgradeOptions = useMemo(() => {
    const amounts = billingConfig?.planAmounts;
    if (!amounts) return upgradeOptions;

    return upgradeOptions.map((option) => {
      const amount = amounts[option.plan];
      if (!Number.isFinite(amount) || amount <= 0) {
        return option;
      }
      return {
        ...option,
        price: formatNaira(amount),
      };
    });
  }, [billingConfig?.planAmounts]);

  const handleUpgradeClick = async (plan: PaidMembershipTier) => {
    if (upgradingPlan) return;
    setUpgradingPlan(plan);
    setUpgradeError(null);
    try {
      await onUpgrade?.(plan, "flutterwave");
    } catch (err) {
      setUpgradeError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handlePlanTap = (option: CheckoutPlan) => {
    setUpgradeError(null);
    setCheckoutPlan(option);
  };

  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-[0_20px_30px_rgba(27,23,48,0.1)] md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[var(--color-primary)]">Likes</h3>
        <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">{likesCount} likes</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {["Nearby", "Has bio", "Photo verified", "Art", "Fashion"].map((tag) => (
          <span key={tag} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[var(--color-text-muted)]">{tag}</span>
        ))}
      </div>

      <p className="mb-2 text-xs text-[var(--color-text-muted)]">
        {likesUnlocked
          ? "People who liked you are listed here in real time."
          : "Platinum unlocks exactly who liked you. Silver, Gold, and Diamond add higher-tier visibility and privacy controls."}
      </p>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">Current tier: {tierLabel}</p>

      <div className="grid gap-3 lg:grid-cols-2">
        {cardSlots.map((item, index) => (
          <article key={item ? item.id : index} className="relative h-48 overflow-hidden rounded-2xl border border-white/15 lg:h-56">
            {item ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getProfileImage(item.byUser.photos[0], item.byUser.firstName, 440, 52)}
                  alt={item.byUser.firstName}
                  className={`h-full w-full object-cover ${likesUnlocked ? "" : "filter blur-sm scale-105"}`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="text-sm font-semibold">{item.byUser.firstName}, {item.byUser.age}</p>
                  <p className="text-[11px] text-white/80">{item.byUser.city}</p>
                </div>
              </>
            ) : (
              <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-300/40 via-slate-200/20 to-slate-500/30" />
            )}
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowUpgrade((p) => !p)}
        className="mt-4 w-full rounded-full bg-[#f2cb4d] px-5 py-3 text-sm font-bold text-[#2b1d0f] shadow-[0_10px_20px_rgba(242,203,77,0.3)] transition hover:brightness-105 active:scale-95"
      >
        {likesUnlocked ? (likesCount > 0 ? `You have ${likesCount} incoming like${likesCount === 1 ? "" : "s"}` : "No likes waiting yet") : "Unlock who likes you"}
      </button>
      {showUpgrade && !likesUnlocked && (
        <div className="mt-3 rounded-2xl border border-[#f2cb4d]/40 bg-[#f2cb4d]/10 p-3">
          <p className="text-sm text-[var(--color-text)]">
            Upgrade your membership to unlock likes visibility, messaging, and premium privacy controls.
          </p>
          {!flutterwaveReady && (
            <p className="mt-2 text-xs text-[#8a2445]">Flutterwave checkout is currently unavailable right now. Tap any plan to recheck the live gateway.</p>
          )}
          {!flutterwaveReady && (billingConfig?.checkoutMissing ?? []).length > 0 && (
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Missing: {(billingConfig?.checkoutMissing ?? []).join(", ")}</p>
          )}
          {upgradeError && (
            <p className="mt-2 rounded-xl border border-red-300/60 bg-red-50/80 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{upgradeError}</p>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {resolvedUpgradeOptions.map((option) => (
              <button
                key={option.plan}
                type="button"
                onClick={() => handlePlanTap(option)}
                disabled={!onUpgrade}
                className={`rounded-2xl px-3 py-3 text-left transition active:scale-95 ${option.accent} ${!onUpgrade ? "cursor-not-allowed opacity-55" : "hover:brightness-105"}`}
              >
                <span className="block text-sm font-bold">{option.label} • {option.price}</span>
                <span className="block text-[11px] opacity-80 mt-0.5">{option.description}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowUpgrade(false)}
            className="mt-2 text-xs text-[var(--color-text-muted)] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Checkout sheet (slides up from bottom) */}
      {checkoutPlan && (
        <CheckoutSheet
          plan={checkoutPlan}
          isLoading={upgradingPlan === checkoutPlan.plan}
          error={upgradeError}
          onConfirm={async (plan, provider) => {
            setUpgradingPlan(plan);
            setUpgradeError(null);
            try {
              await onUpgrade?.(plan, provider);
            } catch (err) {
              setUpgradeError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
            } finally {
              setUpgradingPlan(null);
            }
          }}
          onClose={() => {
            if (!upgradingPlan) {
              setCheckoutPlan(null);
              setUpgradeError(null);
            }
          }}
        />
      )}

      {likesUnlocked && likesCount === 0 && (
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">No one has liked you yet. Keep swiping to get noticed.</p>
      )}
    </section>
  );
}
