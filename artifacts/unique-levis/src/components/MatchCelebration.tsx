import { useEffect, useState } from "react";

type Props = {
  myPhoto: string;
  matchPhoto: string;
  matchName: string;
  onMessage: () => void;
  onKeepSwiping: () => void;
};

const CONFETTI_COLORS = ["#ff4f7a", "#ff8e53", "#ffd166", "#06d6a0", "#4361ee", "#c77dff", "#ffffff"];
const NUM_PIECES = 36;

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = `${(index / NUM_PIECES) * 100}%`;
  const delay = `${(index * 0.08) % 1.2}s`;
  const duration = `${1.8 + (index % 5) * 0.3}s`;
  const isCircle = index % 3 === 0;
  const size = 6 + (index % 3) * 3;

  return (
    <div
      className="pointer-events-none absolute top-0"
      style={{
        left,
        width: size,
        height: isCircle ? size : size * 1.4,
        borderRadius: isCircle ? "50%" : "2px",
        background: color,
        animation: `confetti-a ${duration} ease-in ${delay} forwards`,
        opacity: 0,
      }}
    />
  );
}

export default function MatchCelebration({ myPhoto, matchPhoto, matchName, onMessage, onKeepSwiping }: Props) {
  const [visible, setVisible] = useState(false);
  const [heartsBurst, setHeartsBurst] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setHeartsBurst(true), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#160f25]/97 via-[#201433]/95 to-[#0e0a1e]/97 backdrop-blur-sm animate-fade-in" />

      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: NUM_PIECES }, (_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center px-8 text-center transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* IT'S A MATCH */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] opacity-90">
            It&apos;s a
          </p>
          <h1
            className="text-6xl font-black tracking-tight text-white"
            style={{
              background: "linear-gradient(125deg, #ff4f7a, #ff8e53, #ffd166)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
            }}
          >
            Match!
          </h1>
        </div>

        {/* Photos */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* My photo */}
          <div
            className="relative z-10 h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-[0_16px_40px_rgba(255,79,122,0.5)]"
            style={{ transform: "translateX(16px)" }}
          >
            <img src={myPhoto} alt="You" className="h-full w-full object-cover" />
          </div>

          {/* Heart in middle */}
          <div
            className={`absolute z-20 flex h-12 w-12 items-center justify-center rounded-full romance-gradient shadow-[0_8px_24px_rgba(255,79,122,0.6)] transition-transform duration-300 ${heartsBurst ? "animate-heart-burst" : "scale-90"}`}
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.199 3.539 1 6.5 1c1.898 0 3.698.798 5.5 2.6C13.802 1.798 15.602 1 17.5 1 20.461 1 23 3.199 23 7.191c0 4.105-5.37 8.863-11 14.402z"/>
            </svg>
          </div>

          {/* Match photo */}
          <div
            className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-[0_16px_40px_rgba(255,79,122,0.5)]"
            style={{ transform: "translateX(-16px)" }}
          >
            <img src={matchPhoto} alt={matchName} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Message */}
        <p className="mb-10 text-base text-white/80">
          You and <span className="font-bold text-white">{matchName}</span> liked each other.
          <br />
          <span className="text-sm text-white/60">Start a conversation now!</span>
        </p>

        {/* Floating hearts */}
        {heartsBurst && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-float-heart"
                style={{
                  left: `${15 + i * 10}%`,
                  bottom: "35%",
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: `${0.8 + (i % 3) * 0.3}s`,
                }}
              >
                ❤️
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            type="button"
            onClick={onMessage}
            className="w-full rounded-2xl romance-gradient py-4 text-base font-bold text-white shadow-[0_12px_32px_rgba(255,79,122,0.5)] transition active:scale-95"
          >
            Send a Message 💌
          </button>
          <button
            type="button"
            onClick={onKeepSwiping}
            className="w-full rounded-2xl border border-white/20 bg-white/8 py-3.5 text-sm font-semibold text-white/80 backdrop-blur transition hover:bg-white/12 active:scale-95"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}
