export const optimizeUnsplash = (url: string, width = 420, quality = 55) => {
  if (!url || !url.includes("images.unsplash.com")) {
    return url;
  }

  const base = url.split("?")[0];
  return `${base}?auto=format&fit=crop&w=${width}&q=${quality}`;
};
