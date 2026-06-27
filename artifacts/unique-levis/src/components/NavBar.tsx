

import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";


type Props = {
  isAuthenticated: boolean;
  onLogout: () => void;
  onSearch?: () => void;
};

export default function NavBar({ isAuthenticated, onLogout, onSearch }: Props) {
  const [, navigate] = useLocation();
  const [secretTapCount, setSecretTapCount] = useState(0);
  const secretTimer = useRef<number | null>(null);

  const handleSecretTap = () => {
    const next = secretTapCount + 1;
    setSecretTapCount(next);

    if (secretTimer.current) {
      window.clearTimeout(secretTimer.current);
    }

    secretTimer.current = window.setTimeout(() => {
      setSecretTapCount(0);
    }, 1200);

    if (next >= 7) {
      setSecretTapCount(0);
      navigate("/admin");
    }
  };

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface-elevated)_84%,transparent)] backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={handleSecretTap}
            aria-label="Unique Levi's brand"
            className="romance-gradient grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white shadow-[0_8px_16px_rgba(255,79,122,0.35)]"
          >
            ❤
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Swipe App</p>
            <h1 className="text-lg text-[var(--color-primary)]">Unique Levi&apos;s</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              type="button"
              onClick={onSearch}
              className="group inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-accent)_35%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-accent)_12%,white)_0%,color-mix(in_oklab,var(--color-accent-2)_12%,white)_100%)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
              aria-label="Search profiles"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/80 text-[var(--color-accent)] shadow-sm transition group-hover:bg-white">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              Search
            </button>
          )}

          {!isAuthenticated && (
            <button onClick={() => window.history.back()} className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
              Back
            </button>
          )}

          {isAuthenticated && (
            <Link
              href="/messages"
              className="hidden rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)] md:inline-flex"
            >
              Chats
            </Link>
          )}

          {isAuthenticated && (
            <Link
              href="/"
              className="inline-flex rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)] md:hidden"
            >
              Discover
            </Link>
          )}

          {isAuthenticated && (
            <button
              onClick={onLogout}
              className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
