const MIME_EXT: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const extFromMime = (mime: string): string => {
  if (!mime) return '';
  const base = mime.split(';')[0].trim().toLowerCase();
  return MIME_EXT[base] ?? '';
};
