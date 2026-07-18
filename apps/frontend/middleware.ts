import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE = "notebook_jwt";
const PUBLIC_PATHS = ["/login", "/register", "/share"];

// Route guard: redirects unauthenticated users away from (workspace) routes, and
// authenticated users away from login/register. This is a UX convenience, NOT the real
// security boundary — the Spring Boot API independently validates the JWT on every request
// regardless of what this middleware decides, per SecurityConfig on the backend.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isRootPath = pathname === "/";

  if (!token && !isPublicPath && !isRootPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/notebooks", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, the Pyodide worker, and Next internals
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|workers).*)"],
};
