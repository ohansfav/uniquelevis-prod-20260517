"use client";

import { useEffect, useState } from "react";
import {
  adminLogin,
  approveVerificationByAdmin,
  getHumanCheckChallenge,
  getBillingConfig,
  getAdminStats,
  getAdminUsers,
  getPendingVerifications,
  rejectVerificationByAdmin,
  runAdminBillingTestUpgrade,
  updateUserTierByAdmin,
} from "@/lib/api";
import { getProfileImage } from "@/lib/image";
import type { AdminStats, AdminUser, MembershipTier, PaidMembershipTier, VerificationRequest } from "@/lib/types";

const tiers: MembershipTier[] = ["free", "platinum", "silver", "gold", "diamond"];

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pending, setPending] = useState<VerificationRequest[]>([]);
  const [billingConfig, setBillingConfig] = useState<{
    provider: "paystack" | "opay";
    checkoutConfigured: boolean;
    webhookConfigured: boolean;
    publicKeyConfigured: boolean;
    planAmounts: { platinum: number; silver: number; gold: number; diamond: number };
    providers?: {
      paystack: { checkoutConfigured: boolean; missing: string[] };
      opay: { checkoutConfigured: boolean; missing: string[] };
    };
    missing: string[];
  } | null>(null);
  const [billingTestUserId, setBillingTestUserId] = useState("");
  const [billingTestTier, setBillingTestTier] = useState<PaidMembershipTier>("platinum");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("God Eyes online. Track users, tiers, and verification decisions.");
  const [humanPrompt, setHumanPrompt] = useState("");
  const [humanChallengeId, setHumanChallengeId] = useState("");
  const [humanAnswer, setHumanAnswer] = useState("");

  useEffect(() => {
    if (token) return;

    let mounted = true;
    void getHumanCheckChallenge()
      .then((challenge) => {
        if (!mounted) return;
        setHumanPrompt(challenge.prompt);
        setHumanChallengeId(challenge.challengeId);
        setHumanAnswer("");
      })
      .catch(() => {
        if (!mounted) return;
        setHumanPrompt("5 + 3 = ?");
        setHumanChallengeId("");
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const loadAdminData = async (accessToken: string) => {
    const [nextStats, nextUsers, nextPending, nextBillingConfig] = await Promise.all([
      getAdminStats(accessToken),
      getAdminUsers(accessToken),
      getPendingVerifications(accessToken),
      getBillingConfig(),
    ]);

    setStats(nextStats);
    setUsers(nextUsers);
    setPending(nextPending);
    setBillingConfig(nextBillingConfig);
    if (!billingTestUserId && nextUsers.length > 0) {
      setBillingTestUserId(nextUsers[0].id);
    }
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    void loadAdminData(token)
      .catch(() => {
        setError("Could not load admin data. Make sure this account has admin rights.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleAdminLogin = async () => {
    setLoading(true);
    setError(null);

    if (!humanChallengeId) {
      setError("Human verification is still loading. Please wait and try again.");
      setLoading(false);
      return;
    }

    if (!humanAnswer.trim()) {
      setError("Please solve the human verification challenge.");
      setLoading(false);
      return;
    }

    try {
      const auth = await adminLogin(email, password, {
        challengeId: humanChallengeId,
        challengeAnswer: humanAnswer.trim(),
      });
      setToken(auth.accessToken);
      setMessage("Admin authenticated. Full system view unlocked.");
    } catch {
      setError("Admin login failed.");
      void getHumanCheckChallenge()
        .then((challenge) => {
          setHumanPrompt(challenge.prompt);
          setHumanChallengeId(challenge.challengeId);
          setHumanAnswer("");
        })
        .catch(() => {
          setHumanPrompt("5 + 3 = ?");
          setHumanChallengeId("");
        });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!token) return;
    await approveVerificationByAdmin(token, userId);
    await loadAdminData(token);
    setMessage("Verification approved and checkmark granted.");
  };

  const handleReject = async (userId: string) => {
    if (!token) return;
    await rejectVerificationByAdmin(token, userId);
    await loadAdminData(token);
    setMessage("Verification rejected.");
  };

  const handleTierChange = async (userId: string, tier: MembershipTier) => {
    if (!token) return;
    await updateUserTierByAdmin(token, userId, tier);
    await loadAdminData(token);
    setMessage(`Membership updated to ${tier.toUpperCase()}.`);
  };

  const handleRunBillingTest = async () => {
    if (!token || !billingTestUserId) return;
    await runAdminBillingTestUpgrade(token, billingTestUserId, billingTestTier);
    await loadAdminData(token);
    setMessage(`Billing simulation applied: ${billingTestTier.toUpperCase()} for selected user.`);
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#182c4f_0%,#0a1628_55%,#050c17_100%)] px-4 py-8 text-slate-100">
        <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-500/35 bg-[#0f1c31]/88 p-6 shadow-[0_26px_44px_rgba(0,0,0,0.45)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Unique Levi's Admin</p>
          <h1 className="mt-2 text-3xl text-slate-100">God Eyes Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">Approve profile photos, grant verified checkmarks, and control membership tiers.</p>

          <div className="mt-5 space-y-3">
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Admin email"
            />
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Admin password"
            />
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white/85">Human Verification</span>
              <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                Solve: {humanPrompt || "Loading challenge..."}
              </div>
              <input
                className="input"
                value={humanAnswer}
                onChange={(e) => setHumanAnswer(e.target.value)}
                placeholder="Type the answer"
                inputMode="numeric"
              />
            </label>
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="romance-gradient w-full rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Enter Admin Dashboard"}
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#152746_0%,#0a1628_45%,#050c17_100%)] px-4 py-6 text-slate-100 md:px-6 md:py-8">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-500/30 bg-[#0f1c31]/88 p-5 shadow-[0_20px_34px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Admin Control</p>
          <h1 className="mt-1 text-3xl text-slate-100">God Eyes Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">{message}</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Users" value={stats?.totalUsers ?? 0} />
          <StatCard label="Pending Verifications" value={stats?.pendingVerifications ?? 0} />
          <StatCard label="Matches" value={stats?.totalMatches ?? 0} />
          <StatCard label="Messages" value={stats?.totalMessages ?? 0} />
          <StatCard label="Likes" value={stats?.totalLikes ?? 0} />
        </section>

        <section className="rounded-3xl border border-slate-500/30 bg-[#0f1c31]/88 p-5 shadow-[0_20px_34px_rgba(0,0,0,0.45)]">
          <h2 className="text-lg font-semibold text-slate-100">Billing Health</h2>
          <p className="mt-1 text-xs text-slate-300">Live readiness check plus simulated upgrade trigger. Active provider: {billingConfig?.provider?.toUpperCase() ?? "UNKNOWN"}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-3 py-1 font-semibold ${billingConfig?.checkoutConfigured ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
              Checkout {billingConfig?.checkoutConfigured ? "Ready" : "Not Ready"}
            </span>
            <span className={`rounded-full px-3 py-1 font-semibold ${billingConfig?.webhookConfigured ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
              Webhook {billingConfig?.webhookConfigured ? "Ready" : "Not Ready"}
            </span>
            <span className={`rounded-full px-3 py-1 font-semibold ${billingConfig?.publicKeyConfigured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              Public Key {billingConfig?.publicKeyConfigured ? "Set" : "Missing"}
            </span>
          </div>

          {billingConfig && billingConfig.missing.length > 0 && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Missing env vars: {billingConfig.missing.join(", ")}
            </p>
          )}

          <div className="mt-4 grid gap-2 md:grid-cols-[1.2fr_auto_auto_auto] md:items-center">
            <select
              className="input"
              value={billingTestUserId}
              onChange={(event) => setBillingTestUserId(event.target.value)}
            >
              <option value="">Select user for test upgrade</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} ({user.email})
                </option>
              ))}
            </select>
            <select
              className="input"
              value={billingTestTier}
              onChange={(event) => setBillingTestTier(event.target.value as PaidMembershipTier)}
            >
              <option value="platinum">Platinum</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="diamond">Diamond</option>
            </select>
            <button
              type="button"
              onClick={() => void handleRunBillingTest()}
              className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white"
            >
              Run Test Upgrade
            </button>
            <p className="text-[11px] text-slate-400">
              Amounts (kobo): P {billingConfig?.planAmounts.platinum ?? 0} / S {billingConfig?.planAmounts.silver ?? 0} / G {billingConfig?.planAmounts.gold ?? 0} / D {billingConfig?.planAmounts.diamond ?? 0}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
          <article className="rounded-3xl border border-slate-500/30 bg-[#0f1c31]/88 p-5 shadow-[0_20px_34px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-slate-100">Pending Verification Queue</h2>
            <div className="mt-4 space-y-3">
              {pending.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-500/40 bg-[#0b1629]/70 p-3 text-sm text-slate-300">
                  No pending verification requests.
                </p>
              ) : (
                pending.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-500/35 bg-[#0b1629]/70 p-3">
                    <p className="font-semibold text-slate-100">{item.firstName}</p>
                    <p className="text-xs text-slate-300">{item.email} • {item.city}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <img
                        src={getProfileImage(item.pendingVerificationPhoto ?? item.currentPhotos[0], item.firstName)}
                        alt="Pending verification"
                        className="h-24 w-full rounded-xl object-cover"
                      />
                      <img
                        src={getProfileImage(item.currentPhotos[0], item.firstName)}
                        alt="Current profile"
                        className="h-24 w-full rounded-xl object-cover"
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => void handleApprove(item.id)}
                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => void handleReject(item.id)}
                        className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-500/30 bg-[#0f1c31]/88 p-5 shadow-[0_20px_34px_rgba(0,0,0,0.45)]">
            <h2 className="text-lg font-semibold text-slate-100">All Users</h2>
            <div className="mt-4 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-slate-500/35 bg-[#0b1629]/70 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <img src={getProfileImage(user.photos[0], user.firstName, 96, 55)} alt={user.firstName} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-slate-100">{user.firstName}, {user.age}</p>
                      <p className="text-xs text-slate-300">{user.email} • {user.city}</p>
                    </div>
                    <span className="ml-auto rounded-full border border-slate-400/35 bg-[#13243d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-200">
                      {user.membershipTier}
                    </span>
                    {user.verified && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold text-emerald-800">
                        Verified ✓
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {tiers.map((tier) => (
                      <button
                        key={tier}
                        onClick={() => void handleTierChange(user.id, tier)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                          user.membershipTier === tier
                            ? "border-[#3f6cb8] bg-[#3f6cb8] text-white"
                            : "border-slate-500/45 text-slate-200"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-500/30 bg-[#0f1c31]/88 p-4 shadow-[0_18px_28px_rgba(0,0,0,0.45)]">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-100">{value}</p>
    </div>
  );
}
