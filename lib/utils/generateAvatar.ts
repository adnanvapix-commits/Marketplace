/**
 * Generates a base64-encoded SVG data URI with initials avatar.
 *
 * @param fullName - The user's full name to derive initials from
 * @param fallbackEmail - Optional email to use if fullName is empty/whitespace
 * @returns A data URI string: `data:image/svg+xml;base64,...`
 */
export function generateAvatarDataUri(
  fullName: string,
  fallbackEmail?: string
): string {
  let initials = "";

  const trimmed = fullName.trim();
  if (trimmed.length > 0) {
    const words = trimmed.split(/\s+/);
    initials = words[0][0].toUpperCase();
    if (words.length > 1) {
      initials += words[1][0].toUpperCase();
    }
  } else if (fallbackEmail) {
    const localPart = fallbackEmail.split("@")[0];
    if (localPart.length > 0) {
      initials = localPart[0].toUpperCase();
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="32" fill="#6366f1"/>
  <text x="32" y="32" dominant-baseline="central" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" font-weight="600">${initials}</text>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
