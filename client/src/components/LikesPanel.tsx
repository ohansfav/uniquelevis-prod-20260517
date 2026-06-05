import { useState } from "react";
import type { BillingProvider, IncomingLikeItem, MembershipTier, PaidMembershipTier } from "@/lib/types";
import { getProfileImage } from "@/lib/image";

type Props = {
  likesCount: number;
  likes: IncomingLikeItem[];
  likesUnlocked: boolean;
  membershipTier?: MembershipTier;
  billingConfig?: {
    providers?: {
      flutterwave: { checkoutConfigured: boolean; missing: string[] };
    };
  } | null;
  onUpgrade?: (plan: PaidMembershipTier, provider?: BillingProvider) => void;
};

const upgradeOptions: Array<{ plan: PaidMembershipTier; label: string; accent: string; description: string; price: string }> = [
  { plan: "platinum", label: "Platinum", price: "N500", accent: "bg-[#ffc38a] text-[#3c2414]", description: "See exactly who liked you." },
  { plan: "silver", label: "Silver", price: "N1,000", accent: "bg-[#d8dee8] text-[#233244]", description: "Likes visibility with premium discover access." },
  { plan: "gold", label: "Gold", price: "N3,000", accent: "bg-[#f2cb4d] text-[#2b1d0f]", description: "Gold privacy gate and higher-tier visibility." },
  { plan: "diamond", label: "Diamond", price: "N5,000", accent: "bg-[#7cd4ff] text-[#14304b]", description: "Top-tier privacy and full access." },
];

export default function LikesPanel({ likesCount, likes, likesUnlocked, membershipTier, billingConfig, onUpgrade }: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const cards = likes.slice(0, 4);
  const cardSlots: Array<IncomingLikeItem | null> = cards.length > 0 ? cards : [null, null, null, null];
  const tierLabel = (membershipTier ?? "free").toUpperCase();
  const flutterwaveStatus = billingConfig?.providers?.flutterwave;
  const flutterwaveReady = billingConfig ? billingConfig.checkoutConfigured !== false : true;

  const unavailableReason = !flutterwaveReady
    ? "Flutterwave checkout is currently unavailable right now. Tap any plan to recheck the live gateway."
    : null;

  const missingForProvider = billingConfig?.checkoutMissing ?? [];

  const handleUpgradeClick = (plan: PaidMembershipTier) => {
    onUpgrade?.(plan, "flutterwave");
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

      <div className="grid grid-cols-2 gap-3">
        {cardSlots.map((item, index) => (
          <article key={item ? item.id : index} className="relative h-48 overflow-hidden rounded-2xl border border-white/15 md:h-56">
            {item && likesUnlocked ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getProfileImage(item.byUser.photos[0], item.byUser.firstName, 440, 52)}
                  alt={item.byUser.firstName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="text-sm font-semibold">{item.byUser.firstName}, {item.byUser.age}</p>
                  <p className="text-[11px] text-white/80">{item.byUser.city}</p>
                </div>
              </>
            ) : (
              <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-300/40 via-slate-200/20 to-slate-500/30">
                {!likesUnlocked && <div className="absolute inset-0 backdrop-blur-md" />}
              </div>
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
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">Payment Provider: Flutterwave</p>
          {unavailableReason && (
            <p className="mt-2 text-xs text-[#8a2445]">{unavailableReason}</p>
          )}
          {unavailableReason && (
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Tap any plan to retry the live gateway check.</p>
          )}
          {unavailableReason && missingForProvider.length > 0 && (
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Missing: {missingForProvider.join(", ")}</p>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {upgradeOptions.map((option) => (
              <button
                key={option.plan}
                type="button"
                onClick={() => handleUpgradeClick(option.plan)}
                disabled={!onUpgrade}
                className={`rounded-2xl px-3 py-2 text-left text-[11px] font-semibold ${option.accent} ${
                  !onUpgrade ? "cursor-not-allowed opacity-55" : ""
                }`}
              >
                <span className="block text-sm font-bold">{option.label} • {option.price}</span>
                <span className="block opacity-80">{option.description}</span>
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

      {likesUnlocked && likesCount === 0 && (
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">No one has liked you yet. Keep swiping to get noticed.</p>
      )}
    </section>
  );
}
