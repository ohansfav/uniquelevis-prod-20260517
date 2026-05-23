"use client";

import { useEffect, useRef, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import MatchesPanel from "@/components/MatchesPanel";
import NavBar from "@/components/NavBar";
import {
  getMatches,
  getMessages,
  markMessagesRead,
  openMessageStream,
  refreshAccessToken,
  sendMessage,
  sendTyping,
} from "@/lib/api";
import type { MatchItem, MessageItem } from "@/lib/types";

export default function MessagesPage() {
  const [token, setToken] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [typingByMatch, setTypingByMatch] = useState<Record<string, string | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const refreshInFlightRef = useRef<Promise<string> | null>(null);
  const streamRecoveryInFlightRef = useRef(false);
  const streamFailureCountRef = useRef(0);
  const [streamRetryTick, setStreamRetryTick] = useState(0);

  const isUnauthorizedMessage = (message: string) => {
    const lower = message.toLowerCase();
    return (
      message.includes("401")
      || lower.includes("unauthorized")
      || lower.includes("token expired")
      || lower.includes("token invalid")
      || lower.includes("token expired or invalid")
      || lower.includes("invalid token")
      || lower.includes("missing bearer token")
    );
  };

  const clearSessionAndPromptLogin = () => {
    setToken("");
    setRefreshToken("");
    setMatches([]);
    setSelectedMatchId(null);
    setMessages([]);
    localStorage.removeItem("ul_access_token");
    localStorage.removeItem("ul_refresh_token");
    window.location.href = "/?auth=login";
  };

  const renewAccessToken = async () => {
    if (!refreshToken) {
      throw new Error("Your session expired. Please log in again.");
    }
    if (!refreshInFlightRef.current) {
      refreshInFlightRef.current = refreshAccessToken(refreshToken)
        .then((refreshed) => {
          setToken(refreshed.accessToken);
          localStorage.setItem("ul_access_token", refreshed.accessToken);
          return refreshed.accessToken;
        })
        .catch(() => {
          throw new Error("Your session expired. Please log in again.");
        })
        .finally(() => {
          refreshInFlightRef.current = null;
        });
    }
    return refreshInFlightRef.current;
  };

  const withSessionRecovery = async <T,>(action: (authToken: string) => Promise<T>) => {
    try {
      return await action(token);
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : "Request failed";
      if (!token || !isUnauthorizedMessage(message)) {
        throw actionError;
      }

      const refreshedToken = await renewAccessToken();
      return action(refreshedToken);
    }
  };

  useEffect(() => {
    const savedAccess = localStorage.getItem("ul_access_token");
    const savedRefresh = localStorage.getItem("ul_refresh_token");
    if (savedAccess) {
      setToken(savedAccess);
    }
    if (savedRefresh) {
      setRefreshToken(savedRefresh);
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    const savedAccess = localStorage.getItem("ul_access_token");
    const savedRefresh = localStorage.getItem("ul_refresh_token");
    if (savedAccess && savedAccess !== token) {
      setToken(savedAccess);
    }
    if (savedRefresh && savedRefresh !== refreshToken) {
      setRefreshToken(savedRefresh);
    }
  }, [refreshToken, token]);

  useEffect(() => {
    if (!authReady) return;
    if (!token) return;

    let isActive = true;

    const load = async () => {
      try {
        setError(null);
        const nextMatches = await withSessionRecovery((authToken) => getMatches(authToken));
        if (!isActive) return;
        setMatches(nextMatches);
        if (nextMatches.length > 0) {
          const matchId = nextMatches[0].id;
          setSelectedMatchId(matchId);
          const msgs = await withSessionRecovery((authToken) => getMessages(authToken, matchId));
          if (!isActive) return;
          setMessages(msgs);
          await withSessionRecovery((authToken) => markMessagesRead(authToken, matchId));
        } else {
          setMessages([]);
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "Failed to load messages";
        if (isUnauthorizedMessage(message)) {
          setError("Your session expired. Please log in again.");
          clearSessionAndPromptLogin();
          return;
        }
        setError(message);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [authReady, token]);

  useEffect(() => {
    if (!token) return;

    const handleStreamFailure = () => {
      if (streamRecoveryInFlightRef.current) return;
      streamRecoveryInFlightRef.current = true;
      streamFailureCountRef.current += 1;

      if (streamFailureCountRef.current < 2) {
        window.setTimeout(() => {
          streamRecoveryInFlightRef.current = false;
          setStreamRetryTick((value) => value + 1);
        }, 1200);
        return;
      }

      void renewAccessToken()
        .then(() => {
          streamFailureCountRef.current = 0;
          streamRecoveryInFlightRef.current = false;
          setStreamRetryTick((value) => value + 1);
        })
        .catch(() => {
          streamRecoveryInFlightRef.current = false;
          setError("Your session expired. Please log in again.");
          clearSessionAndPromptLogin();
        });
    };

    let closed = false;

    const source = openMessageStream(
      token,
      (payload) => {
        if (closed) return;
        if (payload.matchId === selectedMatchId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.message.id)) return prev;
            return [...prev, payload.message];
          });
        }
        void withSessionRecovery((authToken) => getMatches(authToken))
          .then((nextMatches) => {
            if (!closed) {
              setMatches(nextMatches);
            }
          })
          .catch((streamError) => {
            const message = streamError instanceof Error ? streamError.message : "Failed to refresh matches";
            if (isUnauthorizedMessage(message)) {
              setError("Your session expired. Please log in again.");
              clearSessionAndPromptLogin();
              return;
            }
            setError(message);
          });
      },
      (typingPayload) => {
        if (closed) return;
        setTypingByMatch((prev) => ({
          ...prev,
          [typingPayload.matchId]: typingPayload.isTyping ? typingPayload.byName : null,
        }));
      },
    );

    source.onerror = () => {
      if (closed) return;
      source.close();
      handleStreamFailure();
    };

    return () => {
      closed = true;
      source.close();
    };
  }, [token, selectedMatchId, streamRetryTick]);

  useEffect(() => {
    if (!token) return;
    streamFailureCountRef.current = 0;
  }, [token]);

  const handleSelectMatch = async (matchId: string) => {
    if (!token) return;
    try {
      setError(null);
      setSelectedMatchId(matchId);
      const nextMessages = await withSessionRecovery((authToken) => getMessages(authToken, matchId));
      setMessages(nextMessages);
      await withSessionRecovery((authToken) => markMessagesRead(authToken, matchId));
      const nextMatches = await withSessionRecovery((authToken) => getMatches(authToken));
      setMatches(nextMatches);
    } catch (selectError) {
      const message = selectError instanceof Error ? selectError.message : "Failed to load messages";
      if (isUnauthorizedMessage(message)) {
        setError("Your session expired. Please log in again.");
        clearSessionAndPromptLogin();
        return;
      }
      setError(message);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!token || !selectedMatchId) return;
    try {
      setError(null);
      await withSessionRecovery((authToken) => sendMessage(authToken, selectedMatchId, text));
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Failed to send message";
      if (isUnauthorizedMessage(message)) {
        setError("Your session expired. Please log in again.");
        clearSessionAndPromptLogin();
        return;
      }
      setError(message);
    }
  };

  const handleTypingChange = async (isTyping: boolean) => {
    if (!token || !selectedMatchId) return;
    try {
      await withSessionRecovery((authToken) => sendTyping(authToken, selectedMatchId, isTyping));
    } catch (typingError) {
      const message = typingError instanceof Error ? typingError.message : "Failed to send typing state";
      if (isUnauthorizedMessage(message)) {
        setError("Your session expired. Please log in again.");
        clearSessionAndPromptLogin();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-6">
      <NavBar isAuthenticated={Boolean(token)} onLogout={() => {
        localStorage.removeItem("ul_access_token");
        localStorage.removeItem("ul_refresh_token");
        window.location.href = "/";
      }} onSearch={() => {
        window.location.href = "/";
      }} />
      <main className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
        <h2 className="mb-5 text-3xl text-[var(--color-primary)]">Messages</h2>
        {error && (
          <div className="mb-4 rounded-2xl border border-[#f3b4c1] bg-[#fff1f5] px-4 py-3 text-sm text-[#8a2445]">
            {error}
          </div>
        )}
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
