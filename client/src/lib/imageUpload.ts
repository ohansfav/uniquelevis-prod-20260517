const DEFAULT_MAX_INPUT_BYTES = 8 * 1024 * 1024;

export const readImageFile = async (file: File, maxInputBytes = DEFAULT_MAX_INPUT_BYTES) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  if (file.size > maxInputBytes) {
    throw new Error(`Image is too large. Please use a file up to ${Math.round(maxInputBytes / (1024 * 1024))}MB.`);
  }
};

const dataUrlByteSize = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
};

const fileToImageElement = async (file: File) => {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image file. Try another photo."));
      img.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const fileToOptimizedDataUrl = async (
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    maxBytes?: number;
  },
) => {
  await readImageFile(file);

  const maxWidth = options?.maxWidth ?? 1280;
  const maxHeight = options?.maxHeight ?? 1280;
  const maxBytes = options?.maxBytes ?? 900 * 1024;

  const source = await fileToImageElement(file);
  const ratio = Math.min(maxWidth / source.width, maxHeight / source.height, 1);
  const width = Math.max(1, Math.round(source.width * ratio));
  const height = Math.max(1, Math.round(source.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not prepare image for upload. Please try again.");
  }

  ctx.drawImage(source, 0, 0, width, height);

  // Try WebP first (modern browsers) then fall back to JPEG.
  const tryEncode = (mime: string, qualities: number[]) => {
    let last: string | null = null;
    for (const q of qualities) {
      try {
        const candidate = canvas.toDataURL(mime, q);
        last = candidate;
        if (dataUrlByteSize(candidate) <= maxBytes) return candidate;
      } catch {
        // toDataURL may throw for unsupported mime types; stop trying this mime.
        return null;
      }
    }
    return last;
  };

  const qualities = [0.92, 0.84, 0.76, 0.68, 0.6, 0.52];

  // Prefer WebP if supported
  const webp = tryEncode("image/webp", qualities);
  if (webp && dataUrlByteSize(webp) <= maxBytes) return webp;
  if (webp) {
    // If webp exists but is still too large, return the best webp candidate (smaller than high-quality jpeg likely)
    if (dataUrlByteSize(webp) <= maxBytes * 1.2) return webp;
  }

  // Fallback to JPEG
  const jpeg = tryEncode("image/jpeg", qualities) ?? canvas.toDataURL("image/jpeg", 0.9);
  return jpeg;
};
