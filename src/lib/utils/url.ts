export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function safeUrl(url: string, fallback = "#"): string {
  return isSafeUrl(url) ? url : fallback;
}
