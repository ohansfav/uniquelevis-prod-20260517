import { optimizeUnsplash } from "@/lib/image";
import type { DiscoverCard } from "@/lib/types";

export type ExploreLane = "short-term" | "serious" | "long-term";

type Props = {
  activeLane: ExploreLane;
  users: DiscoverCard[];
  onSelectLane: (lane: ExploreLane) => void;
};

const goalCards: Array<{
  id: ExploreLane;
  title: string;
  subtitle: string;
  stats: string;
  image: string;
  tint: string;
}> = [
  {
    id: "short-term",
    title: "Short-term fun",
    subtitle: "Find people with similar relationship goals",
    stats: "1K",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
    tint: "from-fuchsia-700/65 via-fuchsia-600/45 to-transparent",
  },
  {
    id: "serious",
    title: "Serious Dater",
    subtitle: "People ready for consistency",
    stats: "2K",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2",
    tint: "from-rose-700/70 via-orange-500/45 to-transparent",
  },
  {
    id: "long-term",
    title: "Long-term partner",
    subtitle: "Build deeper commitment",
    stats: "3K",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659",
    tint: "from-red-700/70 via-orange-500/50 to-transparent",
  },
];

export default function ExplorePanel({ activeLane, users, onSelectLane }: Props) {
  const visibleUsers = users.slice(0, 8);

  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-[0_20px_30px_rgba(27,23,48,0.1)] md:p-5">
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-[var(--color-primary)]">Explore</h3>
        <p className="text-xs text-[var(--color-text-muted)]">Goal-driven dating lanes for faster quality matches.</p>
      </div>

      <button
        type="button"
        onClick={() => onSelectLane(goalCards[0].id)}
        className={`relative mb-3 block h-52 w-full overflow-hidden rounded-2xl border transition md:h-64 ${
          activeLane === goalCards[0].id
            ? "border-[var(--color-accent)] shadow-[0_12px_24px_rgba(255,79,122,0.25)]"
            : "border-white/15"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={optimizeUnsplash(goalCards[0].image, 900, 58)}
          alt={goalCards[0].title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${goalCards[0].tint}`} />
        <div className="absolute left-4 right-4 top-4 flex justify-end">
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white">{goalCards[0].stats}</span>
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <p className="text-2xl font-semibold text-white">{goalCards[0].title}</p>
          <p className="text-xs text-white/75">{goalCards[0].subtitle}</p>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        {goalCards.slice(1).map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onSelectLane(item.id)}
            className={`relative h-52 overflow-hidden rounded-2xl border text-left transition md:h-56 ${
              activeLane === item.id
                ? "border-[var(--color-accent)] shadow-[0_10px_18px_rgba(255,79,122,0.25)]"
                : "border-white/15"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={optimizeUnsplash(item.image, 520, 58)}
              alt={item.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${item.tint}`} />
            <div className="absolute right-3 top-3">
              <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white">{item.stats}</span>
            </div>
            <div className="absolute inset-x-3 bottom-3">
              <p className="text-lg font-semibold text-white">{item.title}</p>
              <p className="text-[11px] text-white/75">{item.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
          People In This Lane
        </p>
        {visibleUsers.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            No profiles found in this category right now. Try another lane.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {visibleUsers.map((user) => (
              <span
                key={user.id}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]"
              >
                {user.firstName} - {user.city}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
