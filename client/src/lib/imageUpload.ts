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

  let best = canvas.toDataURL("image/jpeg", 0.9);
  if (dataUrlByteSize(best) <= maxBytes) {
    return best;
  }

  for (let quality = 0.82; quality >= 0.46; quality -= 0.08) {
    const candidate = canvas.toDataURL("image/jpeg", quality);
    best = candidate;
    if (dataUrlByteSize(candidate) <= maxBytes) {
      return candidate;
    }
  }

  return best;
};
