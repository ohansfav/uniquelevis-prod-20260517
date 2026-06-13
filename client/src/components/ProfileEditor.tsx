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
  const photoFileRef = useRef<HTMLInputElement | null>(null);
  const verifyFileRef = useRef<HTMLInputElement | null>(null);

  // Sync photos and bio if a different profile is loaded (e.g. after save)
  useEffect(() => {
    setPhotos(profile?.photos ?? []);
    setBioValue(profile?.bio ?? "");
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhotoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    void fileToOptimizedDataUrl(file, { maxBytes: 900 * 1024 })
      .then((result) => {
        setPhotos((prev) => [...prev, result].slice(0, 6));
      })
      .catch((uploadError) => {
        const message = uploadError instanceof Error ? uploadError.message : "Could not read image file. Try another one.";
        alert(message);
      });

    e.target.value = "";
  };

  const handleVerifyFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    void fileToOptimizedDataUrl(file, { maxBytes: 900 * 1024 })
      .then((result) => {
        setVerificationPhoto(result);
      })
      .catch((uploadError) => {
        const message = uploadError instanceof Error ? uploadError.message : "Could not read image file. Try another one.";
        alert(message);
      });

    e.target.value = "";
  };

  if (!profile) {
    return (
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-[0_20px_30px_rgba(0,0,0,0.06)]">
        <p className="text-sm text-[var(--color-text-muted)]">
          {isLoadingProfile ? "Loading your profile..." : "Login to edit your profile."}
        </p>
      </section>
    );
  }

  const submit = async (formData: FormData) => {
    const firstName = String(formData.get("firstName") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const bio = bioValue.trim();
    const age = Number(formData.get("age") ?? profile.age);
    const interestsRaw = String(formData.get("interests") ?? "");
    const pets = String(formData.get("pets") ?? profile.pets ?? "").trim();
    const drinking = String(formData.get("drinking") ?? profile.drinking ?? "").trim();
    const smoking = String(formData.get("smoking") ?? profile.smoking ?? "").trim();
    const workout = String(formData.get("workout") ?? profile.workout ?? "").trim();

    const interests = interestsRaw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 15);

    await onSave({
      firstName: firstName || profile.firstName,
      city: city || profile.city,
      bio: bio || profile.bio,
      age,
      interests,
      photos: photos.length > 0 ? photos : profile.photos,
      pets: pets || profile.pets,
      drinking: drinking || profile.drinking,
      smoking: smoking || profile.smoking,
      workout: workout || profile.workout,
    });
  };

  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-[0_20px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-primary)]">Edit Profile</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Build the parts people actually notice.</p>
        </div>
        <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSection("edit")}
            className={`rounded-full px-3 py-1 transition ${activeSection === "edit" ? "romance-gradient text-white" : "text-[var(--color-text-muted)]"}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("preview")}
            className={`rounded-full px-3 py-1 transition ${activeSection === "preview" ? "romance-gradient text-white" : "text-[var(--color-text-muted)]"}`}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Membership</p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-primary)]">
          {(profile.membershipTier ?? "free").toUpperCase()} {profile.verified ? "• Verified" : "• Not Verified"}
        </p>
      </div>

      {activeSection === "edit" ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(new FormData(event.currentTarget));
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            {/* Hidden file input for photo upload */}
            <input
              ref={photoFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoFile}
            />
            {Array.from({ length: 6 }).map((_, index) => {
              const photo = photos[index];
              return photo ? (
                <div key={index} className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-[11px] text-white transition hover:bg-black/80"
                    aria-label="Remove photo"
                  >✕</button>
                </div>
              ) : (
                <button
                  key={index}
                  type="button"
                  onClick={() => photoFileRef.current?.click()}
                  className="grid aspect-[3/4] place-items-center rounded-2xl border-2 border-dashed border-[var(--color-accent)]/50 bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-accent)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 active:scale-95"
                >
                  <span className="flex flex-col items-center gap-1">
                    <span className="text-2xl">📷</span>
                    <span>Add photo</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input className="input" name="firstName" defaultValue={profile.firstName} placeholder="First name" />
            <input className="input" name="age" defaultValue={profile.age} type="number" min={18} max={80} />
            <input className="input md:col-span-2" name="city" defaultValue={profile.city} placeholder="City" />
            <textarea className="input min-h-28 md:col-span-2" name="bio" value={bioValue} onChange={(e) => setBioValue(e.target.value)} placeholder="Bio" />
            <input className="input md:col-span-2" name="interests" defaultValue={profile.interests.join(", ")} placeholder="Interests separated by commas" />
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Prompt ideas</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {[
                "A surprising thing about me is...",
                "My ideal first date is...",
                "I'm overly competitive about...",
                "We should match if...",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setBioValue((prev) => (prev.trim() ? `${prev.trim()} ${prompt}` : prompt))}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-left text-sm text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Lifestyle</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {/* Pets */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Pets</p>
                <select name="pets" defaultValue={profile.pets ?? "none"} className="mt-1 w-full rounded-lg border p-2 text-sm">
                  <option value="none">No pets</option>
                  <option value="dog_person">Dog person</option>
                  <option value="cat_person">Cat person</option>
                  <option value="has_pet">Has pet</option>
                </select>
              </div>

              {/* Drinking */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Drinking</p>
                <select name="drinking" defaultValue={profile.drinking ?? "sometimes"} className="mt-1 w-full rounded-lg border p-2 text-sm">
                  <option value="never">Never</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="often">Often</option>
                </select>
              </div>

              {/* Smoking */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Smoking</p>
                <select name="smoking" defaultValue={profile.smoking ?? "non_smoker"} className="mt-1 w-full rounded-lg border p-2 text-sm">
                  <option value="non_smoker">Non-smoker</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="smoker">Smoker</option>
                </select>
              </div>

              {/* Workout */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Workout</p>
                <select name="workout" defaultValue={profile.workout ?? "often"} className="mt-1 w-full rounded-lg border p-2 text-sm">
                  <option value="never">Never</option>
                  <option value="rarely">Rarely</option>
                  <option value="often">Often</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="romance-gradient w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Save Profile
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getProfileImage(profile.photos[0], profile.firstName)} alt={`${profile.firstName} preview`} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white">
                <p className="text-xl font-semibold">{profile.firstName}, {profile.age}</p>
                <p className="text-sm text-white/80">{profile.city}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Bio</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">{profile.bio}</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Interests</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.interests.slice(0, 8).map((interest) => (
                  <span key={interest} className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Profile Verification</p>
        <p className="mt-1 text-sm text-[var(--color-primary)]">
          Status: <span className="font-semibold uppercase">{verificationStatus}</span>
        </p>
        {verificationStatus !== "approved" && (
          <div className="mt-3 space-y-2">
            {/* Hidden file input for verification photo */}
            <input ref={verifyFileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleVerifyFile} />
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={verificationPhoto}
                onChange={(e) => setVerificationPhoto(e.target.value)}
                placeholder="Verification photo URL"
              />
              <button
                type="button"
                onClick={() => verifyFileRef.current?.click()}
                className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
              >
                📷 Upload
              </button>
            </div>
            {verificationPhoto && verificationPhoto.startsWith("data:") && (
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[var(--color-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={verificationPhoto} alt="Verification preview" className="h-full w-full object-cover" />
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (!verificationPhoto.trim() || !onRequestVerification) return;
                void onRequestVerification(verificationPhoto.trim());
                setVerificationPhoto("");
              }}
              className="rounded-full border border-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              Submit For Admin Review
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
