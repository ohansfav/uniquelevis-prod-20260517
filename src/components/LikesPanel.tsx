import { useMemo, useState } from "react";
import type { BillingProvider, IncomingLikeItem, MembershipTier, PaidMembershipTier } from "@/lib/types";
import { getProfileImage } from "@/lib/image";
import CheckoutSheet, { type CheckoutPlan } from "./CheckoutSheet";

type Props = {
  likesCount: number;
  likes: IncomingLikeItem[];
  likesUnlocked: boolean;
  membershipTier?: MembershipTier;
  trialExpiresAt?: string;
  billingConfig?: {
    checkoutConfigured?: boolean;
    checkoutMissing?: string[];
    planAmounts?: {
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
  { plan: "silver",   label: "Silver",   price: "₦500",   accent: "bg-[#d8dee8] text-[#233244]", description: "Likes + direct messaging.",  features: ["See who liked you", "Unlimited direct messages", "Full profile visibility"] },
  { plan: "gold",     label: "Gold",     price: "₦1,000", accent: "bg-[#f2cb4d] text-[#2b1d0f]", description: "Premium gatekeeping + all perks.", features: ["All Silver perks", "Only Gold/Silver can view you", "Only Gold/Silver can message you"] },
  { plan: "diamond",  label: "Diamond",  price: "₦1,500", accent: "bg-[#b8f2e6] text-[#1a3c34]", description: "Elite gatekeeping + full access.", features: ["All Gold perks", "Only Diamond/Gold can view you", "Only Diamond/Gold can message you"] },
];

const isInTrial = (expiresAt?: string) => {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
};

const formatNaira = (amount: number) => `N${amount.toLocaleString("en-NG")}`;

export default function LikesPanel({ likesCount, likes, likesUnlocked, membershipTier, trialExpiresAt, billingConfig, onUpgrade }: Props) {
  const [checkoutPlan, setCheckoutPlan] = useState<CheckoutPlan | null>(null);
  const [upgradingPlan, setUpgradingPlan] = useState<PaidMembershipTier | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const cards = likes.slice(0, 4);
  const cardSlots: Array<IncomingLikeItem | null> = cards.length > 0 ? cards : [null, null, null, null];
  const tierLabel = (membershipTier ?? "free").toUpperCase();

  const resolvedUpgradeOptions = useMemo(() => {
    const amounts = billingConfig?.planAmounts;
    if (!amounts) return upgradeOptions;
    return upgradeOptions.map((option) => {
      const amount = amounts[option.plan];
      if (!Number.isFinite(amount) || amount <= 0) return option;
      return { ...option, price: formatNaira(amount) };
    });
  }, [billingConfig?.planAmounts]);

  const handlePlanTap = (option: CheckoutPlan) => {
    setUpgradeError(null);
    setCheckoutPlan(option);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-primary)]">Who Liked You</h3>
          <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wide font-semibold">
            Current plan: {tierLabel}
            {isInTrial(trialExpiresAt) && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-700">TRIAL ACTIVE</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full romance-gradient px-3 py-1.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(255,79,122,0.4)]">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M8 14.373c-3.878-3.815-7.5-7.091-7.5-9.924C.5 2.199 2.277.5 4.5.5c1.306 0 2.548.55 3.5 1.79C8.952 1.05 10.194.5 11.5.5c2.223 0 4 1.699 4 3.949 0 2.833-3.622 6.109-7.5 9.924z"/>
            </svg>
            {likesCount}
          </span>
        </div>
      </div>

      {/* Blurred card grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {cardSlots.map((item, index) => (
            <article
              key={item ? item.id : index}
              className="group relative overflow-hidden rounded-2xl"
              style={{ aspectRatio: "3/4" }}
            >
              {item ? (
                <>
                  <img
                    src={getProfileImage(item.byUser.photos[0], item.byUser.firstName, 320, 50)}
                    alt={likesUnlocked ? item.byUser.firstName : "Hidden"}
                    className={`h-full w-full object-cover transition-all duration-300 ${likesUnlocked ? "" : "blur-[12px] scale-110"}`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Lock icon on blurred cards */}
                  {!likesUnlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                        <svg viewBox="0 0 20 20" fill="white" className="h-5 w-5 opacity-80">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    {likesUnlocked ? (
                      <>
                        <p className="text-sm font-bold drop-shadow-sm">{item.byUser.firstName}, {item.byUser.age}</p>
                        <p className="text-[10px] text-white/75">{item.byUser.city}</p>
                      </>
                    ) : (
                      <p className="text-xs font-semibold text-white/60">Unlock to reveal</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full w-full shimmer rounded-2xl" />
              )}
            </article>
          ))}
        </div>

        {/* Upgrade CTA */}
        {!likesUnlocked && (
          <div className="mt-4">
            <div className="mb-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                {likesCount > 0 ? `${likesCount} people liked you` : "People are waiting to be revealed"}
              </p>
              {isInTrial(trialExpiresAt) ? (
                <p className="mt-1 text-xs text-emerald-600 font-semibold">
                  Your free trial is active — unlock likes at no charge for now.
                </p>
              ) : (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Upgrade to see exactly who liked you and start conversations first.
                </p>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {resolvedUpgradeOptions.map((option) => (
                <button
                  key={option.plan}
                  type="button"
                  onClick={() => handlePlanTap(option)}
                  disabled={!onUpgrade}
                  className={`rounded-2xl px-3 py-3 text-left transition active:scale-95 hover:brightness-105 ${option.accent} ${!onUpgrade ? "cursor-not-allowed opacity-55" : ""}`}
                >
                  <span className="block text-sm font-black">{option.label}</span>
                  <span className="block text-base font-bold">{option.price}</span>
                  <span className="mt-0.5 block text-[10px] opacity-75">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {likesUnlocked && likesCount === 0 && (
          <p className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
            No likes yet — keep swiping to get noticed ✨
          </p>
        )}

        {likesUnlocked && likesCount > 0 && (
          <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
            Showing {Math.min(4, likesCount)} of {likesCount} likes — swipe back on their profiles to match!
          </p>
        )}
      </div>

      {/* Checkout sheet */}
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
    </section>
  );
}
