import { useState } from "react";
import type { PublicUser } from "@/lib/types";

type Props = {
  profile: PublicUser | null;
};

const completionTasks = [
  { id: "photos", title: "Add at least 2 photos", hint: "Get up to 2x more likes", boost: "+14%" },
  { id: "verify", title: "Get verified", hint: "Build trust quickly", boost: "+8%" },
  { id: "job", title: "Add job title", hint: "Stand out in search", boost: "+4%" },
];

export default function ProfileInsights({ profile }: Props) {
  if (!profile) return null;

  const completion = Math.min(100, 48 + Math.min(profile.interests.length, 10) * 4 + Math.min(profile.photos.length, 4) * 6 + (profile.verified ? 12 : 0));

  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-primary)]">Profile Strength</h3>
        <span className="rounded-full bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">{completion}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div className="h-full romance-gradient" style={{ width: `${completion}%` }} />
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">Complete your profile to be seen by more people.</p>

      <div className="mt-4 space-y-2">
        {completionTasks.map((task) => (
          <div key={task.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{task.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{task.hint}</p>
              </div>
              <span className="text-xs font-bold text-[#ff4f7a]">{task.boost}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Control Your Profile</p>
        <div className="mt-2 space-y-2">
          <ToggleRow label="Don't show my age" />
          <ToggleRow label="Don't show my distance" />
        </div>
      </div>
    </section>
  );
}

function ToggleRow({ label }: { label: string }) {
  const [enabled, setEnabled] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setEnabled((p) => !p)}
      className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 transition hover:border-[var(--color-accent)]"
    >
      <span className="text-sm text-[var(--color-text)]">{label}</span>
      <span className={`relative inline-flex h-6 w-10 items-center rounded-full p-1 transition-colors ${enabled ? "romance-gradient" : "bg-slate-300/70"}`}>
        <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}
