export function browserFamily(userAgent: string | null) {
  const ua = userAgent ?? "";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Unknown browser";
}

export function osFamily(userAgent: string | null) {
  const ua = userAgent ?? "";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown OS";
}
