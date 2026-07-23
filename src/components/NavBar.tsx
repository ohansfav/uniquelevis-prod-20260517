import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";

type Props = {
  isAuthenticated: boolean;
  onLogout: () => void;
  onSearch?: () => void;
  likesCount?: number;
};

export default function NavBar({ isAuthenticated, onLogout, onSearch, likesCount = 0 }: Props) {
  const [, navigate] = useLocation();
  const [secretTapCount, setSecretTapCount] = useState(0);
  const secretTimer = useRef<number | null>(null);

  const handleSecretTap = () => {
    const next = secretTapCount + 1;
    setSecretTapCount(next);
    if (secretTimer.current) window.clearTimeout(secretTimer.current);
    secretTimer.current = window.setTimeout(() => setSecretTapCount(0), 1200);
    if (next >= 7) {
      setSecretTapCount(0);
      navigate("/admin");
    }
  };

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface-elevated)_92%,transparent)] backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5 md:gap-3">
          <button
            type="button"
            onClick={handleSecretTap}
            aria-label="Unique Levi's brand"
            className="romance-gradient grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white shadow-[0_8px_18px_rgba(255,79,122,0.38)] transition active:scale-90"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.199 3.539 1 6.5 1c1.898 0 3.698.798 5.5 2.6C13.802 1.798 15.602 1 17.5 1 20.461 1 23 3.199 23 7.191c0 4.105-5.37 8.863-11 14.402z"/>
            </svg>
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Swipe App</p>
            <h1 className="text-lg font-black text-[var(--color-primary)] leading-none">Unique Levi&apos;s</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              type="button"
              onClick={onSearch}
              className="group inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-accent)_35%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-accent)_12%,white)_0%,color-mix(in_oklab,var(--color-accent-2)_12%,white)_100%)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/80 text-[var(--color-accent)] shadow-sm transition group-hover:bg-white">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              Search
            </button>
          )}

          {isAuthenticated && likesCount > 0 && (
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full romance-gradient text-white shadow-[0_4px_12px_rgba(255,79,122,0.4)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.199 3.539 1 6.5 1c1.898 0 3.698.798 5.5 2.6C13.802 1.798 15.602 1 17.5 1 20.461 1 23 3.199 23 7.191c0 4.105-5.37 8.863-11 14.402z"/>
              </svg>
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-[#f2cb4d] px-1 text-[9px] font-bold text-[#2b1d0f]">
                {likesCount > 99 ? "99+" : likesCount}
              </span>
            </span>
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
