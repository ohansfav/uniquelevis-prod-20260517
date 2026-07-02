type FilterState = {
  distance: string;
  ageRange: string;
  intent: "Serious" | "Long-term" | "Open" | "Casual" | "All";
  verifiedOnly: boolean;
};

type Props = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
};

const presets = ["Any", "1 mi", "5 mi", "10 mi", "Passport"];
const intents: Array<{ id: FilterState["intent"]; label: string; emoji: string }> = [
  { id: "All", label: "All", emoji: "✨" },
  { id: "Serious", label: "Serious", emoji: "❤️" },
  { id: "Long-term", label: "Long-term", emoji: "💑" },
  { id: "Open", label: "Open", emoji: "🔥" },
  { id: "Casual", label: "Casual", emoji: "🎉" },
];

export default function SwipeFilterDrawer({ filters, onChange }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_14px_24px_rgba(27,23,48,0.1)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <div>
          <h3 className="text-base font-bold text-[var(--color-primary)]">Quick Filters</h3>
          <p className="text-[11px] text-[var(--color-text-muted)]">Tune the stack before you swipe</p>
        </div>
        <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Fast</span>
      </div>
      <div className="p-4 grid gap-4 md:grid-cols-2">
        <Field label="Distance">
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ ...filters, distance: preset })}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  filters.distance === preset
                    ? "romance-gradient border-transparent text-white shadow-[0_4px_10px_rgba(255,79,122,0.3)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/40"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Age Range">
          <input
            className="input"
            value={filters.ageRange}
            onChange={(e) => onChange({ ...filters, ageRange: e.target.value })}
            placeholder="e.g. 21-28"
          />
        </Field>

        <Field label="Dating Intent">
          <div className="flex flex-wrap gap-2">
            {intents.map((intent) => (
              <button
                key={intent.id}
                type="button"
                onClick={() => onChange({ ...filters, intent: intent.id })}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  filters.intent === intent.id
                    ? "romance-gradient border-transparent text-white shadow-[0_4px_10px_rgba(255,79,122,0.3)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]/40"
                }`}
              >
                <span>{intent.emoji}</span>
                {intent.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Verified Only">
          <button
            type="button"
            onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              filters.verifiedOnly
                ? "border-[var(--color-accent)] bg-gradient-to-r from-[color-mix(in_oklab,var(--color-accent)_8%,var(--color-surface))] to-[var(--color-surface)] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 16 16" className={`h-4 w-4 ${filters.verifiedOnly ? "text-emerald-500" : "text-[var(--color-text-muted)]"}`} fill="currentColor">
                <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.5 9.44 5.28 8.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd"/>
              </svg>
              Only verified profiles
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${filters.verifiedOnly ? "romance-gradient text-white" : "bg-[var(--color-border)]"}`}>
              {filters.verifiedOnly ? "ON" : "OFF"}
            </span>
          </button>
        </Field>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{label}</span>
      {children}
    </label>
  );
}
