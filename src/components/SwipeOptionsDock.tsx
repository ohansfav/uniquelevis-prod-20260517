type SwipeOption = "for-you" | "nearby" | "passport" | "boost";

type Props = {
  active: SwipeOption;
  onChange: (option: SwipeOption) => void;
};

const options: Array<{ id: SwipeOption; label: string; icon: React.ReactNode }> = [
  { id: "for-you", label: "For You", icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>
  )},
  { id: "nearby", label: "Nearby", icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><path d="M2 12h20"/></svg>
  )},
  { id: "passport", label: "Passport", icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4"/></svg>
  )},
  { id: "boost", label: "Boost", icon: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  )},
];

export default function SwipeOptionsDock({ active, onChange }: Props) {
  return (
    <nav className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_14px_24px_rgba(27,23,48,0.1)]">
      <ul className="grid grid-cols-4">
        {options.map((option) => {
          const isActive = option.id === active;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onChange(option.id)}
                className={`flex w-full flex-col items-center gap-1 px-2 py-3 text-center text-[11px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "romance-gradient text-white shadow-[0_8px_14px_rgba(255,79,122,0.35)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
                }`}
              >
                <span className={isActive ? "text-white" : "text-[var(--color-text-muted)]"}>{option.icon}</span>
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
