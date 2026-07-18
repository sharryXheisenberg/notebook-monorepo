import Cookies from "js-cookie";

const TOKEN_COOKIE = "notebook_jwt";

// httpOnly would be more secure against XSS, but that requires the token to be set by a
// server response header rather than client JS. Since this app calls a separate Spring Boot
// origin (not a Next.js API route acting as a proxy), the simplest correct MVP approach is a
// regular (non-httpOnly) cookie set by client JS after login. Revisit if an XSS-sensitive
// threat model applies before this handles real user data at scale.
const COOKIE_OPTIONS = {
  expires: 1, // 1 day — should roughly track app.jwt.expiration-ms on the backend
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function setAuthToken(token: string) {
  Cookies.set(TOKEN_COOKIE, token, COOKIE_OPTIONS);
}

export function getAuthToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

export function clearAuthToken() {
  Cookies.remove(TOKEN_COOKIE);
}
