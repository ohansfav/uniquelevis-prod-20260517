"use client";
import { useRef, useState, type ChangeEvent } from "react";
import type { PublicUser } from "../lib/types";
import { updateMyProfile } from "../lib/api";

const INTERESTS = [
  "Travel", "Music", "Food & Dining", "Fitness", "Photography", "Art",
  "Gaming", "Movies & TV", "Books", "Coffee", "Beach", "Hiking",
  "Cooking", "Fashion", "Yoga", "Sports", "Pets", "Nature",
  "Dancing", "Technology", "Cars", "Writing", "Business", "Design",
];

const PRESET_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=280&q=50", label: "Sofia" },
  { url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=280&q=50", label: "Zara" },
  { url: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=280&q=50", label: "Chioma" },
  { url: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?auto=format&fit=crop&w=280&q=50", label: "Amara" },
  { url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=280&q=50", label: "Tolu" },
  { url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=280&q=50", label: "Ngozi" },
  { url: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=280&q=50", label: "Noah" },
  { url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=280&q=50", label: "Chidi" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=280&q=50", label: "Emeka" },
  { url: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&w=280&q=50", label: "Seun" },
];

type Step = 1 | 2 | 3 | 4;

interface Props {
  token: string;
  profile: PublicUser;
  onComplete: (updated: PublicUser) => void;
}

export default function OnboardingFlow({ token, profile, onComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [selectedPhoto, setSelectedPhoto] = useState<string>(profile.photos[0] ?? "");
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
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoToUse = customUrl.trim() || selectedPhoto;

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 10 ? [...prev, tag] : prev
    );
  };

  const onPhotoFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoUploadError("Please select an image file.");
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setPhotoUploadError("Image is too large. Please use a file up to 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setPhotoUploadError("Could not read image file. Try another photo.");
        return;
      }
      setPhotoUploadError(null);
      setCustomUrl(result);
      setSelectedPhoto("");
    };
    reader.onerror = () => {
      setPhotoUploadError("Could not read image file. Try another photo.");
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const canProceed = (): boolean => {
    if (step === 1) return photoToUse.length > 0;
    if (step === 2) return bio.trim().length >= 10 && interests.length >= 1;
    if (step === 3) return true;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateMyProfile(token, {
        photos: [photoToUse],
        bio: bio.trim(),
        interests,
        gender,
        lookingFor,
      });
      onComplete(updated);
    } catch {
      setError("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const TOTAL_STEPS = 3;
  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-start overflow-y-auto bg-[#0e0c17]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,79,122,0.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(116,93,190,0.15),transparent_50%)]" />

      <div className="relative w-full max-w-lg px-4 py-8">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2">
          <span className="romance-gradient grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white">❤</span>
          <span className="bg-gradient-to-r from-white via-[#ffe2ea] to-[#ffc9ba] bg-clip-text text-xl font-black tracking-tight text-transparent">
            Unique Levi&apos;s
          </span>
        </div>

        {/* Progress bar */}
        {step < 4 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Step {step} of {TOTAL_STEPS}
              </p>
              <p className="text-xs text-white/40">{Math.round(progress)}% complete</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full romance-gradient transition-all duration-500"
                style={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8">

          {/* ── Step 1: Photo ── */}
          {step === 1 && (
            <>
              <h2 className="mb-1 text-2xl font-black text-white">Add your photo</h2>
              <p className="mb-5 text-sm text-white/55">Pick one below or paste any image URL — this is what people will see first.</p>

              {/* Preview */}
              {photoToUse && (
                <div className="mb-4 flex justify-center">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#ff4f7a] shadow-[0_0_0_3px_rgba(255,79,122,0.25)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoToUse} alt="Your photo" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}

              {/* Grid of preset avatars */}
              <div className="mb-4 grid grid-cols-5 gap-2">
                {PRESET_PHOTOS.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => { setSelectedPhoto(p.url); setCustomUrl(""); }}
                    className={`relative h-14 w-full overflow-hidden rounded-xl border-2 transition ${
                      selectedPhoto === p.url && !customUrl
                        ? "border-[#ff4f7a] shadow-[0_0_0_2px_rgba(255,79,122,0.35)]"
                        : "border-white/15 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.label} className="h-full w-full object-cover" />
                    {selectedPhoto === p.url && !customUrl && (
                      <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4f7a] text-[8px] text-white">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <p className="mb-2 text-xs text-white/40 text-center">— or paste your own image URL —</p>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setSelectedPhoto("");
                  setPhotoUploadError(null);
                }}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#ff4f7a]"
              />

              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={onPhotoFileSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="mt-3 w-full rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/15"
              >
                Upload from device
              </button>
              {photoUploadError && <p className="mt-2 text-xs text-[#ff4f7a]">{photoUploadError}</p>}
            </>
          )}

          {/* ── Step 2: Bio + Interests ── */}
          {step === 2 && (
            <>
              <h2 className="mb-1 text-2xl font-black text-white">About you</h2>
              <p className="mb-5 text-sm text-white/55">A great bio gets 3× more matches. Keep it real.</p>

              <label className="mb-4 block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/50">Your bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={300}
                  placeholder="Tell people what makes you uniquely you..."
                  className="w-full resize-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#ff4f7a]"
                />
                <span className={`block text-right text-xs mt-1 ${bio.length < 10 ? "text-[#ff4f7a]" : "text-white/30"}`}>
                  {bio.length < 10 ? `${10 - bio.length} more characters needed` : `${bio.length}/300`}
                </span>
              </label>

              <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-white/50">
                Your interests <span className="normal-case text-white/30">({interests.length} selected, up to 10)</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      interests.includes(tag)
                        ? "romance-gradient text-white shadow-[0_4px_10px_rgba(255,79,122,0.3)]"
                        : "border border-white/25 bg-white/8 text-white/70 hover:border-white/50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {interests.length === 0 && (
                <p className="mt-2 text-xs text-[#ff4f7a]">Pick at least 1 interest</p>
              )}
            </>
          )}

          {/* ── Step 3: Preferences ── */}
          {step === 3 && (
            <>
              <h2 className="mb-1 text-2xl font-black text-white">Your preferences</h2>
              <p className="mb-6 text-sm text-white/55">Help us find the right people for you.</p>

              <div className="mb-6">
                <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-white/50">I am a</span>
                <div className="grid grid-cols-3 gap-2">
                  {([["man", "👨", "Man"], ["woman", "👩", "Woman"], ["other", "🌈", "Other"]] as const).map(
                    ([val, emoji, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setGender(val)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-sm font-semibold transition ${
                          gender === val
                            ? "border-[#ff4f7a] bg-[#ff4f7a]/15 text-white"
                            : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
                        }`}
                      >
                        <span className="text-2xl">{emoji}</span>
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-white/50">I&apos;m looking for</span>
                <div className="grid grid-cols-3 gap-2">
                  {([["men", "👨", "Men"], ["women", "👩", "Women"], ["everyone", "💑", "Everyone"]] as const).map(
                    ([val, emoji, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLookingFor(val)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border py-4 text-sm font-semibold transition ${
                          lookingFor === val
                            ? "border-[#ff4f7a] bg-[#ff4f7a]/15 text-white"
                            : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
                        }`}
                      >
                        <span className="text-2xl">{emoji}</span>
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Step 4: All set ── */}
          {step === 4 && (
            <div className="text-center">
              <div className="romance-gradient mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full text-4xl shadow-[0_16px_32px_rgba(255,79,122,0.45)]">
                🎉
              </div>
              <h2 className="mb-2 text-3xl font-black text-white">You&apos;re all set!</h2>
              <p className="mb-6 text-sm text-white/55">
                Welcome to Unique Levi&apos;s, <span className="font-bold text-white">{profile.firstName}</span>. Your profile looks amazing — time to find your match.
              </p>

              {/* Profile preview card */}
              <div className="mx-auto mb-6 w-48 overflow-hidden rounded-3xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoToUse} alt="Your profile" className="h-64 w-full object-cover" />
                <div className="bg-gradient-to-t from-black/80 to-transparent p-3 text-left -mt-12 relative">
                  <p className="font-bold text-white">{profile.firstName}, {profile.age}</p>
                  <p className="text-xs text-white/70">{profile.city}</p>
                </div>
              </div>

              {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="romance-gradient w-full rounded-full py-3.5 text-base font-black text-white shadow-[0_12px_24px_rgba(255,79,122,0.4)] transition hover:brightness-105 disabled:opacity-60"
              >
                {saving ? "Saving your profile..." : "Start Swiping ❤"}
              </button>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 4 && (
            <div className="mt-6 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="rounded-full border border-white/20 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/12"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!canProceed()}
                className="romance-gradient flex-1 rounded-full py-2.5 text-sm font-bold text-white shadow-[0_8px_16px_rgba(255,79,122,0.3)] transition disabled:opacity-40"
              >
                {step === 3 ? "Preview Profile →" : "Continue →"}
              </button>
            </div>
          )}
        </div>

        {/* Step dots */}
        {step < 4 && (
          <div className="mt-5 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-6 bg-[#ff4f7a]" : s < step ? "w-3 bg-white/40" : "w-3 bg-white/15"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
