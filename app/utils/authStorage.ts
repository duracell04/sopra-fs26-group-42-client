const AUTH_STORAGE_KEYS = ["token", "id", "username"] as const;

function parseStoredString(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (typeof parsed === "string") {
      const trimmed = parsed.trim();
      return trimmed ? trimmed : null;
    }

    if (typeof parsed === "number") {
      return String(parsed);
    }
  } catch {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  return null;
}

export interface StoredAuthSession {
  token: string | null;
  userId: string | null;
  username: string | null;
  isAuthenticated: boolean;
}

export function getStoredAuthSession(): StoredAuthSession {
  if (typeof window === "undefined") {
    return {
      token: null,
      userId: null,
      username: null,
      isAuthenticated: false,
    };
  }

  const token = parseStoredString(globalThis.localStorage.getItem("token"));
  const userId = parseStoredString(globalThis.localStorage.getItem("id"));
  const username = parseStoredString(globalThis.localStorage.getItem("username"));

  return {
    token,
    userId,
    username,
    isAuthenticated: Boolean(token && userId),
  };
}

export function clearStoredAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of AUTH_STORAGE_KEYS) {
    globalThis.localStorage.removeItem(key);
  }
}

export function getStoredAuthenticatedUserId(): number | null {
  const { isAuthenticated, userId } = getStoredAuthSession();

  if (!isAuthenticated || !userId) {
    return null;
  }

  const parsedUserId = Number(userId);
  return Number.isFinite(parsedUserId) ? parsedUserId : null;
}
