import type { MatchItem } from "@/lib/types";
import { getProfileImage } from "@/lib/image";

type Props = {
  matches: MatchItem[];
  selectedMatchId?: string | null;
  onSelectMatch?: (matchId: string) => void;
};

export default function MatchesPanel({ matches, selectedMatchId, onSelectMatch }: Props) {
  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-primary)]">Your Matches</h3>
        <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
          {matches.length}
        </span>
      </div>

      <div className="space-y-3">
        {matches.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-muted)]">
            No matches yet. Keep swiping to unlock conversations.
          </p>
        ) : (
          matches.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectMatch?.(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                selectedMatchId === item.id
                  ? "border-[var(--color-accent)] bg-[var(--color-surface)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-accent)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getProfileImage(item.otherUser.photos[0], item.otherUser.firstName, 140, 50)}
                alt={item.otherUser.firstName}
                className="h-12 w-12 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  {item.otherUser.firstName}, {item.otherUser.age}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{item.otherUser.city}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
                    {(item.otherUser.membershipTier ?? "free").toUpperCase()}
                  </span>
                  {item.otherUser.verified && (
                    <span className="text-[10px] font-semibold text-emerald-700">Verified ✓</span>
                  )}
                </div>
              </div>
              {item.unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-[var(--color-accent)] px-2 py-1 text-[10px] font-bold text-white">
                  {item.unreadCount}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </section>
  );
}
