"use client";

import { useMemo, useState } from "react";
import type { DiscoverCard } from "@/lib/types";

type Props = {
  user: DiscoverCard;
  onLike: () => void;
  onSkip: () => void;
  onSuperLike: () => void;
};

export default function SwipeCard({ user, onLike, onSkip, onSuperLike }: Props) {
  const [startX, setStartX] = useState<number | null>(null);
  const [deltaX, setDeltaX] = useState(0);

  const actionHint = useMemo(() => {
    if (deltaX > 55) return "Release to Like";
    if (deltaX < -55) return "Release to Skip";
    return "Swipe right to like, left to pass";
  }, [deltaX]);

  const resetGesture = () => {
    setStartX(null);
    setDeltaX(0);
  };

  const handleTouchMove = (clientX: number) => {
    if (startX === null) return;
    setDeltaX(clientX - startX);
  };

  const handleTouchEnd = () => {
    if (deltaX > 70) onLike();
    if (deltaX < -70) onSkip();
    resetGesture();
  };

  const tierLabel = (user.membershipTier ?? "free").toUpperCase();
  const tierClass =
    user.membershipTier === "diamond"
      ? "bg-cyan-100 text-cyan-900"
      : user.membershipTier === "gold"
        ? "bg-amber-100 text-amber-900"
        : user.membershipTier === "silver"
          ? "bg-slate-100 text-slate-800"
          : "bg-white/80 text-[var(--color-primary)]";

  return (
    <article
      className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_26px_45px_rgba(18,12,30,0.22)]"
      onTouchStart={(e) => setStartX(e.changedTouches[0].clientX)}
      onTouchMove={(e) => handleTouchMove(e.changedTouches[0].clientX)}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${deltaX * 0.22}px) rotate(${deltaX * 0.03}deg)`,
        transition: startX === null ? "transform 220ms ease" : "none",
      }}
    >
      <div className="relative h-[560px] w-full bg-slate-100 md:h-[620px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.photos[0]}
          alt={`${user.firstName} profile`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 top-0 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-primary)] backdrop-blur">
              {actionHint}
            </span>
            <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.08em] ${tierClass}`}>
              {tierLabel}
            </span>
            {user.verified && (
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-900">
                Verified ✓
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/78 via-black/35 to-transparent p-5 text-white">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
              {user.compatibilityBand}
            </span>
            <span className="inline-flex rounded-full bg-black/45 px-3 py-1 text-xs font-semibold">
              AI Score {user.matchScore}%
            </span>
          </div>
          <h2 className="text-3xl font-bold">
            {user.firstName}, {user.age}
          </h2>
          <p className="text-sm opacity-95">{user.city}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.interests.slice(0, 4).map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm leading-relaxed text-[var(--color-text)]">{user.bio}</p>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">AI Matchmaker</p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-primary)]">
            {user.aiReasons.slice(0, 2).map((reason) => (
              <li key={reason}>• {reason}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">
            Suggested first date: {user.dateIdea}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onSkip}
            aria-label="Pass"
            className="grid h-12 place-items-center rounded-full border border-[#ffd5de] bg-white text-xl font-semibold text-[#ff6f8f] transition hover:scale-[1.03]"
          >
            ✕
          </button>
          <button
            onClick={onSuperLike}
            aria-label="Super like"
            className="grid h-12 place-items-center rounded-full border border-[#7c6bce] bg-white text-xl font-semibold text-[#5f4dc0] transition hover:scale-[1.03]"
          >
            ★
          </button>
          <button
            onClick={onLike}
            aria-label="Like"
            className="grid h-12 place-items-center rounded-full romance-gradient text-xl font-semibold text-white transition hover:scale-[1.03]"
          >
            ❤
          </button>
        </div>
      </div>
    </article>
  );
}
