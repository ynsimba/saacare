const EVENT = "saacare:user-media";

export function mediaKey(userId, kind) {
  return `saacare_media_${kind}_${userId || "guest"}`;
}

export function readMedia(userId, kind) {
  try {
    return localStorage.getItem(mediaKey(userId, kind)) || "";
  } catch {
    return "";
  }
}

export function writeMedia(userId, kind, value) {
  try {
    if (value) localStorage.setItem(mediaKey(userId, kind), value);
    else localStorage.removeItem(mediaKey(userId, kind));
  } catch {
    /* ignore quota */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { userId, kind, value: value || "" } }));
  }
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Lecture impossible."));
    reader.readAsDataURL(file);
  });
}

export function onMediaChange(handler) {
  const listener = (e) => handler(e.detail || {});
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
