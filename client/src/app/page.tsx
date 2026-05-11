"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ChatPanel from "@/components/ChatPanel";
import MatchesPanel from "@/components/MatchesPanel";
import NavBar from "@/components/NavBar";
import ProfileEditor from "@/components/ProfileEditor";
import SwipeCard from "@/components/SwipeCard";
import {
  getDiscoverCards,
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
  signup,
  updateMyProfile,
} from "@/lib/api";
import type { DiscoverCard, MatchItem, MessageItem, PublicUser, VerificationStatus } from "@/lib/types";

type AuthMode = "login" | "signup";
type MobileTab = "discover" | "matches" | "messages" | "profile";
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
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [mobileTab, setMobileTab] = useState<MobileTab>("discover");
  const [token, setToken] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [email, setEmail] = useState("ava@example.com");
  const [password, setPassword] = useState("Password123!");
  const [firstName, setFirstName] = useState("Levi");
  const [age, setAge] = useState(24);
  const [city, setCity] = useState("Lagos");
  const [cards, setCards] = useState<DiscoverCard[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [typingByMatch, setTypingByMatch] = useState<Record<string, string | null>>({});
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("none");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Welcome to Unique Levi's. Let's find your person.");
  const [error, setError] = useState<string | null>(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LandingLanguage>("English");

  const activeCard = useMemo(() => cards[0], [cards]);
  const isAuthenticated = token.length > 0;
  const typingName = selectedMatchId ? typingByMatch[selectedMatchId] ?? null : null;
  const hiddenInputStyle = privacyMode
    ? { color: "transparent", caretColor: "var(--color-primary)", textShadow: "none" as const }
    : undefined;
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

  const bootstrapData = async (authToken: string) => {
    const [nextCards, nextMatches, me] = await Promise.all([
      getDiscoverCards(authToken),
      getMatches(authToken),
      getMyProfile(authToken),
    ]);

    setCards(nextCards);
    setMatches(nextMatches);
    setProfile(me);
    setCurrentUser(me);
    setVerificationStatus(me.verificationStatus ?? "none");

    const verify = await getMyVerificationStatus(authToken);
    setVerificationStatus(verify.verificationStatus);

    if (nextMatches.length > 0) {
      const firstMatchId = nextMatches[0].id;
      setSelectedMatchId(firstMatchId);
      const initialMessages = await getMessages(authToken, firstMatchId);
      setMessages(initialMessages);
      await markMessagesRead(authToken, firstMatchId);
      setMobileTab("discover");
    } else {
      setSelectedMatchId(null);
      setMessages([]);
    }
  };

  useEffect(() => {
    const savedAccess = localStorage.getItem("ul_access_token");
    const savedRefresh = localStorage.getItem("ul_refresh_token");
    if (savedAccess) setToken(savedAccess);
    if (savedRefresh) setRefreshToken(savedRefresh);
  }, []);

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
    if (!token || profile) return;
    void bootstrapData(token);
  }, [token, profile]);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const auth =
        authMode === "login"
          ? await login(email, password)
          : await signup({ email, password, firstName, age, city });

      setToken(auth.accessToken);
      setRefreshToken(auth.refreshToken);
      setCurrentUser(auth.user);
      setStatus(`Welcome back, ${auth.user.firstName}. Ready for something special?`);
      await bootstrapData(auth.accessToken);
    } catch {
      setError("We could not sign you in right now. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (token && refreshToken) {
      void logout(token, refreshToken);
    }
    setToken("");
    setRefreshToken("");
    setCurrentUser(null);
    setProfile(null);
    setCards([]);
    setMatches([]);
    setSelectedMatchId(null);
    setMessages([]);
    setTypingByMatch({});
    setVerificationStatus("none");
    setMobileTab("discover");
    setShowAuthForm(false);
    setStatus("Signed out.");
  };

  const handleRefresh = async () => {
    if (!refreshToken) return;
    try {
      const refreshed = await refreshAccessToken(refreshToken);
      setToken(refreshed.accessToken);
      setCurrentUser(refreshed.user);
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
    setMobileTab("messages");
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

  const handleSaveProfile = async (input: Partial<PublicUser>) => {
    if (!token) return;
    const updated = await updateMyProfile(token, input);
    setProfile(updated);
    setStatus("Profile updated.");
  };

  const handleRequestVerification = async (photoUrl: string) => {
    if (!token) return;
    const result = await requestProfileVerification(token, photoUrl);
    setVerificationStatus(result.status);
    setStatus(result.message);
    const me = await getMyProfile(token);
    setProfile(me);
    setCurrentUser(me);
  };

  const onSwipe = async (type: "like" | "skip" | "super_like") => {
    if (!activeCard || !token) return;

    setError(null);
    const swipedId = activeCard.id;
    setCards((prev) => prev.slice(1));

    try {
      const response = await sendSwipe(token, swipedId, type);
      if (response.match) {
        setStatus("It is a match. Say hello and make it memorable.");
        const nextMatches = await getMatches(token);
        setMatches(nextMatches);
      }

      if (cards.length <= 1) {
        const nextCards = await getDiscoverCards(token);
        setCards(nextCards);
      }
    } catch {
      setError("Your swipe did not save. Please try once more.");
    }
  };

  if (!isAuthenticated && !showAuthForm) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0f1019] text-white">
        {splashOverlay}
        <Image
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=60"
          alt="Landing background"
          fill
          priority
          sizes="100vw"
          className="pointer-events-none absolute inset-0 object-cover opacity-30"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#140c22]/68 via-[#1a1230]/62 to-[#120f21]/88" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,97,138,0.42),transparent_44%),radial-gradient(circle_at_82%_22%,rgba(255,164,120,0.24),transparent_38%),radial-gradient(circle_at_50%_90%,rgba(116,93,190,0.2),transparent_45%)]" />

        <header className="relative z-40 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="romance-gradient grid h-10 w-10 place-items-center rounded-full text-base font-bold text-white">❤</span>
            <h1 className="leading-none">
              <span className="bg-gradient-to-r from-white via-[#ffe2ea] to-[#ffc9ba] bg-clip-text text-2xl font-black tracking-tight text-transparent md:text-3xl">
                Unique
              </span>{" "}
              <span className="text-2xl font-semibold uppercase tracking-[0.06em] text-white md:text-3xl">
                Levi&apos;s
              </span>
            </h1>
          </div>

          <nav className="hidden items-center gap-7 text-base font-semibold text-white/90 md:flex">
            <a href="#landing-products" className="rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white">{copy.navProducts}</a>
            <a href="#landing-learn" className="rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white">{copy.navLearn}</a>
            <a href="#landing-safety" className="rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white">{copy.navSafety}</a>
            <a href="#landing-download" className="rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-white">{copy.navDownload}</a>
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
              onClick={() => {
                setAuthMode("login");
                setShowAuthForm(true);
              }}
              className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#1b1730]"
            >
              {copy.login}
            </button>
          </div>
        </header>

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
                  onClick={() => {
                    setAuthMode("signup");
                    setShowAuthForm(true);
                  }}
                  className="romance-gradient w-full rounded-full px-9 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(255,79,122,0.38)] sm:w-auto"
                >
                  {copy.ctaCreate}
                </button>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthForm(true);
                  }}
                  className="w-full rounded-full border border-white/55 bg-white/10 px-9 py-3 text-sm font-semibold text-white backdrop-blur sm:w-auto"
                >
                  {copy.ctaExisting}
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
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=60"
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
                  src="https://images.unsplash.com/photo-1521119989659-a83eee488004?w=500&q=60"
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
                  src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&q=60"
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
                src="https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=700&q=60"
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
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=60"
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
                src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=700&q=60"
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
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=60"
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
                onClick={() => {
                  setAuthMode("signup");
                  setShowAuthForm(true);
                }}
                className="romance-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setShowAuthForm(true);
                }}
                className="rounded-full border border-white/60 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white"
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
    return (
      <div className="relative min-h-screen overflow-hidden bg-[var(--color-primary)]">
        {splashOverlay}
        {/* Sticky back bar — always reachable on mobile */}
        <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-white/10 bg-[var(--color-primary)]/90 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setShowAuthForm(false)}
            className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
          >
            <span className="text-base leading-none">&#8592;</span> Home
          </button>
          <span className="text-sm font-semibold text-white/70">Unique Levi&apos;s</span>
        </div>
        <div className="auth-orb auth-orb-1" aria-hidden="true" />
        <div className="auth-orb auth-orb-2" aria-hidden="true" />
        <div className="auth-orb auth-orb-3" aria-hidden="true" />
        <div className="auth-grid-glow" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0f0a20]/78 via-[#201433]/74 to-[#1f122f]/80" />

        <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-8 md:px-6">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Welcome Back
            </p>
            <h2 className="text-4xl text-[var(--color-primary)]">Unique Levi&apos;s</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Let&apos;s get you in and help you meet someone amazing.</p>

            <div className="mt-3 rounded-2xl border border-[var(--color-border)] bg-white/75 p-3 text-xs text-[var(--color-text-muted)]">
              {authMode === "login"
                ? "Login tip: enter the same email and password you used when creating your account."
                : "Sign up tip: fill all fields to create your profile. You can edit details later."}
            </div>

            <button
              onClick={() => setShowAuthForm(false)}
              className="mt-4 rounded-full border border-[var(--color-border)] bg-white/60 px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] line-through opacity-40 pointer-events-none select-none"
              aria-hidden="true"
              tabIndex={-1}
            >
              Back to Landing Page
            </button>

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

            <button
              type="button"
              onClick={() => setPrivacyMode((prev) => !prev)}
              className="mb-3 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]"
            >
              Hidden typing: {privacyMode ? "On" : "Off"}
            </button>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 md:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Email Address</span>
                <input
                  className="input"
                  style={hiddenInputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                />
              </label>
              <label className="space-y-1 md:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Password</span>
                <input
                  className="input"
                  style={hiddenInputStyle}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder={authMode === "login" ? "Enter your password" : "At least 8 characters"}
                />
              </label>
              {authMode === "signup" && (
                <>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">First Name</span>
                    <input
                      className="input"
                      style={hiddenInputStyle}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Levi"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">City</span>
                    <input
                      className="input"
                      style={hiddenInputStyle}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lagos"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Age</span>
                    <input
                      className="input"
                      style={hiddenInputStyle}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      min={18}
                      max={80}
                      type="number"
                      placeholder="18 - 80"
                    />
                  </label>
                </>
              )}
            </div>

            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
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

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] pb-22 md:pb-0">
      {/* Decorative blurred background collage */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
          <div className="relative col-span-1 row-span-1 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=700&q=70" alt="" fill sizes="34vw" className="object-cover" />
          </div>
          <div className="relative col-span-1 row-span-2 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700&q=70" alt="" fill sizes="34vw" className="object-cover" />
          </div>
          <div className="relative col-span-1 row-span-1 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=700&q=70" alt="" fill sizes="34vw" className="object-cover" />
          </div>
          <div className="relative col-span-1 row-span-1 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1521119989659-a83eee488004?w=700&q=70" alt="" fill sizes="34vw" className="object-cover" />
          </div>
          <div className="relative col-span-1 row-span-1 overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=700&q=70" alt="" fill sizes="34vw" className="object-cover" />
          </div>
        </div>
        {/* Heavy blur + tint overlay */}
        <div className="absolute inset-0 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-[#f9eef5]/75 to-[#ede8f9]/80" />
      </div>

      {splashOverlay}
      <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-3 py-4 md:px-6 md:py-6">
        <section className="mb-4 flex items-center justify-between rounded-2xl border border-white/45 bg-white/80 px-4 py-3 shadow-[0_10px_25px_rgba(27,23,48,0.08)] backdrop-blur-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Discover</p>
            <h2 className="text-xl text-[var(--color-primary)] md:text-2xl">Swipe Mode</h2>
          </div>
          <button
            onClick={handleRefresh}
            className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
          >
            Refresh
          </button>
        </section>

        <div className="hidden gap-5 md:grid md:grid-cols-[320px_minmax(360px,460px)_1fr] md:items-start md:justify-center">
          <section className="space-y-4">
            <ProfileEditor
              profile={profile}
              onSave={handleSaveProfile}
              verificationStatus={verificationStatus}
              onRequestVerification={handleRequestVerification}
            />
          </section>

          <section className="mx-auto w-full">
            {activeCard ? (
              <SwipeCard
                user={activeCard}
                onLike={() => onSwipe("like")}
                onSkip={() => onSwipe("skip")}
                onSuperLike={() => onSwipe("super_like")}
              />
            ) : (
              <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-text-muted)] shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
                You have reached the end of your current deck.
              </div>
            )}
          </section>

          <div className="space-y-5">
            <MatchesPanel matches={matches} selectedMatchId={selectedMatchId} onSelectMatch={handleSelectMatch} />
            <ChatPanel
              matches={matches}
              selectedMatchId={selectedMatchId}
              onSelectMatch={handleSelectMatch}
              messages={messages}
              currentUserId={currentUser?.id ?? null}
              onSend={handleSendMessage}
              isTyping={Boolean(typingName)}
              typingName={typingName}
              onTypingChange={handleTypingChange}
            />
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {mobileTab === "discover" && (
            <>
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {status}
              </p>
              {activeCard ? (
                <SwipeCard
                  user={activeCard}
                  onLike={() => onSwipe("like")}
                  onSkip={() => onSwipe("skip")}
                  onSuperLike={() => onSwipe("super_like")}
                />
              ) : (
                <div className="rounded-3xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
                  You have reached the end of your current deck.
                </div>
              )}
            </>
          )}

          {mobileTab === "matches" && (
            <MatchesPanel matches={matches} selectedMatchId={selectedMatchId} onSelectMatch={handleSelectMatch} />
          )}

          {mobileTab === "messages" && (
            <ChatPanel
              matches={matches}
              selectedMatchId={selectedMatchId}
              onSelectMatch={handleSelectMatch}
              messages={messages}
              currentUserId={currentUser?.id ?? null}
              onSend={handleSendMessage}
              isTyping={Boolean(typingName)}
              typingName={typingName}
              onTypingChange={handleTypingChange}
            />
          )}

          {mobileTab === "profile" && (
            <ProfileEditor
              profile={profile}
              onSave={handleSaveProfile}
              verificationStatus={verificationStatus}
              onRequestVerification={handleRequestVerification}
            />
          )}
        </div>
      </main>

      <BottomNav activeTab={mobileTab} onTabChange={setMobileTab} />

      {error && (
        <div className="fixed inset-x-3 bottom-24 z-50 rounded-2xl bg-[#2f1730] px-4 py-3 text-sm text-white shadow-[0_16px_26px_rgba(20,10,25,0.35)] md:bottom-6 md:left-auto md:right-6 md:w-[340px]">
          {error}
        </div>
      )}
    </div>
  );
}
