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

export default function SwipeFilterDrawer({ filters, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-[0_14px_24px_rgba(27,23,48,0.1)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-primary)]">Quick Filters</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Tune the stack before you swipe.</p>
        </div>
        <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]">Fast</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Distance">
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ ...filters, distance: preset })}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  filters.distance === preset
                    ? "romance-gradient text-white"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Age range">
          <input
            className="input"
            value={filters.ageRange}
            onChange={(e) => onChange({ ...filters, ageRange: e.target.value })}
            placeholder="21-28"
          />
        </Field>

        <Field label="Intent">
          <select
            className="input"
            value={filters.intent}
            onChange={(e) => {
              const nextIntent = e.target.value as FilterState["intent"];
              onChange({ ...filters, intent: nextIntent });
            }}
          >
            <option>Serious</option>
            <option>Long-term</option>
            <option>Open</option>
            <option>Casual</option>
            <option>All</option>
          </select>
        </Field>

        <Field label="Verified only">
          <button
            type="button"
            onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              filters.verifiedOnly
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
            }`}
          >
            <span>Only show verified profiles</span>
            <span>{filters.verifiedOnly ? "On" : "Off"}</span>
          </button>
        </Field>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{label}</span>
      {children}
    </label>
  );
}