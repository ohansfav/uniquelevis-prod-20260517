import { useEffect, useRef, useState } from "react";
import type { MatchItem, MessageItem } from "@/lib/types";
import { getProfileImage } from "@/lib/image";

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
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedMatch = matches.find((m) => m.id === selectedMatchId) ?? null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || lockReason || sending) return;
    setSending(true);
    try {
      await onSend(text);
      setInputValue("");
      onTypingChange(false);
    } catch {
      // parent surfaces error
    } finally {
      setSending(false);
    }
  };

  const getAvatarUrl = (match: MatchItem) =>
    getProfileImage(match.otherUser.photos?.[0], match.otherUser.firstName, 80, 50);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[0_20px_30px_rgba(27,23,48,0.1)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <div className="flex-1 min-w-0">
          {selectedMatch ? (
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 shrink-0">
                <img
                  src={getAvatarUrl(selectedMatch)}
                  alt={selectedMatch.otherUser.firstName}
                  className="h-full w-full rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-primary)]">
                  {selectedMatch.otherUser.firstName}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  {isTyping ? (
                    <span className="text-[var(--color-accent)]">typing…</span>
                  ) : (
                    "Active now"
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold text-[var(--color-primary)]">Conversations</p>
          )}
        </div>
      </div>

      {/* Match list */}
      {matches.length > 0 && (
        <div className="flex gap-3 overflow-x-auto border-b border-[var(--color-border)] px-4 py-3">
          {matches.map((match) => {
            const isSelected = selectedMatchId === match.id;
            return (
              <button
                key={match.id}
                onClick={() => onSelectMatch(match.id)}
                className="flex shrink-0 flex-col items-center gap-1 transition active:scale-95"
              >
                <div className={`relative h-12 w-12 rounded-full p-0.5 transition ${isSelected ? "romance-gradient" : "bg-[var(--color-border)]"}`}>
                  <img
                    src={getAvatarUrl(match)}
                    alt={match.otherUser.firstName}
                    className="h-full w-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                <span className={`text-[10px] font-semibold truncate max-w-[48px] ${isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}>
                  {match.otherUser.firstName}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        style={{ minHeight: 180 }}
      >
        {!selectedMatch ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--color-text-muted)]" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            {matches.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-[var(--color-primary)]">No matches yet</p>
                <p className="text-xs text-[var(--color-text-muted)]">Keep swiping to find your match!</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[var(--color-primary)]">Pick a conversation</p>
                <p className="text-xs text-[var(--color-text-muted)]">Select a match above to start chatting</p>
              </>
            )}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full romance-gradient shadow-[0_8px_20px_rgba(255,79,122,0.35)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.199 3.539 1 6.5 1c1.898 0 3.698.798 5.5 2.6C13.802 1.798 15.602 1 17.5 1 20.461 1 23 3.199 23 7.191c0 4.105-5.37 8.863-11 14.402z"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-[var(--color-primary)]">It&apos;s a match!</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Say hello to {selectedMatch.otherUser.firstName} 👋
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.senderId === currentUserId;
            const isFirst = i === 0 || messages[i - 1]?.senderId !== msg.senderId;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine && isFirst && (
                  <img
                    src={getAvatarUrl(selectedMatch)}
                    alt={selectedMatch.otherUser.firstName}
                    className="h-7 w-7 rounded-full object-cover shrink-0 mb-0.5"
                  />
                )}
                {!isMine && !isFirst && <div className="w-7 shrink-0" />}

                <div
                  className={`group max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                    isMine
                      ? "romance-gradient text-white rounded-br-md shadow-[0_4px_14px_rgba(255,79,122,0.35)]"
                      : "bg-[var(--color-surface)] text-[var(--color-text)] rounded-bl-md border border-[var(--color-border)]"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <p className={`mt-1 text-[10px] ${isMine ? "text-white/60" : "text-[var(--color-text-muted)]"}`}>
                    {msg.createdAt ? formatTime(msg.createdAt) : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && typingName && selectedMatch && (
          <div className="flex items-end gap-2">
            <img
              src={getAvatarUrl(selectedMatch)}
              alt={typingName}
              className="h-7 w-7 rounded-full object-cover shrink-0"
            />
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-3">
              <span className="typing-dot text-[var(--color-text-muted)]" />
              <span className="typing-dot text-[var(--color-text-muted)]" />
              <span className="typing-dot text-[var(--color-text-muted)]" />
            </div>
          </div>
        )}
      </div>

      {/* Lock reason */}
      {selectedMatch && lockReason && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-50/80 px-3 py-2 dark:bg-amber-950/30">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-amber-600">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/>
          </svg>
          <p className="text-xs text-amber-900 dark:text-amber-300">{lockReason}</p>
        </div>
      )}

      {/* Input */}
      <form
        className="flex gap-2 border-t border-[var(--color-border)] px-4 py-3"
        onSubmit={handleSubmit}
      >
        <input
          ref={inputRef}
          className="input py-2.5 text-sm"
          placeholder={lockReason ? "Upgrade to message" : `Message ${selectedMatch?.otherUser.firstName ?? "…"}`}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onTypingChange(e.target.value.trim().length > 0);
          }}
          onFocus={(e) => { setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300); }}
          disabled={Boolean(lockReason) || !selectedMatchId}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!selectedMatchId || Boolean(lockReason) || !inputValue.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full romance-gradient text-white shadow-[0_4px_12px_rgba(255,79,122,0.4)] transition active:scale-90 disabled:opacity-40"
          aria-label="Send"
        >
          {sending ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="white" strokeWidth="3"/>
              <path fill="white" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-0.5">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </form>
    </section>
  );
}
