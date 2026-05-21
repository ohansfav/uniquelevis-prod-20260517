import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unique Levi's",
  description: "A modern dating app for meaningful matches and real-time conversations",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/app-icon.svg",
    apple: "/app-icon.svg",
    shortcut: "/app-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Unique Levi's",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#160f25",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <style>{`
          @keyframes ul_bootPulse {
            0% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(255,79,122,0.4); }
            70% { transform: scale(1); box-shadow: 0 0 0 22px rgba(255,79,122,0); }
            100% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(255,79,122,0); }
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col text-[var(--color-text)]">
        <div
          id="boot-splash"
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: "0",
            zIndex: 999,
            display: "grid",
            placeItems: "center",
            background: "#0e0c17",
            color: "#fff",
            pointerEvents: "none",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                margin: "0 auto 1.25rem",
                display: "grid",
                height: "4rem",
                width: "4rem",
                placeItems: "center",
                borderRadius: "999px",
                fontSize: "1.5rem",
                background: "linear-gradient(125deg, #ff4f7a, #ff8e53)",
                boxShadow: "0 24px 45px rgba(255,79,122,0.55)",
                animation: "ul_bootPulse 900ms ease-out 1",
              }}
            >
              ❤
            </div>
            <p style={{ fontSize: "1.875rem", fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>Unique Levi&apos;s</p>
            <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
              Swipe Into Something Real
            </p>
          </div>
        </div>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var mode = localStorage.getItem("ul_theme_mode") || "system";
                var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                var resolved = mode === "dark" || mode === "light" ? mode : (dark ? "dark" : "light");
                document.documentElement.setAttribute("data-theme", resolved);
                document.documentElement.style.colorScheme = resolved;
              } catch (e) {}
            })();
          `}
        </Script>
        <Script
          id="boot-splash-hide"
          strategy="afterInteractive"
        >
          {`
            (function () {
              var splash = document.getElementById("boot-splash");
              if (!splash) return;
              var cleaned = false;
              var cleanup = function () {
                if (cleaned) return;
                cleaned = true;
                splash.style.opacity = "0";
                splash.style.transition = "opacity 220ms ease";
                window.setTimeout(function () {
                  splash.remove();
                }, 240);
                window.removeEventListener("ul-app-ready", onReady);
              };

              var onReady = function () {
                cleanup();
              };

              window.addEventListener("ul-app-ready", onReady, { once: true });

              // Fallback in case app-ready event is never dispatched.
              window.setTimeout(cleanup, 6000);
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
