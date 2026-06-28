type MobileTab = "swipe" | "explore" | "likes" | "chat" | "profile";

type Props = {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  likesCount: number;
};

const FlameIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill={active ? "white" : "currentColor"}>
    <path d="M12 2C9 6 7 8.5 7 11c0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.5-2-5-5-9zm0 13a3 3 0 01-3-3c0-1.5 1-3 2-4.5C12 9 13 10.5 13 12a1 1 0 01-1 1z" opacity={active ? 1 : 0.7}/>
    <path d="M17.5 12c0 3.03-2.47 5.5-5.5 5.5S6.5 15.03 6.5 12c0-1.68.55-3.2 1.5-4.5v.5c0 2.48 2.01 4.5 4.5 4.5s4.5-2.02 4.5-4.5c0-.17-.01-.34-.03-.5.7 1.28 1.03 2.6 1.03 4z" opacity={0.35}/>
  </svg>
);

const CompassIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill={active ? "white" : "currentColor"} opacity={active ? 0.9 : 0.7}/>
  </svg>
);

const HeartIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill={active ? "white" : "currentColor"}>
    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.199 3.539 1 6.5 1c1.898 0 3.698.798 5.5 2.6C13.802 1.798 15.602 1 17.5 1 20.461 1 23 3.199 23 7.191c0 4.105-5.37 8.863-11 14.402z" opacity={active ? 1 : 0.7}/>
  </svg>
);

const ChatIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill={active ? "white" : "currentColor"}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" opacity={active ? 1 : 0.7}/>
  </svg>
);

const PersonIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill={active ? "white" : "currentColor"}>
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" opacity={active ? 1 : 0.7}/>
  </svg>
);

const icons: Record<MobileTab, (active: boolean) => React.ReactNode> = {
  swipe:   (a) => <FlameIcon active={a} />,
  explore: (a) => <CompassIcon active={a} />,
  likes:   (a) => <HeartIcon active={a} />,
  chat:    (a) => <ChatIcon active={a} />,
  profile: (a) => <PersonIcon active={a} />,
};

const labels: Record<MobileTab, string> = {
  swipe:   "Discover",
  explore: "Explore",
  likes:   "Likes",
  chat:    "Chat",
  profile: "Profile",
};

export default function BottomNav({ activeTab, onTabChange, likesCount }: Props) {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-[0_20px_40px_rgba(27,23,48,0.22)] backdrop-blur-xl md:hidden"
      style={{ background: "color-mix(in oklab, var(--color-surface-elevated) 88%, transparent)" }}
    >
      <ul className="flex h-16">
        {(["swipe", "explore", "likes", "chat", "profile"] as MobileTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <li key={tab} className="flex-1">
              <button
                onClick={() => onTabChange(tab)}
                className={`relative flex h-full w-full flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                  isActive ? "text-white" : "text-[var(--color-text-muted)]"
                }`}
              >
                {/* Active background pill */}
                {isActive && (
                  <span className="absolute inset-x-1.5 inset-y-1.5 rounded-xl romance-gradient shadow-[0_6px_16px_rgba(255,79,122,0.45)]" />
                )}

                <span className="relative z-10">{icons[tab](isActive)}</span>

                {/* Likes badge */}
                {tab === "likes" && likesCount > 0 && (
                  <span
                    className={`absolute right-2 top-2 flex min-w-[18px] items-center justify-center rounded-full px-1 py-px text-[9px] font-bold ${
                      isActive
                        ? "bg-white text-[var(--color-accent)]"
                        : "romance-gradient text-white"
                    } badge-pulse`}
                  >
                    {likesCount > 99 ? "99+" : likesCount}
                  </span>
                )}

                <span className="relative z-10 text-[10px] font-semibold leading-none">
                  {labels[tab]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
