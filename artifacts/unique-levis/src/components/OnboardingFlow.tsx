import { useRef, useState, type ChangeEvent } from "react";
import type { PublicUser } from "../lib/types";
import { updateMyProfile } from "../lib/api";
import { fileToOptimizedDataUrl } from "../lib/imageUpload";

const INTERESTS = [
  "Travel", "Music", "Food & Dining", "Fitness", "Photography", "Art",
  "Gaming", "Movies & TV", "Books", "Coffee", "Beach", "Hiking",
  "Cooking", "Fashion", "Yoga", "Sports", "Pets", "Nature",
  "Dancing", "Technology", "Cars", "Writing", "Business", "Design",
];

const STEP_TITLES = ["", "Your Photos", "About You", "Preferences", "All Set!"];
const STEP_SUBS = ["", "Add at least one photo to get started", "Tell people who you are", "What are you looking for?", ""];

type Step = 1 | 2 | 3 | 4;

interface Props {
  token: string;
  profile: PublicUser;
  onComplete: (updated: PublicUser) => void;
}

export default function OnboardingFlow({ token, profile, onComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [customUrl, setCustomUrl] = useState("");
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [interests, setInterests] = useState<string[]>(profile.interests ?? []);
  const [gender, setGender] = useState<"man" | "woman" | "other">(
    (profile.gender as "man" | "woman" | "other") ?? "woman"
  );
  const [lookingFor, setLookingFor] = useState<"men" | "women" | "everyone">(
    (profile.lookingFor as "men" | "women" | "everyone") ?? "everyone"
  );
  const [datingIntent, setDatingIntent] = useState<"short-term" | "serious" | "long-term">(
    profile.datingIntent ?? "serious"
  );
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoToUse = customUrl.trim();

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 10 ? [...prev, tag] : prev
    );
  };

  const onPhotoFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void fileToOptimizedDataUrl(file, { maxBytes: 900 * 1024 })
      .then((result) => {
        setCustomUrl(result);
        setPhotoUploadError(null);
      })
      .catch((e: Error) => setPhotoUploadError(e.message));
  };

  const onSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const updates: Partial<PublicUser> = {
        bio: bio.trim() || undefined,
        interests,
        gender,
        lookingFor,
        datingIntent,
      };
      if (photoToUse) {
        updates.photos = [...(profile.photos ?? []), photoToUse].slice(0, 6);
      }
      const updated = await updateMyProfile(token, updates);
      onComplete(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const progressPct = ((step / 4) * 100);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#0e0c17]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2" style={{ paddingTop: "max(env(safe-area-inset-top),16px)" }}>
        <button
          type="button"
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          disabled={step === 1}
          className="text-sm font-semibold text-white/60 transition hover:text-white disabled:opacity-30"
        >
          Back
        </button>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "w-6 romance-gradient" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving || step < 4}
          className="text-sm font-bold text-[#ff4f7a] transition hover:text-[#ff8e53] disabled:opacity-30"
        >
          {saving ? "Saving..." : "Done"}
        </button>
      </div>

      <div className="mx-5 mb-2 h-0.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full romance-gradient transition-all duration-500" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Step title */}
      <div className="px-5 pt-2 pb-1">
        <h2 className="text-xl font-black text-white">{STEP_TITLES[step]}</h2>
        <p className="mt-0.5 text-xs text-white/50">{STEP_SUBS[step]}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {step === 1 && (
          <div className="animate-fade-in-up space-y-4 pt-2">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-3xl border-2 border-dashed border-white/20 bg-white/5">
              {photoToUse ? (
                <img src={photoToUse} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white/60">Add your best photo</p>
                  <p className="text-xs text-white/40">First impressions matter</p>
                </div>
              )}
            </div>
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoFileSelected}
            />
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="w-full rounded-2xl border border-white/20 bg-white/10 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98]"
            >
              {photoToUse ? "Change Photo" : "Upload from Gallery"}
            </button>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] text-white/30 uppercase tracking-wide">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <input
              type="url"
              placeholder="Paste an image URL"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ff4f7a] focus:ring-1 focus:ring-[#ff4f7a]/30"
            />
            {photoUploadError && (
              <p className="text-xs text-red-400">{photoUploadError}</p>
            )}
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!photoToUse}
              className="w-full rounded-2xl romance-gradient py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(255,79,122,0.35)] transition active:scale-[0.98] disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up space-y-4 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/50">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Something fun about you..."
              maxLength={280}
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ff4f7a] focus:ring-1 focus:ring-[#ff4f7a]/30"
            />
            <div className="flex justify-between text-[11px] text-white/40">
              <span>Keep it light and interesting</span>
              <span>{bio.length}/280</span>
            </div>

            <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-white/50">Interests (pick up to 10)</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {INTERESTS.map((tag) => {
                const active = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
                      active
                        ? "romance-gradient border-transparent text-white shadow-[0_4px_12px_rgba(255,79,122,0.4)]"
                        : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="mt-2 w-full rounded-2xl romance-gradient py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(255,79,122,0.35)] transition active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up space-y-5 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-white/50 mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(["woman", "man", "other"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`rounded-2xl border py-3 text-sm font-semibold capitalize transition ${
                      gender === g
                        ? "romance-gradient border-transparent text-white shadow-[0_4px_12px_rgba(255,79,122,0.35)]"
                        : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-white/50 mb-2">Looking For</label>
              <div className="grid grid-cols-3 gap-2">
                {(["men", "women", "everyone"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setLookingFor(g)}
                    className={`rounded-2xl border py-3 text-sm font-semibold capitalize transition ${
                      lookingFor === g
                        ? "romance-gradient border-transparent text-white shadow-[0_4px_12px_rgba(255,79,122,0.35)]"
                        : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-white/50 mb-2">Dating Intent</label>
              <div className="grid grid-cols-1 gap-2">
                {([
                  { id: "short-term" as const, label: "Short-term fun", emoji: "🔥" },
                  { id: "serious" as const, label: "Something serious", emoji: "❤️" },
                  { id: "long-term" as const, label: "Long-term partner", emoji: "💑" },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDatingIntent(opt.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      datingIntent === opt.id
                        ? "romance-gradient border-transparent text-white shadow-[0_4px_12px_rgba(255,79,122,0.35)]"
                        : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <div>
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-[11px] opacity-75">
                        {opt.id === "short-term" ? "Casual dates, no pressure" : opt.id === "serious" ? "Building something real" : "Looking for forever"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-full rounded-2xl romance-gradient py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(255,79,122,0.35)] transition active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up flex flex-col items-center gap-5 pt-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full romance-gradient shadow-[0_12px_32px_rgba(255,79,122,0.5)] animate-bounce-in">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white">You&apos;re All Set!</h3>
            <p className="max-w-xs text-sm text-white/60">
              Your profile looks great. Start swiping and find your match.
            </p>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="w-full max-w-xs rounded-2xl romance-gradient py-4 text-base font-bold text-white shadow-[0_12px_32px_rgba(255,79,122,0.45)] transition active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Start Swiping 🔥"
              )}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
