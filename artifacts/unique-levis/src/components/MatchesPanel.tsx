import type { MatchItem } from "@/lib/types";
import { getProfileImage } from "@/lib/image";

type Props = {
  matches: MatchItem[];
  selectedMatchId?: string | null;
  onSelectMatch?: (matchId: string) => void;
};

export default function MatchesPanel({ matches, selectedMatchId, onSelectMatch }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-[var(--color-primary)]">Matches</h3>
          {matches.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full romance-gradient px-1.5 text-[10px] font-bold text-white">
              {matches.length}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.199 3.539 1 6.5 1c1.898 0 3.698.798 5.5 2.6C13.802 1.798 15.602 1 17.5 1 20.461 1 23 3.199 23 7.191c0 4.105-5.37 8.863-11 14.402z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-[var(--color-primary)]">No matches yet</p>
            <p className="text-xs text-[var(--color-text-muted)]">Keep swiping — your match is waiting</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectMatch?.(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 ${
                  selectedMatchId === item.id
                    ? "border-[var(--color-accent)] bg-gradient-to-r from-[color-mix(in_oklab,var(--color-accent)_6%,var(--color-surface))] to-[var(--color-surface)] shadow-[0_4px_14px_rgba(255,79,122,0.15)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-accent)] hover:shadow-[0_4px_14px_rgba(255,79,122,0.1)]"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={getProfileImage(item.otherUser.photos[0], item.otherUser.firstName, 140, 50)}
                    alt={item.otherUser.firstName}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                    loading="lazy"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--color-text)] truncate">
                      {item.otherUser.firstName}, {item.otherUser.age}
                    </p>
                    {item.otherUser.verified && (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-emerald-500" fill="currentColor">
                        <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.5 9.44 5.28 8.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{item.otherUser.city}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`rounded-full px-2 py-px text-[10px] font-bold uppercase tracking-wide ${
                      item.otherUser.membershipTier === "diamond" ? "bg-cyan-400/20 text-cyan-700"
                      : item.otherUser.membershipTier === "gold" ? "bg-amber-400/20 text-amber-800"
                      : item.otherUser.membershipTier === "platinum" ? "bg-orange-300/20 text-orange-800"
                      : item.otherUser.membershipTier === "silver" ? "bg-slate-300/20 text-slate-700"
                      : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}>
                      {(item.otherUser.membershipTier ?? "free").toUpperCase()}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">· Matched {new Date(item.matchedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {item.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full romance-gradient px-1.5 text-[10px] font-bold text-white badge-pulse">
                    {item.unreadCount}
                  </span>
                )}
                <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
