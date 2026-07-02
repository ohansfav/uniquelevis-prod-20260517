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
  emoji: string;
  image: string;
  tint: string;
  borderTint: string;
}> = [
  {
    id: "short-term",
    title: "Short-term Fun",
    subtitle: "Casual dates, no pressure",
    emoji: "🔥",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
    tint: "from-fuchsia-600/80 via-fuchsia-500/50 to-transparent",
    borderTint: "border-fuchsia-500/40",
  },
  {
    id: "serious",
    title: "Something Serious",
    subtitle: "Building something real",
    emoji: "❤️",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2",
    tint: "from-rose-600/80 via-rose-500/50 to-transparent",
    borderTint: "border-rose-500/40",
  },
  {
    id: "long-term",
    title: "Long-term Partner",
    subtitle: "Looking for forever",
    emoji: "💑",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659",
    tint: "from-violet-600/80 via-violet-500/50 to-transparent",
    borderTint: "border-violet-500/40",
  },
];

export default function ExplorePanel({ activeLane, users, onSelectLane }: Props) {
  const visibleUsers = users.slice(0, 8);

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-primary)]">Explore</h3>
          <p className="text-[11px] text-[var(--color-text-muted)]">Find people who want the same thing</p>
        </div>
      </div>

      {/* Featured card */}
      <div className="p-4 space-y-3">
        <button
          type="button"
          onClick={() => onSelectLane(goalCards[0].id)}
          className={`group relative block h-52 w-full overflow-hidden rounded-2xl border-2 transition-all duration-300 md:h-60 ${
            activeLane === goalCards[0].id ? goalCards[0].borderTint + " shadow-[0_16px_40px_rgba(255,79,122,0.25)]" : "border-white/15 hover:border-white/30"
          }`}
        >
          <img
            src={optimizeUnsplash(goalCards[0].image, 900, 58)}
            alt={goalCards[0].title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${goalCards[0].tint}`} />
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {goalCards[0].emoji} {goalCards[0].title}
            </span>
          </div>
          <div className="absolute inset-x-4 bottom-4">
            <p className="text-lg font-bold text-white">{goalCards[0].subtitle}</p>
            <p className="text-[11px] text-white/70">{visibleUsers.filter(u => u.datingIntent === "short-term").length} people active</p>
          </div>
          {activeLane === goalCards[0].id && (
            <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg viewBox="0 0 16 16" className="h-4 w-4 text-white" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
              </svg>
            </div>
          )}
        </button>

        {/* Two smaller cards */}
        <div className="grid grid-cols-2 gap-3">
          {goalCards.slice(1).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectLane(item.id)}
              className={`group relative h-44 overflow-hidden rounded-2xl border-2 text-left transition-all duration-300 md:h-48 ${
                activeLane === item.id ? item.borderTint + " shadow-[0_12px_28px_rgba(255,79,122,0.2)]" : "border-white/15 hover:border-white/30"
              }`}
            >
              <img
                src={optimizeUnsplash(item.image, 520, 58)}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${item.tint}`} />
              <div className="absolute left-3 top-3">
                <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                  {item.emoji}
                </span>
              </div>
              <div className="absolute inset-x-3 bottom-3">
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="text-[10px] text-white/65">{item.subtitle}</p>
              </div>
              {activeLane === item.id && (
                <div className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Active lane users */}
        {visibleUsers.length > 0 && (
          <div className="mt-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[var(--color-accent)]">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
                  <path d="M8 9.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM4.5 13.5a4.5 4.5 0 019 0v.5h-9v-.5z"/>
                </svg>
              </span>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">People in this lane</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {visibleUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
                >
                  <span className="inline-block h-5 w-5 overflow-hidden rounded-full">
                    <img src={optimizeUnsplash(user.photos[0] ?? "", 40, 40)} alt="" className="h-full w-full object-cover" />
                  </span>
                  {user.firstName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
