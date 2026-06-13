"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ChatPanel from "@/components/ChatPanel";
import ExplorePanel, { type ExploreLane } from "@/components/ExplorePanel";
import GeneralSettings from "@/components/GeneralSettings";
import LikesPanel from "@/components/LikesPanel";
import MatchesPanel from "@/components/MatchesPanel";
import NavBar from "@/components/NavBar";
import ProfileEditor from "@/components/ProfileEditor";
import ProfileInsights from "@/components/ProfileInsights";
import SwipeCard from "@/components/SwipeCard";
import SwipeFilterDrawer from "@/components/SwipeFilterDrawer";
import SwipeOptionsDock from "@/components/SwipeOptionsDock";
import { applyThemeMode, getStoredThemeMode, saveThemeMode, type ThemeMode } from "@/lib/theme";
import {
  createUpgradeCheckout,
  getDiscoverCards,
  getBillingConfig,
  getIncomingLikes,
  getMatches,
  getMessages,
  getMyProfile,
  getMyVerificationStatus,
  login,
  logout,
  markMessagesRead,
  openMessageStream,
  refreshAccessToken,
  requestProfileVerification,
  sendMessage,
  sendSwipe,
  sendTyping,
  googleLogin,
  signup,
  updateMyProfile,
  verifyUpgradeCheckout,
} from "@/lib/api";
import type { DiscoverCard, IncomingLikeItem, MatchItem, MessageItem, PaidMembershipTier, PublicUser, VerificationStatus } from "@/lib/types";
import type { BillingProvider } from "@/lib/types";
import OnboardingFlow from "@/components/OnboardingFlow";

type AuthMode = "login" | "signup";
type MobileTab = "swipe" | "explore" | "likes" | "chat" | "profile";
type SwipeOption = "for-you" | "nearby" | "passport" | "boost";
type SwipeFilters = {
  distance: string;
  ageRange: string;
  intent: "Serious" | "Casual" | "Open" | "All" | "Long-term";
  verifiedOnly: boolean;
};
type LandingLanguage =
  | "English"
  | "French"
  | "Spanish"
  | "Portuguese"
  | "Polish"
  | "Yoruba"
  | "Igbo"
  | "Hausa"
  | "Nigerian Pidgin";

const languageOptions: LandingLanguage[] = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "Polish",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Nigerian Pidgin",
];

const getAuthErrorContent = (message: string, mode: AuthMode) => {
  const normalizedMessage = message.trim();
  const loweredMessage = normalizedMessage.toLowerCase();

  if (loweredMessage.includes("incorrect email or password") || loweredMessage.includes("invalid credentials")) {
    return {
      title: "Check your details",
      description: "The email or password does not match this account yet. Re-enter both and try again.",
      tone: "warning" as const,
    };
  }

  if (loweredMessage.includes("human verification")) {
    return {
      title: "Verification needed",
      description: normalizedMessage,
      tone: "warning" as const,
    };
  }

  if (loweredMessage.includes("too many attempts")) {
    return {
      title: "Too many attempts",
      description: normalizedMessage,
      tone: "warning" as const,
    };
  }

  return {
    title: mode === "login" ? "Sign in unavailable" : "Sign up unavailable",
    description: normalizedMessage || "We could not complete this request right now. Please try again shortly.",
    tone: "danger" as const,
  };
};

const landingCopy: Record<
  LandingLanguage,
  {
    navProducts: string;
    navLearn: string;
    navSafety: string;
    navDownload: string;
    login: string;
    heroTitleTop: string;
    heroTitleBottom: string;
    heroSubtitle: string;
    ctaCreate: string;
    ctaExisting: string;
    note: string;
  }
> = {
  English: {
    navProducts: "Products",
    navLearn: "Learn",
    navSafety: "Safety",
    navDownload: "Download",
    login: "Log in",
    heroTitleTop: "Swipe Right On",
    heroTitleBottom: "Your Next Story",
    heroSubtitle: "Find real chemistry nearby, match instantly, and turn conversations into memorable moments.",
    ctaCreate: "Create account",
    ctaExisting: "I already have an account",
    note: "All photos are used for interface illustration purposes only.",
  },
  French: {
    navProducts: "Produits",
    navLearn: "Apprendre",
    navSafety: "Securite",
    navDownload: "Telecharger",
    login: "Connexion",
    heroTitleTop: "Swipe a Droite",
    heroTitleBottom: "Sur Votre Prochaine Histoire",
    heroSubtitle: "Trouvez une vraie alchimie pres de vous, matchez vite, et creez des souvenirs.",
    ctaCreate: "Creer un compte",
    ctaExisting: "J'ai deja un compte",
    note: "Toutes les photos sont utilisees uniquement pour l'illustration de l'interface.",
  },
  Spanish: {
    navProducts: "Productos",
    navLearn: "Aprender",
    navSafety: "Seguridad",
    navDownload: "Descargar",
    login: "Iniciar sesion",
    heroTitleTop: "Desliza a la Derecha",
    heroTitleBottom: "En Tu Proxima Historia",
    heroSubtitle: "Encuentra conexion real cerca de ti, haz match al instante y crea momentos memorables.",
    ctaCreate: "Crear cuenta",
    ctaExisting: "Ya tengo una cuenta",
    note: "Todas las fotos se usan solo para ilustrar la interfaz.",
  },
  Portuguese: {
    navProducts: "Produtos",
    navLearn: "Aprender",
    navSafety: "Seguranca",
    navDownload: "Baixar",
    login: "Entrar",
    heroTitleTop: "Deslize para a Direita",
    heroTitleBottom: "Na Sua Proxima Historia",
    heroSubtitle: "Encontre quimica real perto de voce, de match na hora e viva momentos inesqueciveis.",
    ctaCreate: "Criar conta",
    ctaExisting: "Ja tenho uma conta",
    note: "Todas as fotos sao usadas apenas para ilustracao da interface.",
  },
  Polish: {
    navProducts: "Produkty",
    navLearn: "Nauka",
    navSafety: "Bezpieczenstwo",
    navDownload: "Pobierz",
    login: "Zaloguj",
    heroTitleTop: "Przesun w Prawo",
    heroTitleBottom: "Na Swoja Nastepna Historie",
    heroSubtitle: "Znajdz prawdziwa chemie blisko siebie, dobierz sie szybko i tworz piekne chwile.",
    ctaCreate: "Utworz konto",
    ctaExisting: "Mam juz konto",
    note: "Wszystkie zdjecia sa uzyte tylko do celow prezentacji interfejsu.",
  },
  Yoruba: {
    navProducts: "Ero",
    navLearn: "Ko eko",
    navSafety: "Aabo",
    navDownload: "Gba kalẹ",
    login: "Wo ile",
    heroTitleTop: "Ra Si Otun",
    heroTitleBottom: "Fun Itan Rẹ To Nbo",
    heroSubtitle: "Wa ife tooto nitosi re, ba ara yin mu kiakia, ki e si da iranti to dun sile.",
    ctaCreate: "Da account sile",
    ctaExisting: "Mo ti ni account",
    note: "A lo gbogbo aworan fun afihan interface nikan.",
  },
  Igbo: {
    navProducts: "Ngwa",
    navLearn: "Muta",
    navSafety: "Nchedo",
    navDownload: "Budata",
    login: "Banye",
    heroTitleTop: "Swipe n'aka nri",
    heroTitleBottom: "Maka Akuko Gi Ozo",
    heroSubtitle: "Chota ezi njikota nso gi, me match ozugbo, wee meputa oge ncheta.",
    ctaCreate: "Mepụta account",
    ctaExisting: "Enwerem account",
    note: "A na-eji foto niile maka ngosi interface naanị.",
  },
  Hausa: {
    navProducts: "Kayayyaki",
    navLearn: "Koyo",
    navSafety: "Tsaro",
    navDownload: "Sauke",
    login: "Shiga",
    heroTitleTop: "Goga Zuwa Dama",
    heroTitleBottom: "Don Labarinka Na Gaba",
    heroSubtitle: "Nemo haduwa ta gaskiya kusa da kai, yi match nan da nan, ka kirkiri lokuta masu dadi.",
    ctaCreate: "Kirkiri account",
    ctaExisting: "Ina da account",
    note: "An yi amfani da duk hotuna ne don nuna interface kawai.",
  },
  "Nigerian Pidgin": {
    navProducts: "Product",
    navLearn: "Learn",
    navSafety: "Safety",
    navDownload: "Download",
    login: "Log in",
    heroTitleTop: "Swipe Right For",
    heroTitleBottom: "Your Next Story",
    heroSubtitle: "Find real connection for your side, match sharp sharp, and create better moments.",
    ctaCreate: "Create account",
    ctaExisting: "I don get account",
    note: "All photos na for interface sample only.",
  },
};

