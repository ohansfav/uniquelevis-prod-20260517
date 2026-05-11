import { useState } from "react";
import type { PublicUser } from "@/lib/types";

type Props = {
  profile: PublicUser | null;
  onSave: (input: Partial<PublicUser>) => Promise<void>;
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  onRequestVerification?: (photoUrl: string) => Promise<void>;
};

export default function ProfileEditor({
  profile,
  onSave,
  verificationStatus = "none",
  onRequestVerification,
}: Props) {
  const [verificationPhoto, setVerificationPhoto] = useState("");

  if (!profile) {
    return (
      <section className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_20px_30px_rgba(0,0,0,0.06)]">
        <p className="text-sm text-[var(--color-text-muted)]">Login to edit your profile.</p>
      </section>
    );
  }

  const submit = async (formData: FormData) => {
    const firstName = String(formData.get("firstName") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const age = Number(formData.get("age") ?? profile.age);
    const interestsRaw = String(formData.get("interests") ?? "");

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
    });
  };

  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_20px_30px_rgba(0,0,0,0.06)]">
      <h3 className="mb-3 text-lg font-semibold text-[var(--color-primary)]">Edit Profile</h3>
      <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Membership</p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-primary)]">
          {(profile.membershipTier ?? "free").toUpperCase()} {profile.verified ? "• Verified" : "• Not Verified"}
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(new FormData(event.currentTarget));
          event.currentTarget.reset();
        }}
      >
        <input className="input" name="firstName" defaultValue={profile.firstName} placeholder="First name" />
        <input className="input" name="age" defaultValue={profile.age} type="number" min={18} max={80} />
        <input className="input" name="city" defaultValue={profile.city} placeholder="City" />
        <textarea
          className="input min-h-24"
          name="bio"
          defaultValue={profile.bio}
          placeholder="Bio"
        />
        <input
          className="input"
          name="interests"
          defaultValue={profile.interests.join(", ")}
          placeholder="Interests separated by commas"
        />
        <button
          type="submit"
          className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-2)]"
        >
          Save Profile
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">Profile Verification</p>
        <p className="mt-1 text-sm text-[var(--color-primary)]">
          Status: <span className="font-semibold uppercase">{verificationStatus}</span>
        </p>
        {verificationStatus !== "approved" && (
          <div className="mt-3 space-y-2">
            <input
              className="input"
              value={verificationPhoto}
              onChange={(e) => setVerificationPhoto(e.target.value)}
              placeholder="Verification photo URL"
            />
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
