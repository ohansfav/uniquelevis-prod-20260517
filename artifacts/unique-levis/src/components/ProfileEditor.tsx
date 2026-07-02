import { type ChangeEvent, useEffect, useRef, useState } from "react";
import type { PublicUser } from "@/lib/types";
import { fileToOptimizedDataUrl } from "@/lib/imageUpload";
import { getProfileImage } from "@/lib/image";

type Props = {
  profile: PublicUser | null;
  isLoadingProfile?: boolean;
  onSave: (input: Partial<PublicUser>) => Promise<void>;
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  onRequestVerification?: (photoUrl: string) => Promise<void>;
};

export default function ProfileEditor({
  profile,
  isLoadingProfile = false,
  onSave,
  verificationStatus = "none",
  onRequestVerification,
}: Props) {
  const [verificationPhoto, setVerificationPhoto] = useState("");
  const [activeSection, setActiveSection] = useState<"edit" | "preview">("edit");
  const [photos, setPhotos] = useState<string[]>(profile?.photos ?? []);
  const [bioValue, setBioValue] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const photoFileRef = useRef<HTMLInputElement | null>(null);
  const verifyFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPhotos(profile?.photos ?? []);
    setBioValue(profile?.bio ?? "");
  }, [profile?.id]);

  const handlePhotoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void fileToOptimizedDataUrl(file, { maxBytes: 900 * 1024 })
      .then((result) => setPhotos((prev) => [...prev, result].slice(0, 6)))
      .catch((err: Error) => alert(err.message));
    e.target.value = "";
  };

  const handleVerifyFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void fileToOptimizedDataUrl(file, { maxBytes: 900 * 1024 })
      .then((result) => setVerificationPhoto(result))
      .catch((err: Error) => alert(err.message));
    e.target.value = "";
  };

  if (!profile) {
    return (
      <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-8 text-center shadow-[0_20px_30px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)]">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--color-text-muted)]">
          {isLoadingProfile ? "Loading your profile..." : "Login to edit your profile."}
        </p>
      </section>
    );
  }

  const submit = async (formData: FormData) => {
    setSaving(true);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const age = Number(formData.get("age") ?? profile.age);
    const interestsRaw = String(formData.get("interests") ?? "");
    const interests = interestsRaw.split(",").map((i) => i.trim()).filter(Boolean).slice(0, 15);
    await onSave({
      firstName: firstName || profile.firstName,
      city: city || profile.city,
      bio: bioValue.trim() || profile.bio,
      age,
      interests,
      photos: photos.length > 0 ? photos : profile.photos,
      pets: String(formData.get("pets") ?? profile.pets ?? ""),
      drinking: String(formData.get("drinking") ?? profile.drinking ?? ""),
      smoking: String(formData.get("smoking") ?? profile.smoking ?? ""),
      workout: String(formData.get("workout") ?? profile.workout ?? ""),
    });
    setSaving(false);
  };

  const tierColors: Record<string, string> = {
    diamond: "text-cyan-600 bg-cyan-50 border-cyan-200",
    gold: "text-amber-700 bg-amber-50 border-amber-200",
    platinum: "text-orange-700 bg-orange-50 border-orange-200",
    silver: "text-slate-700 bg-slate-50 border-slate-200",
    free: "text-gray-600 bg-gray-50 border-gray-200",
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_20px_30px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-primary)]">Edit Profile</h3>
          <p className="text-[11px] text-[var(--color-text-muted)]">Build the parts people notice</p>
        </div>
        <div className="flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
          <button
            type="button"
            onClick={() => setActiveSection("edit")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeSection === "edit" ? "romance-gradient text-white shadow-sm" : "text-[var(--color-text-muted)]"}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("preview")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeSection === "preview" ? "romance-gradient text-white shadow-sm" : "text-[var(--color-text-muted)]"}`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Tier badge */}
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold uppercase tracking-wide" style={{ background: "color-mix(in oklab, var(--color-surface) 80%, transparent)" }}>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${tierColors[profile.membershipTier ?? "free"] ?? tierColors.free}`}>
          {(profile.membershipTier ?? "FREE").toUpperCase()}
        </span>
        {profile.verified ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor"><path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.5 9.44 5.28 8.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd"/></svg>
            Verified
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">Not verified</span>
        )}
      </div>

      <div className="p-5">
        {activeSection === "edit" ? (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void submit(new FormData(e.currentTarget)); }}>
            {/* Photo grid */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Photos</p>
              <input ref={photoFileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFile} />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => {
                  const photo = photos[i];
                  return photo ? (
                    <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--color-border)]">
                      <img src={photo} alt={`Photo ${i + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[11px] text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                      >✕</button>
                    </div>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      onClick={() => photoFileRef.current?.click()}
                      className="grid aspect-[3/4] place-items-center rounded-2xl border-2 border-dashed border-[var(--color-accent)]/40 bg-[var(--color-surface)] text-[var(--color-accent)] transition hover:border-[var(--color-accent)] hover:bg-[color-mix(in_oklab,var(--color-accent)_6%,var(--color-surface))] active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic info */}
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">First Name</label>
                  <input className="input" name="firstName" defaultValue={profile.firstName} placeholder="First name" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Age</label>
                  <input className="input" name="age" defaultValue={profile.age} type="number" min={18} max={80} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">City</label>
                <input className="input" name="city" defaultValue={profile.city} placeholder="City" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Bio</label>
                <textarea className="input min-h-28 resize-none" name="bio" value={bioValue} onChange={(e) => setBioValue(e.target.value)} placeholder="Something fun about you..." maxLength={280} />
                <div className="mt-1 flex justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span>{bioValue.length}/280</span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Interests (comma separated)</label>
                <input className="input" name="interests" defaultValue={profile.interests.join(", ")} placeholder="Travel, Music, Food..." />
              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Lifestyle</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Pets", name: "pets", val: profile.pets ?? "none", opts: [["none","No pets"],["dog_person","Dog person"],["cat_person","Cat person"],["has_pet","Has pet"]] },
                  { label: "Drinking", name: "drinking", val: profile.drinking ?? "sometimes", opts: [["never","Never"],["sometimes","Sometimes"],["often","Often"]] },
                  { label: "Smoking", name: "smoking", val: profile.smoking ?? "non_smoker", opts: [["non_smoker","Non-smoker"],["occasionally","Occasionally"],["smoker","Smoker"]] },
                  { label: "Workout", name: "workout", val: profile.workout ?? "often", opts: [["never","Never"],["rarely","Rarely"],["often","Often"]] },
                ].map((field) => (
                  <div key={field.name} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{field.label}</p>
                    <select name={field.name} defaultValue={field.val} className="input mt-1.5 w-full py-2.5">
                      {field.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl romance-gradient py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,79,122,0.4)] transition active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/></svg>
                  Saving...
                </span>
              ) : "Save Profile"}
            </button>
          </form>
        ) : (
          /* Preview */
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-[var(--color-border)]">
              <img src={getProfileImage(profile.photos[0], profile.firstName)} alt="Preview" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5">
                <p className="text-2xl font-black text-white">{profile.firstName}, {profile.age}</p>
                <p className="text-sm text-white/80">{profile.city}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.interests.slice(0, 5).map((i) => (
                    <span key={i} className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">{i}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Bio</p>
                <p className="mt-1 text-sm text-[var(--color-text)]">{profile.bio || "No bio yet"}</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">Interests</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.interests.map((i) => (
                    <span key={i} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--color-primary)]">{i}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification */}
        <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 16 16" className={`h-5 w-5 ${verificationStatus === "approved" ? "text-emerald-500" : "text-[var(--color-text-muted)]"}`} fill="currentColor">
              <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.5 9.44 5.28 8.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm font-bold text-[var(--color-primary)]">Profile Verification</p>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Status: <span className="font-bold uppercase text-[var(--color-primary)]">{verificationStatus}</span>
          </p>
          {verificationStatus !== "approved" && (
            <div className="mt-3 space-y-2">
              <input ref={verifyFileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleVerifyFile} />
              <div className="flex gap-2">
                <input className="input flex-1" value={verificationPhoto} onChange={(e) => setVerificationPhoto(e.target.value)} placeholder="Verification photo URL" />
                <button type="button" onClick={() => verifyFileRef.current?.click()} className="shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </button>
              </div>
              {verificationPhoto.startsWith("data:") && (
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[var(--color-border)]">
                  <img src={verificationPhoto} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <button
                type="button"
                onClick={() => { if (verificationPhoto.trim() && onRequestVerification) { void onRequestVerification(verificationPhoto.trim()); setVerificationPhoto(""); } }}
                className="rounded-full border border-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
              >
                Submit for Review
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
