/**
 * Robust Media URL resolver for Aharada Education Platform.
 * Ensures image, notes, and document URLs resolve accurately across:
 * 1. Unified GoDaddy hosting (same origin: https://aharadaedu.com)
 * 2. Split hosting (e.g. Vercel frontend + GoDaddy backend)
 * 3. Local development (localhost:3000 / localhost:5000)
 */
export function getMediaUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';

  // Already an absolute or inline data URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // Relative path starting with /uploads/ or uploads/
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const apiBase = (import.meta.env.VITE_API_URL || '').trim();

  if (apiBase) {
    // Strip trailing /api or slash to get base backend domain
    const backendRoot = apiBase.replace(/\/api\/?$/, '').replace(/\/$/, '');
    return `${backendRoot}${cleanPath}`;
  }

  return cleanPath;
}

/**
 * Fallback avatar generator using UI Avatars for faculty / students when image fails or is missing
 */
export function getFallbackAvatar(name = 'Faculty Member') {
  const cleanName = encodeURIComponent(name || 'Aharada Faculty');
  return `https://ui-avatars.com/api/?name=${cleanName}&background=0284c7&color=ffffff&size=256&bold=true`;
}

/**
 * Fallback event banner when event image is missing
 */
export function getFallbackEventImage(category = 'event') {
  return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
}