export default function Home() {
  type BillingConfigState = Awaited<ReturnType<typeof getBillingConfig>>;

  const getOnboardingStorageKey = (userId: string) => `ul_onboarding_complete_${userId}`;

  const hasCompletedOnboardingLocally = (userId: string) => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(getOnboardingStorageKey(userId)) === "1";
  };

  const markOnboardingCompletedLocally = (userId: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(getOnboardingStorageKey(userId), "1");
  };

  const [authReady, setAuthReady] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [mobileTab, setMobileTab] = useState<MobileTab>("swipe");
  const [swipeOption, setSwipeOption] = useState<SwipeOption>("for-you");
  const [swipeFilters, setSwipeFilters] = useState<SwipeFilters>({
    distance: "Any",
    ageRange: "21-28",
    intent: "All",
    verifiedOnly: false,
  });
  const [token, setToken] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [city, setCity] = useState("");
  const [cards, setCards] = useState<DiscoverCard[]>([]);
  const [incomingLikes, setIncomingLikes] = useState<IncomingLikeItem[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [likesUnlocked, setLikesUnlocked] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [chatLockByMatch, setChatLockByMatch] = useState<Record<string, string>>({});
  const [typingByMatch, setTypingByMatch] = useState<Record<string, string | null>>({});
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("none");
  const [loading, setLoading] = useState(false);
  const swipingCardIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState("Welcome to Unique Levi's. Let's find your person.");
  const [error, setError] = useState<string | null>(null);
  const [billingConfig, setBillingConfig] = useState<BillingConfigState | null>(null);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LandingLanguage>("English");
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const refreshInFlightRef = useRef<Promise<string> | null>(null);
  const streamRecoveryInFlightRef = useRef(false);
  const streamFailureCountRef = useRef(0);
  const [streamRetryTick, setStreamRetryTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("ul-app-ready"));
    // Silently warm up the backend serverless function so the first real request
    // doesn't stall on a cold start (Vercel functions sleep after inactivity).
    void fetch("/api/health", { method: "GET", cache: "no-store" }).catch(() => {});
  }, []);

  const activeCard = useMemo(() => cards[0], [cards]);
  const isAuthenticated = token.length > 0;
  const typingName = selectedMatchId ? typingByMatch[selectedMatchId] ?? null : null;
  const selectedChatLockReason = selectedMatchId ? chatLockByMatch[selectedMatchId] ?? null : null;

  const mergeMessagesKeepingRecentLocal = (prev: MessageItem[], next: MessageItem[], actorId: string | null) => {
    if (!actorId) {
      return next;
    }

    const nextIds = new Set(next.map((item) => item.id));
    const cutoff = Date.now() - 20_000;
    const preserve = prev.filter((item) => {
      if (item.senderId !== actorId || nextIds.has(item.id)) {
        return false;
      }
      const created = Date.parse(item.createdAt);
      return Number.isFinite(created) && created >= cutoff;
    });

    if (preserve.length === 0) {
      return next;
    }

    return [...next, ...preserve].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  };

  const copy = landingCopy[selectedLanguage];
  const splashOverlay = (
    <div className="splash-overlay fixed inset-0 z-50 grid place-items-center bg-[#0e0c17] px-6 text-white pointer-events-none">
      <div className="text-center">
        <div className="splash-pulse romance-gradient mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full text-2xl shadow-[0_24px_45px_rgba(255,79,122,0.55)]">
          ❤
        </div>
        <h1 className="text-3xl">Unique Levi&apos;s</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/75">Swipe Into Something Real</p>
      </div>
    </div>
  );

  const processingOverlay = isTransitioning ? (
    <div className="splash-overlay fixed inset-0 z-[90] grid place-items-center bg-[#0e0c17]/95 px-6 text-white">
      <div className="text-center">
        <div className="splash-pulse romance-gradient mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full text-2xl shadow-[0_24px_45px_rgba(255,79,122,0.55)]">
          ❤
        </div>
        <h2 className="text-2xl">Processing...</h2>
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/75">Taking you there</p>
      </div>
    </div>
  ) : null;

  const beginLandingTransition = (action: () => void) => {
    setIsTransitioning(true);
    action();
    window.setTimeout(() => setIsTransitioning(false), 280);
  };

  const markNavigationTransition = () => {
    setIsTransitioning(true);
    try {
      sessionStorage.setItem("ul_transition_pending", String(Date.now()));
    } catch {
      // no-op: if storage is blocked, keep only in-memory feedback
    }
  };

  const getDiscoverQuery = (options?: { recycle?: boolean }) => ({
    mode: swipeOption,
    distance: swipeFilters.distance,
    ageRange: swipeFilters.ageRange,
    intent: swipeFilters.intent,
    verifiedOnly: swipeFilters.verifiedOnly,
    recycle: options?.recycle,
  });

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

  const isChatMembershipLockMessage = (message: string) => {
    const lower = message.toLowerCase();
    return (
      lower.includes("upgrade to silver to chat")
      || lower.includes("only accepts chats from silver")
      || lower.includes("only accepts chats from gold and diamond")
    );
  };

  const setMatchChatLock = (matchId: string, reason: string) => {
    setChatLockByMatch((prev) => ({ ...prev, [matchId]: reason }));
  };

  const clearMatchChatLock = (matchId: string) => {
    setChatLockByMatch((prev) => {
      if (!(matchId in prev)) return prev;
      const { [matchId]: _ignored, ...rest } = prev;
      return rest;
    });
  };

  const resetClientSessionState = (options?: {
    showAuthForm?: boolean;
    authMode?: AuthMode;
    statusMessage?: string;
  }) => {
    setToken("");
    setRefreshToken("");
    setCurrentUser(null);
    setProfile(null);
    setNeedsOnboarding(false);
    setIncomingLikes([]);
    setLikesCount(0);
    setLikesUnlocked(false);
    setCards([]);
    setMatches([]);
    setSelectedMatchId(null);
    setMessages([]);
    setChatLockByMatch({});
    setTypingByMatch({});
    setVerificationStatus("none");
    setBillingConfig(null);
    setHasBootstrapped(false);
    setMobileTab("swipe");
    refreshInFlightRef.current = null;
    streamFailureCountRef.current = 0;
    streamRecoveryInFlightRef.current = false;
    localStorage.removeItem("ul_access_token");
    localStorage.removeItem("ul_refresh_token");
    localStorage.removeItem("ul_app_state");

  if (options?.authMode) {
      setAuthMode(options.authMode);
    }
    if (typeof options?.showAuthForm === "boolean") {
      setShowAuthForm(options.showAuthForm);
    }
    if (options?.statusMessage) {
      setStatus(options.statusMessage);
    }
  };

  const clearSessionAndPromptLogin = () => {
    resetClientSessionState({
      showAuthForm: true,
      authMode: "login",
      statusMessage: "Session ended. Please log in again.",
    });
  };

  const handleStreamFailure = () => {
    if (streamRecoveryInFlightRef.current) {
      return;
    }

    streamFailureCountRef.current += 1;
    streamRecoveryInFlightRef.current = true;

    if (streamFailureCountRef.current < 2) {
      window.setTimeout(() => {
        streamRecoveryInFlightRef.current = false;
        setStreamRetryTick((value) => value + 1);
      }, 1200);
      return;
    }

    if (!refreshToken) {
      streamRecoveryInFlightRef.current = false;
      setError("Your session expired. Please log in again.");
      clearSessionAndPromptLogin();
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

  const renewAccessToken = async () => {
    if (!refreshToken) {
      throw new Error("Missing refresh token");
    }
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const next = refreshAccessToken(refreshToken)
      .then((refreshed) => {
        setToken(refreshed.accessToken);
        setCurrentUser(refreshed.user);
        localStorage.setItem("ul_access_token", refreshed.accessToken);
        return refreshed.accessToken;
      })
      .finally(() => {
        refreshInFlightRef.current = null;
      });

    refreshInFlightRef.current = next;
    return next;
  };

  const withSessionRecovery = async <T,>(action: (authToken: string) => Promise<T>) => {
    try {
      return await action(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!isUnauthorizedMessage(message) || !refreshToken) {
        throw error;
      }
      let nextToken = "";
      try {
        nextToken = await renewAccessToken();
      } catch {
        clearSessionAndPromptLogin();
        throw new Error("Your session expired. Please log in again.");
      }
      return await action(nextToken);
    }
  };

  const restartDeck = async () => {
    if (!token) return;
    setSwipeOption("for-you");
    setSwipeFilters({
      distance: "Any",
      ageRange: "21-28",
      intent: "All",
      verifiedOnly: false,
    });
    setStatus("Restarting your deck with fresh profile order...");
    await loadDiscoverDeck(token, { recycle: true, allowRecycle: false });
  };

  const loadDiscoverDeck = async (
    authToken: string,
    options: { silent?: boolean; recycle?: boolean; allowRecycle?: boolean } = {},
  ) => {
    try {
      const nextCards = await withSessionRecovery((sessionToken) =>
        getDiscoverCards(sessionToken || authToken, getDiscoverQuery({ recycle: options.recycle })),
      );
      if (nextCards.length === 0 && options.allowRecycle && !options.recycle) {
        setStatus("You have exhausted people in your area. Refreshing with new picks...");
        await loadDiscoverDeck(authToken, {
          silent: true,
          recycle: true,
          allowRecycle: false,
        });
        return;
      }

      setCards(nextCards);
      if (nextCards.length === 0) {
        setStatus("No profiles available right now. Try changing filters or refresh.");
      } else if (options.recycle) {
        setStatus("Deck restarted with fresh profile order.");
      }

      if (!options.silent) {
        setError(null);
      }
    } catch (deckError) {
      const message = deckError instanceof Error ? deckError.message : "Failed to load your feed.";
      if (isUnauthorizedMessage(message)) {
        setError("Your session expired. Please log in again.");
        clearSessionAndPromptLogin();
        return;
      }
      setError("We could not load profiles right now. Please refresh or try again shortly.");
    }
  };

  const bootstrapData = async (authToken: string, attempt = 0) => {
    try {
      // Use authToken directly here — bootstrapData is called right after login where
      // the React state for token/refreshToken may still be stale (""). Using the
      // stale state inside withSessionRecovery would trigger premature logouts.
      const nextCards = await getDiscoverCards(authToken, getDiscoverQuery());

      setCards(nextCards);

      const [matchesResult, profileResult, likesResult, verificationResult] = await Promise.allSettled([
        getMatches(authToken),
        getMyProfile(authToken),
        getIncomingLikes(authToken),
        getMyVerificationStatus(authToken),
      ]);

      if (matchesResult.status === "fulfilled") {
        setMatches(matchesResult.value);
      }

      if (profileResult.status === "fulfilled") {
        const me = profileResult.value;
        setProfile(me);
        setCurrentUser(me);
        const hasProfilePhoto = (me.photos?.length ?? 0) > 0;
        if (hasProfilePhoto) {
          markOnboardingCompletedLocally(me.id);
        }
        const completedLocally = hasCompletedOnboardingLocally(me.id);
        setNeedsOnboarding(!hasProfilePhoto && !completedLocally);
        setVerificationStatus(me.verificationStatus ?? "none");
      }

      if (likesResult.status === "fulfilled") {
        setIncomingLikes(likesResult.value.likes);
        setLikesCount(likesResult.value.count);
        setLikesUnlocked(likesResult.value.canViewLikes);
      }

      if (verificationResult.status === "fulfilled") {
        setVerificationStatus(verificationResult.value.verificationStatus);
      }

      const nextMatches = matchesResult.status === "fulfilled" ? matchesResult.value : [];
      if (nextMatches.length > 0) {
        const firstMatchId = nextMatches[0].id;
        setSelectedMatchId(firstMatchId);
        try {
          const initialMessages = await getMessages(authToken, firstMatchId);
          clearMatchChatLock(firstMatchId);
          setMessages(initialMessages);
          await markMessagesRead(authToken, firstMatchId);
        } catch (messageError) {
          const message = messageError instanceof Error ? messageError.message : "Failed to fetch messages";
          if (isChatMembershipLockMessage(message)) {
            setMatchChatLock(firstMatchId, message);
            setMessages([]);
          } else {
            throw messageError;
          }
        }
        setMobileTab("swipe");
      } else {
        setSelectedMatchId(null);
        setMessages([]);
      }
    } catch (loadError) {
      setCards([]);
      setIncomingLikes([]);
      setLikesCount(0);
      setLikesUnlocked(false);
      setMatches([]);
      setMessages([]);
      setChatLockByMatch({});
      setSelectedMatchId(null);
      setProfile(null);
      setCurrentUser(null);
      setVerificationStatus("none");

      const message = loadError instanceof Error ? loadError.message : "Failed to load your feed.";
      if (isUnauthorizedMessage(message)) {
        setError("Your session expired. Please log in again.");
        clearSessionAndPromptLogin();
        return;
      }

      // Retry once after 2 s to handle Vercel cold starts and mobile network blips.
      if (attempt === 0) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 2000));
        return bootstrapData(authToken, 1);
      }

      setError("We could not load your feed right now. Please refresh or try again shortly.");
      setHasBootstrapped(true);
      return;
    }
    setHasBootstrapped(true);
  };

  useEffect(() => {
    const savedAccess = localStorage.getItem("ul_access_token");
    const savedRefresh = localStorage.getItem("ul_refresh_token");
    const savedAppState = localStorage.getItem("ul_app_state");
    if (savedAccess) setToken(savedAccess);
    if (savedRefresh) setRefreshToken(savedRefresh);

    if (savedAppState) {
      try {
        const parsed = JSON.parse(savedAppState) as {
          mobileTab?: MobileTab;
          swipeOption?: SwipeOption;
          swipeFilters?: SwipeFilters;
          selectedMatchId?: string | null;
        };
        if (parsed.mobileTab) setMobileTab(parsed.mobileTab);
        if (parsed.swipeOption) setSwipeOption(parsed.swipeOption);
        if (parsed.swipeFilters) setSwipeFilters(parsed.swipeFilters);
        if (typeof parsed.selectedMatchId === "string" || parsed.selectedMatchId === null) {
          setSelectedMatchId(parsed.selectedMatchId);
        }
      } catch {
        // ignore invalid persisted app state
      }
    }

    const authModeFromQuery = new URLSearchParams(window.location.search).get("auth");
    if (authModeFromQuery === "login" || authModeFromQuery === "signup") {
      if (!savedAccess) {
        setAuthMode(authModeFromQuery);
        setShowAuthForm(true);
      }
      const nextUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", nextUrl || "/");
    }

    const pendingTransition = sessionStorage.getItem("ul_transition_pending");
    if (pendingTransition) {
      sessionStorage.removeItem("ul_transition_pending");
      setIsTransitioning(true);
      window.setTimeout(() => setIsTransitioning(false), 650);
    }

    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const appState = {
      mobileTab,
      swipeOption,
      swipeFilters,
      selectedMatchId,
    };
    localStorage.setItem("ul_app_state", JSON.stringify(appState));
  }, [authReady, mobileTab, selectedMatchId, swipeFilters, swipeOption]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("ul_access_token", token);
    } else {
      localStorage.removeItem("ul_access_token");
    }
  }, [token]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem("ul_refresh_token", refreshToken);
    } else {
      localStorage.removeItem("ul_refresh_token");
    }
  }, [refreshToken]);

  useEffect(() => {
    setHasBootstrapped(false);
  }, [token]);

  useEffect(() => {
    const savedThemeMode = getStoredThemeMode();
    setThemeMode(savedThemeMode);
    applyThemeMode(savedThemeMode);
  }, []);

  useEffect(() => {
    applyThemeMode(themeMode);
    saveThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (themeMode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeMode("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [themeMode]);

  useEffect(() => {
    if (!token || profile || hasBootstrapped) return;
    void bootstrapData(token);
  }, [token, profile, hasBootstrapped]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    void getBillingConfig()
      .then((config) => {
        if (cancelled) return;
        setBillingConfig(config);
      })
      .catch(() => {
        if (cancelled) return;
        setBillingConfig(null);
      });
    return () => {
      cancelled = true;
    };
  }, [authReady]);

  useEffect(() => {
    if (!token || !authReady) return;

    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") ?? params.get("trxref");
    const providerFromQuery = params.get("provider");
    const provider = providerFromQuery === "flutterwave" ? "flutterwave" : undefined;
    const upgradeStatus = params.get("upgrade");

    if (!reference) {
      if (upgradeStatus === "cancelled") {
        setStatus("Payment was cancelled.");
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, "", cleanUrl || "/");
      }
      return;
    }

    let cancelled = false;
    void withSessionRecovery((authToken) => verifyUpgradeCheckout(authToken, reference, provider))
      .then(async (result) => {
        if (cancelled) return;
        const me = await withSessionRecovery((authToken) => getMyProfile(authToken));
        setProfile(me);
        setCurrentUser(me);
        setStatus(`Payment verified via ${result.provider.toUpperCase()}. ${result.tier.toUpperCase()} activated.`);
      })
      .catch((verificationError) => {
        if (cancelled) return;
        const message = verificationError instanceof Error ? verificationError.message : "Unable to verify payment.";
        setError(message);
      })
      .finally(() => {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, "", cleanUrl || "/");
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, token]);

  useEffect(() => {
    if (!token || !profile) return;
    const handle = window.setTimeout(() => {
      void loadDiscoverDeck(token, { silent: true });
    }, 180);
    return () => window.clearTimeout(handle);
  }, [
    token,
    profile,
    swipeOption,
    swipeFilters.distance,
    swipeFilters.ageRange,
    swipeFilters.intent,
    swipeFilters.verifiedOnly,
  ]);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);

    const normalizedEmail = email.normalize("NFKC").trim().toLowerCase();
    const normalizedPassword = password.normalize("NFKC");
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    if (!normalizedPassword.trim()) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const auth =
        authMode === "login"
          ? await login(normalizedEmail, normalizedPassword)
          : await signup({
              email: normalizedEmail,
              password: normalizedPassword,
              firstName,
              age: Number(ageInput) || 18,
              city,
            });

      setCards([]);
      setIncomingLikes([]);
      setLikesCount(0);
      setLikesUnlocked(false);
      setMatches([]);
      setMessages([]);
      setChatLockByMatch({});
      setTypingByMatch({});
      setSelectedMatchId(null);
      setProfile(null);
      setNeedsOnboarding(false);
      setBillingConfig(null);
      setHasBootstrapped(false);
      localStorage.removeItem("ul_app_state");

      setToken(auth.accessToken);
      setRefreshToken(auth.refreshToken);
      setCurrentUser(auth.user);
      setShowAuthForm(false);
      localStorage.setItem("ul_access_token", auth.accessToken);
      localStorage.setItem("ul_refresh_token", auth.refreshToken);
      setStatus(`Welcome back, ${auth.user.firstName}. Ready for something special?`);
      if (authMode === "signup") {
        // Open onboarding immediately after signup; defer full bootstrap until after profile completion.
        setProfile(auth.user);
        setNeedsOnboarding(true);
      } else {
        await bootstrapData(auth.accessToken);
      }
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : "We could not sign you in right now. Please check your details and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // Scaffold: prompt for an ID token for now. Replace with Google
      // Identity Services flow in production.
      const idToken = window.prompt("Paste a Google ID token (scaffold).\n(Use Google Identity on client later)");
      if (!idToken) {
        setError("No Google ID token provided.");
        return;
      }

      const auth = await googleLogin(idToken.trim());

      setCards([]);
      setIncomingLikes([]);
      setLikesCount(0);
      setLikesUnlocked(false);
      setMatches([]);
      setMessages([]);
      setChatLockByMatch({});
      setTypingByMatch({});
      setSelectedMatchId(null);
      setProfile(null);
      setNeedsOnboarding(false);
      setBillingConfig(null);
      setHasBootstrapped(false);
      localStorage.removeItem("ul_app_state");

      setToken(auth.accessToken);
      setRefreshToken(auth.refreshToken);
      setCurrentUser(auth.user);
      setShowAuthForm(false);
      localStorage.setItem("ul_access_token", auth.accessToken);
      localStorage.setItem("ul_refresh_token", auth.refreshToken);
      setStatus(`Welcome back, ${auth.user.firstName}. Ready for something special?`);
      await bootstrapData(auth.accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const openAuthForm = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuthForm(true);
  };

  const handleLogout = () => {
    if (token && refreshToken) {
      void logout(token, refreshToken);
    }
    resetClientSessionState({
      showAuthForm: false,
      statusMessage: "Signed out.",
    });
  };

  const handleRefresh = async () => {
    if (!refreshToken) return;
    try {
      const refreshed = await refreshAccessToken(refreshToken);
      setToken(refreshed.accessToken);
      setCurrentUser(refreshed.user);
      await loadDiscoverDeck(refreshed.accessToken, { silent: true });
      setStatus("You are all set. Session refreshed.");
    } catch {
      setError("Session refresh failed. Please login again.");
      handleLogout();
    }
  };

  useEffect(() => {
    if (!token) return;

    const source = openMessageStream(
      token,
      (payload) => {
        if (payload.matchId === selectedMatchId) {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === payload.message.id)) {
              return prev;
            }
            return [...prev, payload.message];
          });
        }
        void withSessionRecovery((authToken) => getMatches(authToken))
          .then(setMatches)
          .catch(() => {
            // Non-blocking realtime refresh
          });
      },
      (typingPayload) => {
        setTypingByMatch((prev) => ({
          ...prev,
          [typingPayload.matchId]: typingPayload.isTyping ? typingPayload.byName : null,
        }));
      },
      () => {
        streamFailureCountRef.current = 0;
      },
      () => {
        handleStreamFailure();
      },
    );

    return () => source.close();
  }, [token, selectedMatchId, streamRetryTick]);

  useEffect(() => {
    if (!token) return;
    streamFailureCountRef.current = 0;
  }, [token]);

  useEffect(() => {
    if (!selectedMatchId) {
      if (matches.length > 0) {
        setSelectedMatchId(matches[0].id);
      }
      return;
    }

    if (matches.length === 0) {
      setSelectedMatchId(null);
      setMessages([]);
    }
  }, [matches, selectedMatchId]);

  useEffect(() => {
    if (!token || !selectedMatchId || selectedChatLockReason) return;
    if (!matches.some((match) => match.id === selectedMatchId)) return;

    const poller = window.setInterval(() => {
      void withSessionRecovery((authToken) => getMessages(authToken, selectedMatchId))
        .then((nextMessages) => {
          clearMatchChatLock(selectedMatchId);
          setMessages((prev) => mergeMessagesKeepingRecentLocal(prev, nextMessages, currentUser?.id ?? profile?.id ?? null));
        })
        .catch((pollError) => {
          const message = pollError instanceof Error ? pollError.message : "";
          if (isChatMembershipLockMessage(message)) {
            setMatchChatLock(selectedMatchId, message);
            setMessages([]);
          }
          // stream remains primary channel, polling is fallback only
        });
    }, 6000);

    return () => window.clearInterval(poller);
  }, [token, selectedMatchId, refreshToken, selectedChatLockReason, currentUser?.id, profile?.id]);

  const handleSelectMatch = async (matchId: string) => {
    if (!token) return;
    setSelectedMatchId(matchId);
    setMobileTab("chat");
    try {
      const nextMessages = await withSessionRecovery((authToken) => getMessages(authToken, matchId));
      clearMatchChatLock(matchId);
      setMessages(nextMessages);
      await withSessionRecovery((authToken) => markMessagesRead(authToken, matchId));
      const nextMatches = await withSessionRecovery((authToken) => getMatches(authToken));
      setMatches(nextMatches);
    } catch (matchError) {
      const message = matchError instanceof Error ? matchError.message : "Could not load messages. Please try again.";
      if (isChatMembershipLockMessage(message)) {
        setMatchChatLock(matchId, message);
        setMessages([]);
        setStatus(message);
        return;
      }
      setError(message);
      if (isUnauthorizedMessage(message)) {
        clearSessionAndPromptLogin();
      }
    }
  };

  const handleSwipeOptionChange = (option: SwipeOption) => {
    setSwipeOption(option);
    if (option === "boost") {
      setStatus("Boost mode on. Your profile is now prioritized.");
      return;
    }
    if (option === "passport") {
      setStatus("Passport mode enabled. Explore outside your city.");
      return;
    }
    if (option === "nearby") {
      setStatus("Nearby mode active. Prioritizing the closest matches.");
      return;
    }
    setStatus("For You mode active. Personalized picks are prioritized.");
  };

  const handleSwipeFilterChange = (next: SwipeFilters) => {
    setSwipeFilters(next);
    setStatus(`Filters updated: ${next.distance}, ${next.ageRange}, ${next.intent}${next.verifiedOnly ? ", verified only" : ""}.`);
  };

  const laneToIntent = (lane: ExploreLane): SwipeFilters["intent"] => {
    if (lane === "short-term") return "Casual";
    if (lane === "serious") return "Serious";
    return "Long-term";
  };

  const activeExploreLane: ExploreLane =
    swipeFilters.intent === "Casual"
      ? "short-term"
      : swipeFilters.intent === "Long-term"
        ? "long-term"
        : "serious";

  const handleSelectExploreLane = (lane: ExploreLane) => {
    const nextIntent = laneToIntent(lane);
    setSwipeFilters((prev) => ({ ...prev, intent: nextIntent }));
    setMobileTab("swipe");
    setStatus(`Explore lane selected: ${nextIntent}. Showing matching registered users now.`);
  };

  const handleSendMessage = async (text: string) => {
    if (!token || !selectedMatchId) return;
    if (selectedChatLockReason) {
      setStatus(selectedChatLockReason);
      return;
    }
    try {
      const sent = await withSessionRecovery((authToken) => sendMessage(authToken, selectedMatchId, text));
      clearMatchChatLock(selectedMatchId);
      setMessages((prev) => (prev.some((item) => item.id === sent.id) ? prev : [...prev, sent]));
      const nextMatches = await withSessionRecovery((authToken) => getMatches(authToken));
      setMatches(nextMatches);
    } catch (messageError) {
      const message = messageError instanceof Error ? messageError.message : "Message could not be sent. Please try again.";
      if (isChatMembershipLockMessage(message)) {
        setMatchChatLock(selectedMatchId, message);
        setStatus(message);
        return;
      }
      setError(message);
    }
  };

  const handleTypingChange = async (isTyping: boolean) => {
    if (!token || !selectedMatchId) return;
    if (selectedChatLockReason) return;
    try {
      await withSessionRecovery((authToken) => sendTyping(authToken, selectedMatchId, isTyping));
    } catch {
      // Typing indicators are best-effort; swallow silently
    }
  };

  const handleUpgrade = async (plan: PaidMembershipTier, selectedProvider?: BillingProvider) => {
    if (!token) return;

    let checkoutWindow: Window | null = null;

    try {
      // Open a browser window early so mobile browsers don't block the payment redirect.
      checkoutWindow = window.open("", "_blank", "noopener,noreferrer");
      if (checkoutWindow) {
        checkoutWindow.document.title = "Opening secure checkout...";
        checkoutWindow.document.body.innerHTML = "<p style='font-family:system-ui;padding:20px'>Opening secure checkout...</p>";
      }

      const config = billingConfig;

      if (config && !config.checkoutConfigured) {
        if (checkoutWindow) {
          checkoutWindow.close();
          checkoutWindow = null;
        }
        const missing = config.checkoutMissing?.length ? ` Missing: ${config.checkoutMissing.join(", ")}.` : "";
        setError(`Checkout is not configured on the server.${missing}`);
        return;
      }

      let provider: BillingProvider | undefined;
      if (selectedProvider === "flutterwave") {
        provider = selectedProvider;
      } else {
        provider = config?.provider;
      }

      const checkout = await withSessionRecovery((authToken) => createUpgradeCheckout(authToken, plan, provider));
      if (checkout.checkoutUrl) {
        if (checkoutWindow && !checkoutWindow.closed) {
          checkoutWindow.location.href = checkout.checkoutUrl;
          checkoutWindow.focus();
        } else {
          window.location.href = checkout.checkoutUrl;
        }
        return;
      }

      if (checkoutWindow) {
        checkoutWindow.close();
        checkoutWindow = null;
      }

      setStatus("Checkout created, but no redirect URL returned.");
    } catch (upgradeError) {
      if (checkoutWindow) {
        checkoutWindow.close();
        checkoutWindow = null;
      }
      const message = upgradeError instanceof Error ? upgradeError.message : "Unable to start upgrade checkout right now.";
      setError(message);
    }
  };

  const handleSaveProfile = async (input: Partial<PublicUser>) => {
    if (!token) return;
    try {
      const updated = await withSessionRecovery((authToken) => updateMyProfile(authToken, input));
      setProfile(updated);
      setCurrentUser(updated);
      setStatus("Profile updated.");
    } catch {
      setError("Could not save profile. Please try again.");
    }
  };

  const handleRequestVerification = async (photoUrl: string) => {
    if (!token) return;
    try {
      const result = await withSessionRecovery((authToken) => requestProfileVerification(authToken, photoUrl));
      setVerificationStatus(result.status);
      setStatus(result.message);
      const me = await withSessionRecovery((authToken) => getMyProfile(authToken));
      setProfile(me);
      setCurrentUser(me);
    } catch {
      setError("Verification request failed. Please try again.");
    }
  };

  const onSwipe = async (type: "like" | "skip" | "super_like") => {
    if (!activeCard || !token) return;
    if (swipingCardIdRef.current === activeCard.id) return;

    const swipedCard = activeCard;
    const swipedId = swipedCard.id;
    const swipedName = swipedCard.firstName;
    const previousCount = cards.length;

    // Optimistic: remove the card and release the UI lock immediately.
    // The API call fires in the background — next card is swipeable right away.
    swipingCardIdRef.current = swipedId;
    setError(null);
    setCards((prev) => prev.slice(1));
    if (type === "like") setStatus(`Liked ${swipedName}. Keep swiping for a match.`);
    if (type === "super_like") setStatus(`Super liked ${swipedName}. Fingers crossed.`);
    if (type === "skip") setStatus(`Passed on ${swipedName}.`);
    swipingCardIdRef.current = null; // unblock for next card

    try {
      const response = await withSessionRecovery((authToken) => sendSwipe(authToken, swipedId, type));
      if (response.match) {
        setStatus(`It's a match with ${swipedName}. Jump into chat and say hello.`);
        // Fetch matches + likes in parallel instead of sequentially.
        const [nextMatches, nextLikes] = await Promise.all([
          withSessionRecovery((authToken) => getMatches(authToken)),
          withSessionRecovery((authToken) => getIncomingLikes(authToken)),
        ]);
        setMatches(nextMatches);
        setIncomingLikes(nextLikes.likes);
        setLikesCount(nextLikes.count);
        setLikesUnlocked(nextLikes.canViewLikes);

        setSelectedMatchId(response.match.id);
        setMobileTab("chat");
        try {
          const nextMessages = await withSessionRecovery((authToken) => getMessages(authToken, response.match!.id));
          clearMatchChatLock(response.match.id);
          setMessages(nextMessages);
          await withSessionRecovery((authToken) => markMessagesRead(authToken, response.match!.id));
        } catch (messageError) {
          const message = messageError instanceof Error ? messageError.message : "Could not load messages for this match.";
          if (isChatMembershipLockMessage(message)) {
            setMatchChatLock(response.match.id, message);
            setMessages([]);
            setStatus(message);
          } else {
            throw messageError;
          }
        }
      }

      if (previousCount <= 1) {
        const refreshedToken = await withSessionRecovery(async (authToken) => authToken);
        await loadDiscoverDeck(refreshedToken, { silent: true, allowRecycle: true });
      }
    } catch (swipeError) {
      // On API failure, restore the card so the user can retry.
      setCards((prev) => [swipedCard, ...prev]);
      setStatus("");
      const message = swipeError instanceof Error ? swipeError.message : "";
      if (isUnauthorizedMessage(message)) {
        setError("Your session expired. Please log in again.");
        clearSessionAndPromptLogin();
      } else {
        setError("Your swipe did not save. Please try once more.");
      }
    }
  };

  if (!authReady) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0f1019] text-white">
        {splashOverlay}
      </div>
    );
  }

  if (!isAuthenticated && !showAuthForm) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0f1019] text-white">
        {splashOverlay}
        {processingOverlay}
        <Image
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&q=50"
          alt="Landing background"
          fill
          priority
          sizes="100vw"
          className="pointer-events-none absolute inset-0 object-cover opacity-30"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#140c22]/68 via-[#1a1230]/62 to-[#120f21]/88" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,97,138,0.42),transparent_44%),radial-gradient(circle_at_82%_22%,rgba(255,164,120,0.24),transparent_38%),radial-gradient(circle_at_50%_90%,rgba(116,93,190,0.2),transparent_45%)]" />

        <div
          className="relative z-[70] border-b border-white/15 bg-[linear-gradient(180deg,rgba(22,16,36,0.88)_0%,rgba(22,16,36,0.66)_100%)] backdrop-blur-xl pointer-events-auto"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="romance-gradient grid h-10 w-10 place-items-center rounded-full text-base font-bold text-white">❤</span>
            <h1 className="leading-none">
              <span className="text-2xl font-black tracking-tight text-white md:text-3xl">
                Unique
              </span>{" "}
              <span className="text-2xl font-semibold uppercase tracking-[0.06em] text-white md:text-3xl">
                Levi&apos;s
              </span>
            </h1>
          </div>

          <nav className="hidden items-center gap-7 text-base font-semibold text-white/90 md:flex">
            <a href="#landing-products" className="tap-feedback rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white">{copy.navProducts}</a>
            <a href="#landing-learn" className="tap-feedback rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white">{copy.navLearn}</a>
            <a href="#landing-safety" className="tap-feedback rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white">{copy.navSafety}</a>
            <a href="#landing-download" className="tap-feedback rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white">{copy.navDownload}</a>
          </nav>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLanguageMenu((prev) => !prev)}
              className="hidden rounded-full border border-white/55 bg-white/10 px-3 py-1 text-sm font-semibold text-white transition hover:bg-white/20 md:inline-flex"
            >
              {selectedLanguage}
            </button>
            {showLanguageMenu && (
              <div className="absolute right-20 top-11 z-50 w-40 rounded-xl border border-white/25 bg-[#1f1a33]/95 p-1.5 shadow-[0_14px_28px_rgba(0,0,0,0.35)] backdrop-blur">
                {languageOptions.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLanguageMenu(false);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedLanguage === lang ? "bg-white/20 text-white" : "text-white/85 hover:bg-white/10"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => beginLandingTransition(() => openAuthForm("login"))}
              className="tap-feedback relative z-[80] rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#1b1730]"
            >
              {copy.login}
            </button>
          </div>
        </header>
        </div>

        <main className="relative z-20 mx-auto w-full max-w-6xl px-4 pb-16 text-center md:px-8">
          {/* Hero — profile cards flanking centre text */}
          <section className="relative flex min-h-[calc(100vh-84px)] flex-col items-center justify-center lg:block">

            {/* Mobile: auto-scrolling marquee card strip */}
            {(() => {
              const mobileCards = [
                { src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=320&q=60", name: "Sofia, 24", loc: "Lagos ✦ 2 km" },
                { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=320&q=60", name: "Zara, 23", loc: "Port Harcourt ✦ 1 km" },
                { src: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=320&q=60", name: "Chioma, 25", loc: "Enugu ✦ 3 km" },
                { src: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=320&q=60", name: "Amara, 26", loc: "Abuja ✦ 5 km" },
                { src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=320&q=60", name: "Tolu, 22", loc: "Ibadan ✦ 4 km" },
                { src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=320&q=60", name: "Ngozi, 27", loc: "Benin ✦ 6 km" },
              ];
              const doubled = [...mobileCards, ...mobileCards];
              return (
                <div className="pointer-events-none mb-6 w-full overflow-hidden lg:hidden" aria-hidden="true">
                  <div className="card-marquee gap-3 px-2">
                    {doubled.map((p, i) => (
                      <div key={i} className="relative mr-3 h-52 w-36 flex-shrink-0 overflow-hidden rounded-2xl border border-white/20 shadow-[0_16px_32px_rgba(0,0,0,0.5)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 text-left">
                          <p className="text-xs font-bold text-white">{p.name}</p>
                          <p className="text-[9px] text-white/70">{p.loc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Desktop: left floating cards */}
            <div className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 flex-col gap-4 lg:flex" aria-hidden="true">
              <div className="relative h-72 w-48 overflow-hidden rounded-3xl border-2 border-white/20 shadow-[0_24px_50px_rgba(0,0,0,0.5)] rotate-[-5deg] translate-x-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=60" alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-left">
                  <p className="text-sm font-bold text-white">Sofia, 24</p>
                  <p className="text-[10px] text-white/75">Lagos ✦ 2 km away</p>
                </div>
              </div>
              <div className="relative h-60 w-44 overflow-hidden rounded-3xl border-2 border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.45)] rotate-[3deg] translate-x-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=360&q=60" alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-left">
                  <p className="text-sm font-bold text-white">Amara, 26</p>
                  <p className="text-[10px] text-white/75">Abuja ✦ 5 km away</p>
                </div>
              </div>
            </div>

            {/* Centre text */}
            <div className="relative z-10 px-2 text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff4f7a] shadow-[0_0_6px_2px_rgba(255,79,122,0.7)]"></span>
                10,000+ active today
              </div>
              <h2 className="bg-gradient-to-r from-white via-[#ffd4df] to-[#ffc0ac] bg-clip-text text-5xl leading-[0.95] tracking-tight text-transparent md:text-7xl">
                {copy.heroTitleTop}
                <br />
                {copy.heroTitleBottom}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm text-white/85 md:text-base">
                {copy.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => beginLandingTransition(() => openAuthForm("signup"))}
                  className="tap-feedback romance-gradient w-full rounded-full px-9 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(255,79,122,0.38)] sm:w-auto"
                >
                  {copy.ctaCreate}
                </button>
                <button
                  type="button"
                  onClick={() => beginLandingTransition(() => openAuthForm("login"))}
                  className="tap-feedback w-full rounded-full border border-white/55 bg-white/10 px-9 py-3 text-sm font-semibold text-white backdrop-blur sm:w-auto"
                >
                  {copy.ctaExisting}
                </button>
                <button
                  type="button"
                  onClick={() => beginLandingTransition(() => handleGoogleSignIn())}
                  className="mt-3 w-full rounded-full border border-white/20 bg-white/8 px-6 py-2 text-sm font-semibold text-white sm:mt-0 sm:ml-3 sm:w-auto"
                >
                  Sign in with Google
                </button>
              </div>
            </div>

            {/* Desktop: right floating cards */}
            <div className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 flex-col gap-4 lg:flex" aria-hidden="true">
              <div className="relative h-72 w-48 overflow-hidden rounded-3xl border-2 border-white/20 shadow-[0_24px_50px_rgba(0,0,0,0.5)] rotate-[5deg] -translate-x-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=60" alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-left">
                  <p className="text-sm font-bold text-white">Zara, 23</p>
                  <p className="text-[10px] text-white/75">Port Harcourt ✦ 1 km</p>
                </div>
              </div>
              <div className="relative h-60 w-44 overflow-hidden rounded-3xl border-2 border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.45)] rotate-[-3deg] -translate-x-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=360&q=60" alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-left">
                  <p className="text-sm font-bold text-white">Chioma, 25</p>
                  <p className="text-[10px] text-white/75">Enugu ✦ 3 km away</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mb-5 grid w-full max-w-5xl gap-3 md:grid-cols-3">
            <article className="overflow-hidden rounded-3xl border border-white/20 bg-[#161226]/72 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              <div className="relative h-52 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=380&q=50"
                  alt="Dating success story"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-left">
                <p className="text-sm font-semibold text-white">Curated Matches</p>
                <p className="mt-1 text-xs text-white/75">Every swipe is tuned to your vibe and intent.</p>
              </div>
            </article>

            <article className="overflow-hidden rounded-3xl border border-white/20 bg-[#161226]/72 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              <div className="relative h-52 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=380&q=50"
                  alt="Live conversation preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-left">
                <p className="text-sm font-semibold text-white">Live Conversations</p>
                <p className="mt-1 text-xs text-white/75">Chat instantly once you both like.</p>
              </div>
            </article>

            <article className="overflow-hidden rounded-3xl border border-white/20 bg-[#161226]/72 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              <div className="relative h-52 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=380&q=50"
                  alt="Premium profile preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-left">
                <p className="text-sm font-semibold text-white">Verified Profiles</p>
                <p className="mt-1 text-xs text-white/75">Trust-first community with smarter moderation.</p>
              </div>
            </article>
          </section>

          <section id="landing-products" className="mx-auto mb-5 w-full max-w-5xl scroll-mt-24 rounded-3xl border border-white/20 bg-[#161226]/72 p-5 text-left shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Products</p>
            <h3 className="mt-2 text-2xl text-white md:text-3xl">Everything You Need To Connect</h3>
            <div className="relative mt-4 h-48 w-full overflow-hidden rounded-2xl border border-white/10 md:h-56">
              <Image
                src="https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=420&q=50"
                alt="People connecting in a social space"
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-sm font-semibold text-white">Smart Discover</p>
                <p className="mt-1 text-xs text-white/75">Profiles ranked by chemistry and intent.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-sm font-semibold text-white">Instant Match</p>
                <p className="mt-1 text-xs text-white/75">Mutual likes unlock messaging right away.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-sm font-semibold text-white">Live Chat</p>
                <p className="mt-1 text-xs text-white/75">Realtime conversation with typing indicators.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-sm font-semibold text-white">Verification</p>
                <p className="mt-1 text-xs text-white/75">Trust badges and moderation workflows.</p>
              </div>
            </div>
          </section>

          <section id="landing-learn" className="mx-auto mb-5 w-full max-w-5xl scroll-mt-24 rounded-3xl border border-white/20 bg-[#161226]/72 p-5 text-left shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Learn</p>
            <h3 className="mt-2 text-2xl text-white md:text-3xl">How It Works</h3>
            <div className="relative mt-4 h-44 w-full overflow-hidden rounded-2xl border border-white/10 md:h-52">
              <Image
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=420&q=50"
                alt="Couple enjoying a date"
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
            <ol className="mt-4 grid gap-3 text-sm text-white/85 md:grid-cols-3">
              <li className="rounded-2xl border border-white/10 bg-white/10 p-3">1. Build your profile in under a minute.</li>
              <li className="rounded-2xl border border-white/10 bg-white/10 p-3">2. Swipe through people that match your vibe.</li>
              <li className="rounded-2xl border border-white/10 bg-white/10 p-3">3. Match and start conversations instantly.</li>
            </ol>
          </section>

          <section id="landing-safety" className="mx-auto mb-5 w-full max-w-5xl scroll-mt-24 rounded-3xl border border-white/20 bg-[#161226]/72 p-5 text-left shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Safety</p>
            <h3 className="mt-2 text-2xl text-white md:text-3xl">Safety First, Always</h3>
            <div className="relative mt-4 h-44 w-full overflow-hidden rounded-2xl border border-white/10 md:h-52">
              <Image
                src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=420&q=50"
                alt="Trust and safety visual"
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
            <ul className="mt-4 grid gap-3 text-sm text-white/85 md:grid-cols-3">
              <li className="rounded-2xl border border-white/10 bg-white/10 p-3">Easy profile and message reporting tools.</li>
              <li className="rounded-2xl border border-white/10 bg-white/10 p-3">Admin review for verification and abuse handling.</li>
              <li className="rounded-2xl border border-white/10 bg-white/10 p-3">Privacy-aware settings to control your visibility.</li>
            </ul>
          </section>

          <section id="landing-download" className="mx-auto w-full max-w-5xl scroll-mt-24 rounded-3xl border border-white/20 bg-[#161226]/72 p-5 text-left shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Download</p>
            <h3 className="mt-2 text-2xl text-white md:text-3xl">Start On Web, Continue Anywhere</h3>
            <div className="relative mt-4 h-44 w-full overflow-hidden rounded-2xl border border-white/10 md:h-52">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=420&q=50"
                alt="People using app across devices"
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-sm text-white/85">Use Unique Levi&apos;s in your browser now, with mobile app releases coming soon.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => beginLandingTransition(() => openAuthForm("signup"))}
                className="tap-feedback romance-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => beginLandingTransition(() => openAuthForm("login"))}
                className="tap-feedback rounded-full border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Log in
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    const authErrorContent = error ? getAuthErrorContent(error, authMode) : null;

    return (
      <div className="relative min-h-screen overflow-hidden bg-[var(--color-primary)]">
        {splashOverlay}
        {/* Modern sticky header */}
        <div className="sticky top-0 z-50 border-b border-white/8 bg-gradient-to-r from-[#17142a]/95 via-[#1a1430]/95 to-[#17142a]/95 px-4 py-3.5 backdrop-blur-md shadow-lg">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAuthForm(false)}
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/8 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/12 active:scale-95 touch-action-manipulation"
            >
              <span className="text-base leading-none">←</span>
              <span>Home</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="romance-gradient grid h-6 w-6 place-items-center rounded-full text-xs font-bold text-white shadow-sm">❤</span>
              <h1 className="text-lg font-black tracking-tight text-white">
                Unique Levi&apos;s
              </h1>
            </div>
            <div className="w-16" />
          </div>
        </div>
        <div className="auth-orb auth-orb-1" aria-hidden="true" />
        <div className="auth-orb auth-orb-2" aria-hidden="true" />
        <div className="auth-orb auth-orb-3" aria-hidden="true" />
        <div className="auth-grid-glow" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0f0a20]/78 via-[#201433]/74 to-[#1f122f]/80" />

        <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-8 md:px-6">
          <div className="glass-card auth-form w-full max-w-md rounded-3xl p-6 md:p-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6b7280]">
              Welcome Back
            </p>
            <h2 className="text-4xl font-black text-[var(--color-primary)]">Unique Levi&apos;s</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Let&apos;s get you in and help you meet someone amazing.</p>

            <div className="mt-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs text-[var(--color-text-muted)]">
              {authMode === "login"
                ? "Login tip: enter the same email and password you used when creating your account."
                : "Sign up tip: any password is allowed, including symbols and spaces."}
            </div>

            <div className="mt-5 mb-4 flex gap-2">
              <button
                onClick={() => setAuthMode("login")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  authMode === "login"
                    ? "romance-gradient text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-primary)]"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  authMode === "signup"
                    ? "romance-gradient text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-primary)]"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 md:col-span-1">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-primary)]">Email Address</span>
                <input
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                />
              </label>
              <label className="space-y-1 md:col-span-1">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-primary)]">Password</span>
                <div className="relative">
                  <input
                    className="input pr-16"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete={authMode === "login" ? "current-password" : "new-password"}
                    placeholder={authMode === "login" ? "Enter your password" : "Any password you choose"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-elevated)]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
              {authMode === "signup" && (
                <>
                  <label className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-primary)]">First Name</span>
                    <input
                      className="input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Levi"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-primary)]">City</span>
                    <input
                      className="input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lagos"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-primary)]">Age</span>
                    <input
                      className="input"
                      value={ageInput}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setAgeInput(v);
                      }}
                      inputMode="numeric"
                      placeholder="Your age (18–80)"
                    />
                  </label>
                </>
              )}
            </div>

            <p className="mt-3 text-xs text-[#6b7280]">
              {authMode === "login"
                ? "If you are new here, switch to Sign Up first."
                : "By signing up, you will enter Discover immediately after creating your account."}
            </p>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="romance-gradient mt-4 w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-70"
            >
              {loading ? "Please wait..." : authMode === "login" ? "Enter" : "Create Account"}
            </button>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-3 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-primary)]"
            >
              Sign in with Google (scaffold)
            </button>

            {authErrorContent && (
              <div className="auth-alert mt-4" data-tone={authErrorContent.tone} role="alert" aria-live="polite">
                <div className="auth-alert__badge" aria-hidden="true">
                  {authErrorContent.tone === "warning" ? "!" : "x"}
                </div>
                <div className="min-w-0">
                  <p className="auth-alert__title">{authErrorContent.title}</p>
                  <p className="auth-alert__message">{authErrorContent.description}</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] md:pb-0" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)" }}>
            {needsOnboarding && token && profile && (
              <OnboardingFlow
                token={token}
                profile={profile}
                onComplete={(updated) => {
                  markOnboardingCompletedLocally(updated.id);
                  setProfile(updated);
                  setCurrentUser(updated);
                  setNeedsOnboarding(false);
                  void bootstrapData(token);
                }}
              />
            )}
            {/* Decorative blurred background collage */}
      {/* Decorative blurred background collage */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
          <div className="relative col-span-1 row-span-1 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=420&q=50" alt="" fill sizes="34vw" className="object-cover" />
          </div>
          <div className="relative col-span-1 row-span-2 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=420&q=50" alt="" fill sizes="34vw" className="object-cover" />
          </div>
          <div className="relative col-span-1 row-span-1 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=420&q=50" alt="" fill sizes="34vw" className="object-cover" />
          </div>
          <div className="relative col-span-1 row-span-1 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=420&q=50" alt="" fill sizes="34vw" className="object-cover" />
          </div>
          <div className="relative col-span-1 row-span-1 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=420&q=50" alt="" fill sizes="34vw" className="object-cover" />
          </div>
        </div>
        {/* Heavy blur + tint overlay */}
        <div className="absolute inset-0 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-[color-mix(in_oklab,var(--color-surface-elevated)_82%,transparent)] via-[color-mix(in_oklab,var(--color-surface)_78%,transparent)] to-[color-mix(in_oklab,var(--color-bg)_86%,transparent)]" />
      </div>

      {splashOverlay}
      <NavBar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onSearch={() => {
          setMobileTab("explore");
          setStatus("Explore opened. Use filters to find better matches quickly.");
        }}
      />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-3 py-4 md:px-6 md:py-6">
        <section className="mb-4 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface-elevated)_88%,transparent)] px-4 py-3 shadow-[0_10px_25px_rgba(27,23,48,0.08)] backdrop-blur-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Discover</p>
            <h2 className="text-xl text-[var(--color-primary)] md:text-2xl">Swipe, Explore, Match</h2>
          </div>
          <button
            onClick={handleRefresh}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
          >
            Refresh
          </button>
        </section>

        <div className="hidden gap-5 md:grid md:grid-cols-[320px_minmax(360px,460px)_1fr] md:items-start md:justify-center">
          <section className="space-y-4">
            <ProfileInsights profile={profile} />
            <ProfileEditor
              profile={profile}
              isLoadingProfile={Boolean(token) && !profile && !hasBootstrapped}
              onSave={handleSaveProfile}
              verificationStatus={verificationStatus}
              onRequestVerification={handleRequestVerification}
            />
            <GeneralSettings themeMode={themeMode} onChangeThemeMode={setThemeMode} />
          </section>

          {/* Preload the next 2 card photos so they're ready before the user swipes */}
          {cards.slice(1, 3).map((c) => c.photos[0]).filter(Boolean).map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url!} alt="" aria-hidden fetchPriority="low" style={{ display: "none" }} />
          ))}

          <section className="mx-auto w-full space-y-3">
              <div style={{ height: 660 }}>
              {activeCard ? (
              <SwipeCard
                user={activeCard}
                onLike={() => onSwipe("like")}
                onSkip={() => onSwipe("skip")}
                onSuperLike={() => onSwipe("super_like")}
                isBusy={false}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-center shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
                  <p className="mb-3 text-5xl">💔</p>
                  <p className="font-semibold text-[var(--color-primary)]">No more profiles nearby.</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (token) {
                        void loadDiscoverDeck(token, { recycle: true, allowRecycle: false });
                      }
                    }}
                    className="mt-3 romance-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Restart Deck
                  </button>
              </div>
            )}
            </div>
            <SwipeOptionsDock active={swipeOption} onChange={handleSwipeOptionChange} />
            <SwipeFilterDrawer filters={swipeFilters} onChange={handleSwipeFilterChange} />
          </section>

          <div className="space-y-5">
            <ExplorePanel activeLane={activeExploreLane} users={cards} onSelectLane={handleSelectExploreLane} />
            <LikesPanel
              likesCount={likesCount}
              likes={incomingLikes}
              likesUnlocked={likesUnlocked}
              membershipTier={profile?.membershipTier}
              billingConfig={billingConfig}
              onUpgrade={handleUpgrade}
            />
            <MatchesPanel matches={matches} selectedMatchId={selectedMatchId} onSelectMatch={handleSelectMatch} />
            <ChatPanel
              matches={matches}
              selectedMatchId={selectedMatchId}
              onSelectMatch={handleSelectMatch}
              messages={messages}
              currentUserId={currentUser?.id ?? profile?.id ?? null}
              onSend={handleSendMessage}
              isTyping={Boolean(typingName)}
              typingName={typingName}
              onTypingChange={handleTypingChange}
              lockReason={selectedChatLockReason}
            />
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {mobileTab === "swipe" && (
            /* Full-screen swipe overlay — covers viewport above bottom nav */
            <div className="fixed inset-x-0 top-0 z-20 flex flex-col" style={{ bottom: 72 }}>
              {/* Compact mode tabs + deck count */}
              <div className="flex items-center justify-between gap-2 bg-[color-mix(in_oklab,var(--color-surface-elevated)_96%,transparent)] px-3 pb-2 pt-safe-top backdrop-blur" style={{ paddingTop: "max(env(safe-area-inset-top),12px)" }}>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {(["for-you", "nearby", "passport", "boost"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSwipeOptionChange(opt)}
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                        swipeOption === opt
                          ? "romance-gradient text-white shadow-[0_4px_10px_rgba(255,79,122,0.35)]"
                          : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      {opt === "for-you" ? "✨ For You" : opt === "nearby" ? "📍 Nearby" : opt === "passport" ? "🧭 Passport" : "⚡ Boost"}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { void restartDeck(); }}
                  className="shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-primary)]"
                >
                  ↺ {cards.length}
                </button>
              </div>
              {/* Card fills remaining space */}
              <div className="min-h-0 flex-1 px-3 pb-2 pt-1">
                {activeCard ? (
                  <SwipeCard
                    user={activeCard}
                    onLike={() => onSwipe("like")}
                    onSkip={() => onSwipe("skip")}
                    onSuperLike={() => onSwipe("super_like")}
                    isBusy={false}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-center">
                    <p className="mb-3 text-5xl">💔</p>
                    <p className="font-semibold text-[var(--color-primary)]">No more profiles nearby.</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Try changing filters or restart the deck.</p>
                    <button
                      type="button"
                      onClick={() => { if (token) void loadDiscoverDeck(token, { recycle: true, allowRecycle: false }); }}
                      className="mt-4 romance-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Restart Deck
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {mobileTab === "explore" && (
            <ExplorePanel activeLane={activeExploreLane} users={cards} onSelectLane={handleSelectExploreLane} />
          )}

          {mobileTab === "likes" && (
            <>
              <LikesPanel
                likesCount={likesCount}
                likes={incomingLikes}
                likesUnlocked={likesUnlocked}
                membershipTier={profile?.membershipTier}
                billingConfig={billingConfig}
                onUpgrade={handleUpgrade}
              />
              <MatchesPanel matches={matches} selectedMatchId={selectedMatchId} onSelectMatch={handleSelectMatch} />
            </>
          )}

          {mobileTab === "chat" && (
            <>
              <MatchesPanel matches={matches} selectedMatchId={selectedMatchId} onSelectMatch={handleSelectMatch} />
              <ChatPanel
                matches={matches}
                selectedMatchId={selectedMatchId}
                onSelectMatch={handleSelectMatch}
                messages={messages}
                currentUserId={currentUser?.id ?? profile?.id ?? null}
                onSend={handleSendMessage}
                isTyping={Boolean(typingName)}
                typingName={typingName}
                onTypingChange={handleTypingChange}
                lockReason={selectedChatLockReason}
              />
            </>
          )}

          {mobileTab === "profile" && (
            <>
              <ProfileInsights profile={profile} />
              <ProfileEditor
                profile={profile}
                isLoadingProfile={Boolean(token) && !profile && !hasBootstrapped}
                onSave={handleSaveProfile}
                verificationStatus={verificationStatus}
                onRequestVerification={handleRequestVerification}
              />
              <GeneralSettings themeMode={themeMode} onChangeThemeMode={setThemeMode} />
            </>
          )}

        </div>
      </main>

      <BottomNav activeTab={mobileTab} onTabChange={setMobileTab} likesCount={likesCount} />

      {error && (
        <div className="fixed inset-x-3 bottom-24 z-50 rounded-2xl bg-[#2f1730] px-4 py-3 text-sm text-white shadow-[0_16px_26px_rgba(20,10,25,0.35)] md:bottom-6 md:left-auto md:right-6 md:w-[340px]">
          {error}
        </div>
      )}
    </div>
  );
}
