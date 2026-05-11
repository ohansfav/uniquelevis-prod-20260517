"use client";

import { useEffect, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import MatchesPanel from "@/components/MatchesPanel";
import NavBar from "@/components/NavBar";
import {
  getMatches,
  getMessages,
  markMessagesRead,
  openMessageStream,
  sendMessage,
  sendTyping,
} from "@/lib/api";
import type { MatchItem, MessageItem } from "@/lib/types";

export default function MessagesPage() {
  const [token, setToken] = useState<string>("");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [typingByMatch, setTypingByMatch] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const savedAccess = localStorage.getItem("ul_access_token");
    if (savedAccess) {
      setToken(savedAccess);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      const nextMatches = await getMatches(token);
      setMatches(nextMatches);
      if (nextMatches.length > 0) {
        const matchId = nextMatches[0].id;
        setSelectedMatchId(matchId);
        const msgs = await getMessages(token, matchId);
        setMessages(msgs);
        await markMessagesRead(token, matchId);
      }
    };

    void load();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const source = openMessageStream(
      token,
      (payload) => {
        if (payload.matchId === selectedMatchId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.message.id)) return prev;
            return [...prev, payload.message];
          });
        }
        void getMatches(token).then(setMatches);
      },
      (typingPayload) => {
        setTypingByMatch((prev) => ({
          ...prev,
          [typingPayload.matchId]: typingPayload.isTyping ? typingPayload.byName : null,
        }));
      },
    );

    return () => source.close();
  }, [token, selectedMatchId]);

  const handleSelectMatch = async (matchId: string) => {
    if (!token) return;
    setSelectedMatchId(matchId);
    const nextMessages = await getMessages(token, matchId);
    setMessages(nextMessages);
    await markMessagesRead(token, matchId);
    const nextMatches = await getMatches(token);
    setMatches(nextMatches);
  };

  const handleSendMessage = async (text: string) => {
    if (!token || !selectedMatchId) return;
    await sendMessage(token, selectedMatchId, text);
  };

  const handleTypingChange = async (isTyping: boolean) => {
    if (!token || !selectedMatchId) return;
    await sendTyping(token, selectedMatchId, isTyping);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-6">
      <NavBar isAuthenticated={Boolean(token)} onLogout={() => {
        localStorage.removeItem("ul_access_token");
        localStorage.removeItem("ul_refresh_token");
        window.location.href = "/";
      }} />
      <main className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
        <h2 className="mb-5 text-3xl text-[var(--color-primary)]">Messages</h2>
        <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
          <MatchesPanel
            matches={matches}
            selectedMatchId={selectedMatchId}
            onSelectMatch={handleSelectMatch}
          />
          <ChatPanel
            matches={matches}
            selectedMatchId={selectedMatchId}
            onSelectMatch={handleSelectMatch}
            messages={messages}
            currentUserId={null}
            onSend={handleSendMessage}
            isTyping={Boolean(selectedMatchId ? typingByMatch[selectedMatchId] : null)}
            typingName={selectedMatchId ? typingByMatch[selectedMatchId] ?? null : null}
            onTypingChange={handleTypingChange}
          />
        </div>
      </main>
    </div>
  );
}
