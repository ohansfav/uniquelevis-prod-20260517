"use client";

import { useEffect, useState } from "react";
import {
  adminLogin,
  approveVerificationByAdmin,
  getAdminStats,
  getAdminUsers,
  getPendingVerifications,
  rejectVerificationByAdmin,
  updateUserTierByAdmin,
} from "@/lib/api";
import type { AdminStats, AdminUser, MembershipTier, VerificationRequest } from "@/lib/types";

const tiers: MembershipTier[] = ["free", "silver", "gold", "diamond"];

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pending, setPending] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("God Eyes online. Track users, tiers, and verification decisions.");

  const loadAdminData = async (accessToken: string) => {
    const [nextStats, nextUsers, nextPending] = await Promise.all([
      getAdminStats(accessToken),
      getAdminUsers(accessToken),
      getPendingVerifications(accessToken),
    ]);

    setStats(nextStats);
    setUsers(nextUsers);
    setPending(nextPending);
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
    try {
      const auth = await adminLogin(email, password);
      setToken(auth.accessToken);
      setMessage("Admin authenticated. Full system view unlocked.");
    } catch {
      setError("Admin login failed.");
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

  if (!token) {
    return (
      <main className="min-h-screen bg-[var(--color-primary)] px-4 py-8 text-white">
        <section className="mx-auto w-full max-w-md rounded-3xl border border-white/25 bg-white/10 p-6 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/85">Unique Levi's Admin</p>
          <h1 className="mt-2 text-3xl">God Eyes Dashboard</h1>
          <p className="mt-2 text-sm text-white/80">Approve profile photos, grant verified checkmarks, and control membership tiers.</p>

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
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="romance-gradient w-full rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Enter Admin Dashboard"}
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-rose-200">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-6 md:px-6 md:py-8">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/45 bg-white p-5 shadow-[0_18px_28px_rgba(0,0,0,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Admin Control</p>
          <h1 className="mt-1 text-3xl text-[var(--color-primary)]">God Eyes Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{message}</p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Users" value={stats?.totalUsers ?? 0} />
          <StatCard label="Pending Verifications" value={stats?.pendingVerifications ?? 0} />
          <StatCard label="Matches" value={stats?.totalMatches ?? 0} />
          <StatCard label="Messages" value={stats?.totalMessages ?? 0} />
          <StatCard label="Likes" value={stats?.totalLikes ?? 0} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
          <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[var(--color-primary)]">Pending Verification Queue</h2>
            <div className="mt-4 space-y-3">
              {pending.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-3 text-sm text-[var(--color-text-muted)]">
                  No pending verification requests.
                </p>
              ) : (
                pending.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[var(--color-border)] p-3">
                    <p className="font-semibold text-[var(--color-primary)]">{item.firstName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{item.email} • {item.city}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <img
                        src={item.pendingVerificationPhoto ?? item.currentPhotos[0]}
                        alt="Pending verification"
                        className="h-24 w-full rounded-xl object-cover"
                      />
                      <img
                        src={item.currentPhotos[0]}
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

          <article className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-semibold text-[var(--color-primary)]">All Users</h2>
            <div className="mt-4 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-[var(--color-border)] p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <img src={user.photos[0]} alt={user.firstName} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-[var(--color-primary)]">{user.firstName}, {user.age}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user.email} • {user.city}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-[var(--color-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
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
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : "border-[var(--color-border)] text-[var(--color-primary)]"
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
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[0_10px_18px_rgba(0,0,0,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[var(--color-primary)]">{value}</p>
    </div>
  );
}
