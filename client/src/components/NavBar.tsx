"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  isAuthenticated: boolean;
  onLogout: () => void;
};

export default function NavBar({ isAuthenticated, onLogout }: Props) {
  const router = useRouter();
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
      router.push("/admin");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface-elevated)_82%,transparent)] backdrop-blur-xl">
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
          {!isAuthenticated && (
            <button onClick={() => router.back()} className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
              Back
            </button>
          )}

          {isAuthenticated && (
            <a
              href="/messages"
              className="hidden rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)] md:inline-flex"
            >
              Chats
            </a>
          )}

          {isAuthenticated && (
            <a
              href="/"
              className="inline-flex rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)] md:hidden"
            >
              Discover
            </a>
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
