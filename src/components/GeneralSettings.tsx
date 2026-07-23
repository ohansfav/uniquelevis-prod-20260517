import type { ThemeMode } from "@/lib/theme";

type Props = {
  themeMode: ThemeMode;
  onChangeThemeMode: (mode: ThemeMode) => void;
};

const options: Array<{ id: ThemeMode; label: string; description: string; icon: React.ReactNode }> = [
  {
    id: "light",
    label: "Light",
    description: "Bright look",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    ),
  },
  {
    id: "dark",
    label: "Dark",
    description: "Low-light look",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
    ),
  },
  {
    id: "system",
    label: "System",
    description: "Follow device",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
    ),
  },
];

export default function GeneralSettings({ themeMode, onChangeThemeMode }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h3 className="text-lg font-bold text-[var(--color-primary)]">Settings</h3>
        <p className="text-[11px] text-[var(--color-text-muted)]">Appearance and preferences</p>
      </div>
      <div className="p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Theme</p>
        <div className="grid grid-cols-3 gap-2">
          {options.map((option) => {
            const active = option.id === themeMode;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChangeThemeMode(option.id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-center transition-all duration-200 ${
                  active
                    ? "border-[var(--color-accent)] bg-gradient-to-br from-[color-mix(in_oklab,var(--color-accent)_8%,var(--color-surface))] to-[var(--color-surface)] text-[var(--color-primary)] shadow-[0_4px_14px_rgba(255,79,122,0.15)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/40"
                }`}
              >
                <span className={active ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}>
                  {option.icon}
                </span>
                <p className="text-xs font-bold">{option.label}</p>
                <p className="text-[10px] opacity-70">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
