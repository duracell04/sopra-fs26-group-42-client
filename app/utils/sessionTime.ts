import type { GameSession } from "@/types/session";

const SESSION_TTL_MS = 5 * 60 * 1000;
const HAS_TIMEZONE_SUFFIX = /(Z|[+-]\d{2}:\d{2})$/i;

function parseSessionTimestamp(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const normalizedValue = HAS_TIMEZONE_SUFFIX.test(value) ? value : `${value}Z`;
  const timestamp = Date.parse(normalizedValue);

  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getSessionTimeLeftSeconds(
  session: Pick<GameSession, "createdAt" | "expiresAt">,
  now: number = Date.now(),
): number {
  const expiresAtMs = parseSessionTimestamp(session.expiresAt);

  if (expiresAtMs !== null) {
    return Math.max(0, Math.floor((expiresAtMs - now) / 1000));
  }

  const createdAtMs = parseSessionTimestamp(session.createdAt);
  if (createdAtMs !== null) {
    return Math.max(0, Math.floor((createdAtMs + SESSION_TTL_MS - now) / 1000));
  }

  return Math.floor(SESSION_TTL_MS / 1000);
}