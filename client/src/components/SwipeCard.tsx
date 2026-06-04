"use client";

import { useEffect, useMemo, useState } from "react";
import type { DiscoverCard } from "@/lib/types";
import { getProfileImage } from "@/lib/image";

type Props = {
  user: DiscoverCard;
  onLike: () => void;
  onSkip: () => void;
  onSuperLike: () => void;
  isBusy?: boolean;
};

type Lens = "for-you" | "double-date" | "astrology" | "music";
const LENSES: Array<{ id: Lens; label: string }> = [
  { id: "for-you", label: "For you" },
  { id: "double-date", label: "Double Date" },
  { id: "astrology", label: "Astrology" },
  { id: "music", label: "Music" },
];

export default function SwipeCard({ user, onLike, onSkip, onSuperLike, isBusy = false }: Props) {
  const [startX, setStartX] = useState<number | null>(null);
  const [deltaX, setDeltaX] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [activeLens, setActiveLens] = useState<Lens>("for-you");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setPhotoIndex(0);
    setShowDetails(false);
    setImageFailed(false);
  }, [user.id]);

  useEffect(() => {
    setImageFailed(false);
  }, [user.id, photoIndex]);

  const likeOpacity = useMemo(() => (deltaX > 20 ? Math.min(1, (deltaX - 20) / 60) : 0), [deltaX]);
  const skipOpacity = useMemo(() => (deltaX < -20 ? Math.min(1, (-deltaX - 20) / 60) : 0), [deltaX]);

  const resetGesture = () => { setStartX(null); setDeltaX(0); };
  const handleDragMove = (clientX: number) => { if (startX === null) return; setDeltaX(clientX - startX); };
  const handleDragEnd = () => {
    if (deltaX > 70) onLike();
    else if (deltaX < -70) onSkip();
    resetGesture();
  };

  const tierLabel = (user.membershipTier ?? "free").toUpperCase();
  const photoCount = Math.max(1, user.photos.length);
  const currentPhoto = user.photos[photoIndex] ?? user.photos[0] ?? "";
  const currentPhotoUrl = getProfileImage(currentPhoto, user.firstName, 560, 70);
  const fallbackPhotoUrl = getProfileImage(undefined, user.firstName, 560, 70);
  const photoSrc = imageFailed ? fallbackPhotoUrl : currentPhotoUrl;
  const tierClass =
    user.membershipTier === "diamond" ? "bg-cyan-100 text-cyan-900"
    : user.membershipTier === "gold" ? "bg-amber-100 text-amber-900"
    : user.membershipTier === "platinum" ? "bg-orange-100 text-orange-900"
    : user.membershipTier === "silver" ? "bg-slate-100 text-slate-800"
    : "bg-white/85 text-gray-900";

  return (
    <article
      className="relative w-full h-full overflow-hidden rounded-[2rem] bg-black select-none"
      style={{
        transform: `translateX(${deltaX * 0.22}px) rotate(${deltaX * 0.025}deg) translateZ(0)`,
        transition: startX === null ? "transform 200ms ease-out" : "none",
        touchAction: "pan-y",
        boxShadow: "0 26px 45px rgba(18,12,30,0.3)",
        willChange: "transform",
        backfaceVisibility: "hidden",
      }}
      onPointerDown={(e) => { setStartX(e.clientX); }}
      onPointerMove={(e) => handleDragMove(e.clientX)}
      onPointerUp={handleDragEnd}
      onPointerCancel={resetGesture}
      onPointerLeave={() => { if (startX !== null) handleDragEnd(); }}
    >
      {/* Background photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoSrc}
        alt={`${user.firstName}`}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        onError={() => setImageFailed(true)}
        draggable={false}
      />
      {/* Preload the next photo in this card's gallery so tapping the nav is instant */}
      {user.photos[photoIndex + 1] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={getProfileImage(user.photos[photoIndex + 1], user.firstName, 560, 70)} alt="" aria-hidden fetchPriority="low" style={{ display: "none" }} draggable={false} />
      )}

      {/* LIKE / NOPE swipe indicators */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-start pl-8" style={{ opacity: likeOpacity }}>
        <span className="rotate-[-20deg] rounded-xl border-4 border-emerald-400 px-5 py-2 text-3xl font-black text-emerald-400 drop-shadow-lg">LIKE</span>
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-8" style={{ opacity: skipOpacity }}>
        <span className="rotate-[20deg] rounded-xl border-4 border-red-400 px-5 py-2 text-3xl font-black text-red-400 drop-shadow-lg">NOPE</span>
      </div>

      {/* Top overlay: photo dots + lens tabs + badges */}
      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="mb-2.5 flex gap-1">
          {Array.from({ length: Math.min(6, photoCount) }, (_, i) => i).map((i) => (
            <span key={i} className={`h-[3px] flex-1 rounded-full transition-all ${i === Math.min(photoIndex, 5) ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {LENSES.map((lens) => (
            <button
              key={lens.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActiveLens(lens.id); }}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold transition ${activeLens === lens.id ? "border-white bg-white text-[#141526]" : "border-white/30 bg-black/30 text-white"}`}
            >
              {lens.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${tierClass}`}>{tierLabel}</span>
          {user.verified && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-900">Verified ✓</span>
          )}
        </div>
      </div>

      {/* Invisible left / right tap zones for photo navigation */}
      {photoCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setPhotoIndex((p) => (p === 0 ? photoCount - 1 : p - 1)); }}
            className="absolute left-0 top-[14%] h-[52%] w-[28%] bg-transparent"
          />
          <button
            type="button"
            aria-label="Next photo"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setPhotoIndex((p) => (p + 1) % photoCount); }}
            className="absolute right-0 top-[14%] h-[52%] w-[28%] bg-transparent"
          />
        </>
      )}

      {/* Bottom gradient + profile info + action buttons */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/60 to-transparent pt-20">
        <div className="px-5 pb-2">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase text-gray-900">{user.compatibilityBand}</span>
            <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white">AI {user.matchScore}%</span>
          </div>
          <h2 className="text-[2rem] font-bold leading-tight text-white">{user.firstName}, {user.age}</h2>
          <p className="text-sm text-white/90">{user.city}</p>
          <p className="text-xs text-white/60">{user.distanceLabel}</p>
          {Boolean(user.modeReasons?.length) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.modeReasons?.slice(0, 3).map((reason) => (
                <span key={reason} className="rounded-full border border-white/30 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">{reason}</span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons row — overlaid inside the card */}
        <div className="flex items-center justify-center gap-4 px-5 pb-5 pt-2">
          <button
            type="button"
            disabled={isBusy}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); if (!isBusy) onSkip(); }}
            className="flex h-[58px] w-[58px] items-center justify-center rounded-full border-2 border-[#ff6f8f]/50 bg-white text-[22px] text-[#ff6f8f] shadow-[0_6px_20px_rgba(255,79,122,0.28)] transition active:scale-90 disabled:opacity-50"
            aria-label="Pass"
          >✕</button>
          <button
            type="button"
            disabled={isBusy}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); if (!isBusy) onSuperLike(); }}
            className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 border-[#7c6bce]/60 bg-white text-[20px] text-[#5f4dc0] shadow-[0_4px_14px_rgba(92,75,180,0.28)] transition active:scale-90 disabled:opacity-50"
            aria-label="Super like"
          >★</button>
          <button
            type="button"
            disabled={isBusy}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); if (!isBusy) onLike(); }}
            className="flex h-[58px] w-[58px] items-center justify-center rounded-full romance-gradient text-[22px] text-white shadow-[0_6px_24px_rgba(255,79,122,0.5)] transition active:scale-90 disabled:opacity-50"
            aria-label="Like"
          >❤</button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowDetails((p) => !p); }}
            className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 border-white/40 bg-black/50 text-white backdrop-blur transition active:scale-90"
            aria-label={showDetails ? "Hide details" : "Show details"}
            aria-expanded={showDetails}
          >
            <span className={`text-sm transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}>▴</span>
          </button>
        </div>
      </div>

      {/* Details drawer — slides up from bottom */}
      <div
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl bg-[var(--color-surface-elevated)] transition-transform duration-300 ease-out ${showDetails ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "64%" }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-hidden={!showDetails}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
        </div>
        <div className="flex items-center justify-between px-5 pb-2">
          <p className="text-base font-bold text-[var(--color-primary)]">{user.firstName}&apos;s Details</p>
          <button
            type="button"
            onClick={() => setShowDetails(false)}
            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface)]"
          >Close</button>
        </div>
        <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "calc(64dvh - 80px)" }}>
          <div className="space-y-3">
            {user.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.interests.slice(0, 10).map((interest) => (
                  <span key={interest} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary)]">{interest}</span>
                ))}
              </div>
            )}
            <p className="text-sm leading-relaxed text-[var(--color-text)]">{user.bio}</p>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">AI Matchmaker</p>
              <ul className="mt-2 space-y-1.5 text-xs text-[var(--color-primary)]">
                {user.aiReasons.slice(0, 2).map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs font-medium text-[var(--color-accent)]">
                💡 Suggested first date: {user.dateIdea}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
