import type { UserSummary } from "@/types/auth";

const USER_STORAGE_KEY = "notebook_user";

// Small helper around sessionStorage for the logged-in user's display info (username, id) —
// NOT the source of truth for auth (the JWT cookie is), just avoids re-decoding the token
// on every render for UI purposes like "show the username in the nav bar".
export function setStoredUser(user: UserSummary) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser(): UserSummary | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(USER_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(USER_STORAGE_KEY);
}
