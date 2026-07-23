import { useState } from "react";
import type { PublicUser } from "@/lib/types";

type Props = {
  profile: PublicUser | null;
};

const completionTasks = [
  { id: "photos", title: "Add at least 2 photos", hint: "Get up to 2x more likes", boost: "+14%", icon: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
  )},
  { id: "verify", title: "Get verified", hint: "Build trust quickly", boost: "+8%", icon: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
  )},
  { id: "bio", title: "Write a compelling bio", hint: "Stand out in search", boost: "+4%", icon: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  )},
];

export default function ProfileInsights({ profile }: Props) {
  if (!profile) return null;

  const completion = Math.min(100, 38 + Math.min(profile.interests.length, 10) * 4 + Math.min(profile.photos.length, 4) * 8 + (profile.verified ? 12 : 0));

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-primary)]">Profile Strength</h3>
            <p className="text-[11px] text-[var(--color-text-muted)]">Complete your profile to get seen</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full romance-gradient text-white font-bold text-sm shadow-[0_4px_12px_rgba(255,79,122,0.4)]">
            {completion}
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div className="h-full romance-gradient transition-all duration-700" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="p-4 space-y-2">
        {completionTasks.map((task) => {
          const done = (task.id === "photos" && profile.photos.length >= 2) ||
                       (task.id === "verify" && profile.verified) ||
                       (task.id === "bio" && (profile.bio?.length ?? 0) > 10);
          return (
            <div key={task.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${done ? "border-emerald-200 bg-emerald-50/30" : "border-[var(--color-border)] bg-[var(--color-surface)]"}`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${done ? "bg-emerald-500 text-white" : "bg-[var(--color-border)] text-[var(--color-text-muted)]"}`}>
                {done ? (
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" clipRule="evenodd"/></svg>
                ) : task.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${done ? "text-emerald-700" : "text-[var(--color-text)]"}`}>{task.title}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{task.hint}</p>
              </div>
              <span className={`text-xs font-bold ${done ? "text-emerald-600" : "text-[#ff4f7a]"}`}>{done ? "Done" : task.boost}</span>
            </div>
          );
        })}
      </div>

      <div className="mx-4 mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">Privacy</p>
        <div className="space-y-2">
          <ToggleRow label="Don't show my age" />
          <ToggleRow label="Don't show my distance" />
          <ToggleRow label="Hide profile from search" />
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
      className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2.5 transition hover:border-[var(--color-accent)]"
    >
      <span className="text-sm text-[var(--color-text)]">{label}</span>
      <span className={`relative inline-flex h-6 w-10 items-center rounded-full p-1 transition-colors ${enabled ? "romance-gradient" : "bg-slate-300/60"}`}>
        <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}
