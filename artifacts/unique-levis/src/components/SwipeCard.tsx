import { useEffect, useRef, useState, memo } from "react";
import type { DiscoverCard } from "@/lib/types";
import { getProfileImage } from "@/lib/image";

type Props = {
  user: DiscoverCard;
  onLike: () => void;
  onSkip: () => void;
  onSuperLike: () => void;
  isBusy?: boolean;
};

function SwipeCard({ user, onLike, onSkip, onSuperLike, isBusy = false }: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const [deltaY, setDeltaY] = useState(0);
  const [flyingOut, setFlyingOut] = useState<"like" | "skip" | "super_like" | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setPhotoIndex(0);
    setShowDetails(false);
    setImageFailed(false);
    setDeltaX(0);
    setDeltaY(0);
    setFlyingOut(null);
  }, [user.id]);

  useEffect(() => { setImageFailed(false); }, [user.id, photoIndex]);

  const photoCount = Math.max(1, user.photos.length);
  const currentPhoto = user.photos[photoIndex] ?? user.photos[0] ?? "";
  const currentPhotoUrl = getProfileImage(currentPhoto, user.firstName, 560, 70);
  const fallbackPhotoUrl = getProfileImage(undefined, user.firstName, 560, 70);
  const photoSrc = imageFailed ? fallbackPhotoUrl : currentPhotoUrl;

  const likeOpacity = deltaX > 15 ? Math.min(1, (deltaX - 15) / 55) : 0;
  const skipOpacity = deltaX < -15 ? Math.min(1, (-deltaX - 15) / 55) : 0;
  const superLikeOpacity = deltaY < -30 ? Math.min(1, (-deltaY - 30) / 60) : 0;

  const tierColors: Record<string, string> = {
    diamond: "bg-cyan-400/90 text-cyan-950",
    gold:    "bg-amber-400/90 text-amber-950",
    platinum:"bg-orange-300/90 text-orange-950",
    silver:  "bg-slate-200/90 text-slate-800",
    free:    "bg-white/80 text-gray-900",
  };
  const tierClass = tierColors[user.membershipTier ?? "free"] ?? tierColors.free;

  const triggerFly = (dir: "like" | "skip" | "super_like") => {
    if (flyingOut || isBusy) return;
    setFlyingOut(dir);
    setTimeout(() => {
      setFlyingOut(null);
      setDeltaX(0);
      setDeltaY(0);
      if (dir === "like") onLike();
      else if (dir === "skip") onSkip();
      else onSuperLike();
    }, 260);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (flyingOut || showDetails) return;
    if ((e.target as HTMLElement).closest("button[data-action]")) return;
    cardRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || flyingOut) return;
    setDeltaX(e.clientX - startX);
    setDeltaY(e.clientY - startY);
  };
  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const absDx = Math.abs(deltaX);
    const absDy = Math.abs(deltaY);
    if (absDy > 80 && deltaY < 0 && absDy > absDx) triggerFly("super_like");
    else if (deltaX > 80) triggerFly("like");
    else if (deltaX < -80) triggerFly("skip");
    else { setDeltaX(0); setDeltaY(0); }
  };

  const rotation = deltaX * 0.028;
  const tx = flyingOut === "like" ? "160%" : flyingOut === "skip" ? "-160%" : `${deltaX * 0.2}px`;
  const ty = flyingOut === "super_like" ? "-130%" : `${dragging ? deltaY * 0.1 : 0}px`;
  const rot = flyingOut === "like" ? 30 : flyingOut === "skip" ? -30 : rotation;
  const scale = flyingOut === "super_like" ? 0.75 : 1;
  const opacity = flyingOut ? 0 : 1;
  const transition = dragging ? "none" : "transform 220ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 180ms";

  return (
    <article
      ref={cardRef}
      className="relative w-full h-full overflow-hidden rounded-[2.5rem] bg-black select-none touch-none"
      style={{
        transform: `translateX(${tx}) translateY(${ty}) rotate(${rot}deg) scale(${scale}) translateZ(0)`,
        opacity,
        transition,
        boxShadow: "0 32px 56px rgba(12,8,24,0.45), 0 4px 12px rgba(0,0,0,0.25)",
        willChange: "transform",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { setDragging(false); setDeltaX(0); setDeltaY(0); }}
    >
      {/* Background photo */}
      <img
        src={photoSrc}
        alt={user.firstName}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        draggable={false}
        onError={() => setImageFailed(true)}
      />

      {/* Preload next photo */}
      {user.photos[photoIndex + 1] && (
        <link
          rel="prefetch"
          as="image"
          href={getProfileImage(user.photos[photoIndex + 1], user.firstName, 560, 70)}
        />
      )}

      {/* Rich gradient overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent via-40% to-black/90" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* LIKE stamp */}
      <div
        className="pointer-events-none absolute left-6 top-20 z-20"
        style={{ opacity: likeOpacity, transform: `rotate(-18deg) scale(${0.7 + likeOpacity * 0.3})` }}
      >
        <div className="rounded-xl border-[3px] border-emerald-400 px-4 py-1.5">
          <span className="text-2xl font-black tracking-wide text-emerald-400 drop-shadow-lg">LIKE</span>
        </div>
      </div>

      {/* NOPE stamp */}
      <div
        className="pointer-events-none absolute right-6 top-20 z-20"
        style={{ opacity: skipOpacity, transform: `rotate(18deg) scale(${0.7 + skipOpacity * 0.3})` }}
      >
        <div className="rounded-xl border-[3px] border-red-400 px-4 py-1.5">
          <span className="text-2xl font-black tracking-wide text-red-400 drop-shadow-lg">NOPE</span>
        </div>
      </div>

      {/* SUPER LIKE stamp */}
      <div
        className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center"
        style={{ opacity: superLikeOpacity, transform: `scale(${0.7 + superLikeOpacity * 0.3})` }}
      >
        <div className="rounded-xl border-[3px] border-blue-400 px-5 py-1.5">
          <span className="text-2xl font-black tracking-wide text-blue-400 drop-shadow-lg">SUPER LIKE ★</span>
        </div>
      </div>

      {/* Photo progress dots */}
      <div className="absolute inset-x-0 top-0 p-4 z-10">
        <div className="flex gap-1.5">
          {Array.from({ length: Math.min(6, photoCount) }, (_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 rounded-full transition-all duration-200"
              style={{ background: i === Math.min(photoIndex, 5) ? "white" : "rgba(255,255,255,0.35)" }}
            />
          ))}
        </div>

        {/* Badges */}
        <div className="mt-2.5 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${tierClass}`}>
            {(user.membershipTier ?? "FREE").toUpperCase()}
          </span>
          {user.verified && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[11px] font-bold text-white">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
              </svg>
              Verified
            </span>
          )}
          {Boolean(user.modeReasons?.length) && (
            <span className="rounded-full bg-[var(--color-accent)]/85 px-2.5 py-0.5 text-[11px] font-bold text-white">
              {user.modeReasons?.[0]}
            </span>
          )}
        </div>
      </div>

      {/* Photo tap zones */}
      {photoCount > 1 && (
        <>
          <button
            type="button" data-action="photo-prev" aria-label="Previous photo"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setPhotoIndex((p) => (p === 0 ? photoCount - 1 : p - 1)); }}
            className="absolute left-0 top-[12%] h-[55%] w-[28%] bg-transparent z-10"
          />
          <button
            type="button" data-action="photo-next" aria-label="Next photo"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setPhotoIndex((p) => (p + 1) % photoCount); }}
            className="absolute right-0 top-[12%] h-[55%] w-[28%] bg-transparent z-10"
          />
        </>
      )}

      {/* Bottom profile info + actions */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col">
        <div className="px-5 pb-2">
          {/* AI match score */}
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold uppercase text-gray-900">
              {user.compatibilityBand}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
              <span className="text-[var(--color-accent)]">✦</span> {user.matchScore}% match
            </span>
          </div>

          {/* Name + age */}
          <h2 className="text-[2.1rem] font-black leading-none tracking-tight text-white drop-shadow-sm">
            {user.firstName}<span className="font-light">, {user.age}</span>
          </h2>

          {/* Location */}
          <div className="mt-1 flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 text-white/70 shrink-0">
              <path fillRule="evenodd" d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm font-medium text-white/85">{user.city}</p>
            {user.distanceLabel && <p className="text-xs text-white/55">· {user.distanceLabel}</p>}
          </div>

          {/* Dating intent */}
          {user.datingIntent && (
            <p className="mt-1 text-xs font-semibold text-white/60 uppercase tracking-wide">
              Looking for: <span className="text-white/85">{user.datingIntent}</span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3.5 px-5 pb-5 pt-2">
          {/* Skip */}
          <button
            type="button" data-action="skip"
            disabled={isBusy || Boolean(flyingOut)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); triggerFly("skip"); }}
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-rose-400/50 bg-white shadow-[0_8px_24px_rgba(255,79,122,0.22)] transition active:scale-90 disabled:opacity-50"
            aria-label="Pass"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          {/* Super like */}
          <button
            type="button" data-action="super_like"
            disabled={isBusy || Boolean(flyingOut)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); triggerFly("super_like"); }}
            className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 border-blue-400/50 bg-white shadow-[0_6px_18px_rgba(92,75,180,0.24)] transition active:scale-90 disabled:opacity-50"
            aria-label="Super like"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
            </svg>
          </button>

          {/* Like */}
          <button
            type="button" data-action="like"
            disabled={isBusy || Boolean(flyingOut)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); triggerFly("like"); }}
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full romance-gradient shadow-[0_8px_28px_rgba(255,79,122,0.55)] transition active:scale-90 disabled:opacity-50"
            aria-label="Like"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.199 3.539 1 6.5 1c1.898 0 3.698.798 5.5 2.6C13.802 1.798 15.602 1 17.5 1 20.461 1 23 3.199 23 7.191c0 4.105-5.37 8.863-11 14.402z"/>
            </svg>
          </button>

          {/* Details */}
          <button
            type="button" data-action="details"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowDetails((p) => !p); }}
            className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 border-white/30 bg-black/50 text-white backdrop-blur-sm transition active:scale-90"
            aria-label={showDetails ? "Hide details" : "Show details"}
          >
            <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Details drawer */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 rounded-t-3xl bg-[var(--color-surface-elevated)] transition-transform duration-300 ease-out ${showDetails ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "68%" }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-hidden={!showDetails}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[var(--color-border)]" />
        </div>
        <div className="flex items-center justify-between px-5 pb-2">
          <div>
            <p className="text-base font-bold text-[var(--color-primary)]">{user.firstName}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{user.city} · {user.age} years old</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDetails(false)}
            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(68dvh - 90px)" }}>
          {/* Interests */}
          {user.interests.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {user.interests.slice(0, 12).map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-primary)]"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <p className="mb-3 text-sm leading-relaxed text-[var(--color-text)]">{user.bio}</p>
          )}

          {/* AI matchmaker */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[color-mix(in_oklab,var(--color-accent)_5%,var(--color-surface))] p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[var(--color-accent)]">✦</span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">AI Matchmaker</p>
            </div>
            <ul className="space-y-1.5">
              {user.aiReasons.slice(0, 3).map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-xs text-[var(--color-primary)]">
                  <span className="mt-0.5 text-[var(--color-accent)]">•</span>
                  {reason}
                </li>
              ))}
            </ul>
            {user.dateIdea && (
              <p className="mt-2.5 rounded-xl bg-[color-mix(in_oklab,var(--color-accent)_10%,var(--color-surface))] px-3 py-2 text-xs font-semibold text-[var(--color-accent)]">
                💡 Suggested first date: {user.dateIdea}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(SwipeCard, (prev, next) => prev.user.id === next.user.id && prev.isBusy === next.isBusy);
