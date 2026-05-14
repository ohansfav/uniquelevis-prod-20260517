import { useState } from "react";
import type { MatchItem } from "@/lib/types";
import { optimizeUnsplash } from "@/lib/image";

type Props = {
  likesCount: number;
  matches: MatchItem[];
  onUpgrade?: (plan: "silver" | "gold" | "diamond") => void;
};

export default function LikesPanel({ likesCount, matches, onUpgrade }: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const cards = matches.slice(0, 4);
  const cardSlots: Array<MatchItem | null> = cards.length > 0 ? cards : [null, null, null, null];

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

      <p className="mb-3 text-xs text-[var(--color-text-muted)]">Upgrade to Gold to see people who already liked you.</p>

      <div className="grid grid-cols-2 gap-3">
        {cardSlots.map((item, index) => (
          <article key={item ? item.id : index} className="relative h-48 overflow-hidden rounded-2xl border border-white/15 md:h-56">
            {item ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={optimizeUnsplash(item.otherUser.photos[0], 440, 52)}
                  alt={item.otherUser.firstName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="text-sm font-semibold">{item.otherUser.firstName}, {item.otherUser.age}</p>
                  <p className="text-[11px] text-white/80">{item.otherUser.city}</p>
                </div>
              </>
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-300/40 via-slate-200/20 to-slate-500/30" />
            )}
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowUpgrade((p) => !p)}
        className="mt-4 w-full rounded-full bg-[#f2cb4d] px-5 py-3 text-sm font-bold text-[#2b1d0f] shadow-[0_10px_20px_rgba(242,203,77,0.3)] transition hover:brightness-105 active:scale-95"
      >
        See who likes you
      </button>
      {showUpgrade && (
        <div className="mt-3 rounded-2xl border border-[#f2cb4d]/40 bg-[#f2cb4d]/10 p-3">
          <p className="text-sm text-[var(--color-text)]">
            ✨ Upgrade to <strong>Gold</strong> to unlock who liked you — see their faces and match instantly.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onUpgrade?.("silver")}
              className="rounded-full border border-[var(--color-border)] bg-white/70 px-2 py-1 text-[11px] font-semibold text-[var(--color-primary)]"
            >
              Silver
            </button>
            <button
              type="button"
              onClick={() => onUpgrade?.("gold")}
              className="rounded-full bg-[#f2cb4d] px-2 py-1 text-[11px] font-bold text-[#2b1d0f]"
            >
              Gold
            </button>
            <button
              type="button"
              onClick={() => onUpgrade?.("diamond")}
              className="rounded-full bg-[#7cd4ff] px-2 py-1 text-[11px] font-bold text-[#14304b]"
            >
              Diamond
            </button>
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
    </section>
  );
}
