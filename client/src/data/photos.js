// Bundled photo manifest — real Wikimedia Commons images stored in
// client/public/photos/*.jpg with credits in attribution.json.
// Loaded at runtime (fetch) with a bundled fallback copy for offline-first boot.
let cache = null;

export async function getPhotoManifest() {
  if (cache) return cache;
  try {
    const res = await fetch('/photos/attribution.json');
    if (res.ok) {
      cache = await res.json();
      return cache;
    }
  } catch {
    /* offline — fall through to fallback */
  }
  const { default: fallback } = await import('./photoAttributionFallback.js');
  cache = fallback;
  return cache;
}

export async function getPhotoMeta(id) {
  const m = await getPhotoManifest();
  return (m.photos || []).find((p) => p.id === id) || null;
}

export function photoCreditLine(meta) {
  if (!meta) return '';
  return `${meta.author || 'Unknown'} · ${meta.license || ''}`.trim();
}
