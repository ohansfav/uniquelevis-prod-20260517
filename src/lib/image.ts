export const optimizeUnsplash = (url: string, width = 420, quality = 55) => {
  if (!url || !url.includes("images.unsplash.com")) {
    return url;
  }

  const base = url.split("?")[0];
  return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
};

const escapeSvgText = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const getProfileImage = (url: string | undefined, label: string, width = 420, quality = 55) => {
  const trimmed = url?.trim();
  if (trimmed) {
    return optimizeUnsplash(trimmed, width, quality);
  }

  const safeLabel = escapeSvgText(label.trim() || "Unique Levis");
  const initial = escapeSvgText((safeLabel[0] ?? "U").toUpperCase());
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="avatarGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff8b6a" />
          <stop offset="100%" stop-color="#f2cb4d" />
        </linearGradient>
      </defs>
      <rect width="160" height="200" rx="24" fill="#1b1730" />
      <circle cx="80" cy="66" r="34" fill="url(#avatarGradient)" />
      <path d="M32 176c8-34 31-52 48-52s40 18 48 52" fill="#342d5d" />
      <text x="80" y="74" text-anchor="middle" fill="#1b1730" font-family="Arial, sans-serif" font-size="24" font-weight="700">${initial}</text>
    </svg>`,
  )}`;
};
