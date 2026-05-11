type MobileTab = "discover" | "matches" | "messages" | "profile";

type Props = {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
};

const tabs: Array<{ id: MobileTab; label: string; icon: string }> = [
  { id: "discover", label: "Discover", icon: "🔥" },
  { id: "matches", label: "Matches", icon: "💘" },
  { id: "messages", label: "Chats", icon: "💬" },
  { id: "profile", label: "Profile", icon: "✨" },
];

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/50 bg-white/85 p-2 shadow-[0_18px_36px_rgba(27,23,48,0.2)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={`flex w-full flex-col items-center rounded-xl px-1 py-2 text-[11px] font-semibold transition ${
                  isActive
                    ? "romance-gradient text-white shadow-[0_10px_18px_rgba(255,79,122,0.38)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span className="mt-1 leading-none">{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
