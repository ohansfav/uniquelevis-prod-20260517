type SwipeOption = "for-you" | "nearby" | "passport" | "boost";

type Props = {
  active: SwipeOption;
  onChange: (option: SwipeOption) => void;
};

const options: Array<{ id: SwipeOption; label: string; icon: string }> = [
  { id: "for-you", label: "For You", icon: "✨" },
  { id: "nearby", label: "Nearby", icon: "📍" },
  { id: "passport", label: "Passport", icon: "🧭" },
  { id: "boost", label: "Boost", icon: "⚡" },
];

export default function SwipeOptionsDock({ active, onChange }: Props) {
  return (
    <nav className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2 shadow-[0_14px_24px_rgba(27,23,48,0.1)]">
      <ul className="grid grid-cols-4 gap-2">
        {options.map((option) => {
          const isActive = option.id === active;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onChange(option.id)}
                className={`w-full rounded-xl px-2 py-2 text-center text-[11px] font-semibold transition ${
                  isActive
                    ? "romance-gradient text-white shadow-[0_8px_14px_rgba(255,79,122,0.35)]"
                    : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                }`}
              >
                <span className="mb-1 block text-base leading-none">{option.icon}</span>
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
