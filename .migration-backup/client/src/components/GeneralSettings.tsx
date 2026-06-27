import type { ThemeMode } from "@/lib/theme";

type Props = {
  themeMode: ThemeMode;
  onChangeThemeMode: (mode: ThemeMode) => void;
};

const options: Array<{ id: ThemeMode; label: string; description: string }> = [
  { id: "light", label: "Light", description: "Bright look" },
  { id: "dark", label: "Dark", description: "Low-light look" },
  { id: "system", label: "System", description: "Follow device" },
];

export default function GeneralSettings({ themeMode, onChangeThemeMode }: Props) {
  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      <h3 className="text-lg font-semibold text-[var(--color-primary)]">General Settings</h3>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">Theme mode</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {options.map((option) => {
          const active = option.id === themeMode;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChangeThemeMode(option.id)}
              className={`rounded-2xl border px-2 py-2 text-left transition ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
              }`}
            >
              <p className="text-xs font-semibold">{option.label}</p>
              <p className={`text-[10px] ${active ? "text-white/75" : "text-[var(--color-text-muted)]"}`}>{option.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
