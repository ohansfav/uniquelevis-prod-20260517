import type { MatchItem, MessageItem } from "@/lib/types";

type Props = {
  matches: MatchItem[];
  selectedMatchId: string | null;
  onSelectMatch: (matchId: string) => void;
  messages: MessageItem[];
  currentUserId: string | null;
  onSend: (text: string) => Promise<void>;
  isTyping: boolean;
  typingName: string | null;
  onTypingChange: (isTyping: boolean) => void;
  lockReason?: string | null;
};

export default function ChatPanel({
  matches,
  selectedMatchId,
  onSelectMatch,
  messages,
  currentUserId,
  onSend,
  isTyping,
  typingName,
  onTypingChange,
  lockReason = null,
}: Props) {
  const selectedMatch = matches.find((m) => m.id === selectedMatchId) ?? null;

  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      <h3 className="mb-3 text-lg font-semibold text-[var(--color-primary)]">Conversations</h3>

      {matches.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => onSelectMatch(match.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedMatchId === match.id
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-primary)]"
              }`}
            >
              {match.otherUser.firstName}
            </button>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-sm text-[var(--color-text-muted)]">No matches yet for chat.</p>
      )}

      <div className="mb-3 h-72 space-y-2 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 md:h-64">
        {selectedMatch ? (
          messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[82%] rounded-xl px-3 py-2 text-sm ${
                  msg.senderId === currentUserId
                    ? "ml-auto bg-[var(--color-primary)] text-white"
                    : "bg-[#edf0f4] text-[#1f2430]"
                }`}
              >
                <p>{msg.text}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">No messages yet.</p>
          )
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">Select a match to start chatting.</p>
        )}
      </div>

      {isTyping && typingName && (
        <p className="mb-2 text-xs text-[var(--color-text-muted)]">{typingName} is typing...</p>
      )}

      {selectedMatch && lockReason && (
        <p className="mb-2 rounded-xl border border-amber-300/60 bg-amber-100/70 px-3 py-2 text-xs text-amber-900">
          {lockReason}
        </p>
      )}

      <form
        className="flex gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          if (lockReason) return;
          const formData = new FormData(event.currentTarget);
          const text = String(formData.get("text") ?? "").trim();
          if (text) {
            try {
              await onSend(text);
              onTypingChange(false);
              event.currentTarget.reset();
            } catch {
              // Error is surfaced by the parent component; keep the input value so the user can retry
            }
          }
        }}
      >
        <input
          className="input"
          name="text"
          placeholder={lockReason ? "Messaging locked for this match" : "Type a message"}
          onChange={(e) => onTypingChange(e.currentTarget.value.trim().length > 0)}
          onFocus={(e) => { setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300); }}
          disabled={Boolean(lockReason) || !selectedMatchId}
        />
        <button
          type="submit"
          disabled={!selectedMatchId || Boolean(lockReason)}
          className="romance-gradient rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  );
}
