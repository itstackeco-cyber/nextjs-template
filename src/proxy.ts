import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const IS_DEV = process.env.NODE_ENV === "development";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];
const RESET_PASSWORD_RE = /^\/reset-password\//;

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    RESET_PASSWORD_RE.test(pathname)
  );
}

async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env["JWT_SECRET"]!);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64");
}

function buildCsp(nonce: string): string {
  const scriptSrc = IS_DEV
    ? `'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline'`
    : `'self' 'nonce-${nonce}'`;

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    IS_DEV ? `connect-src 'self' ws: wss:` : `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    ...(!IS_DEV ? [`upgrade-insecure-requests`] : []),
  ];

  return directives.join("; ");
}

function applyCsp(request: NextRequest): NextResponse {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cspResponse = applyCsp(request);

  const sessionToken = request.cookies.get("session")?.value;
  const authenticated = await verifySession(sessionToken);

  // Logged-in user visiting auth pages → redirect to home
  if (isPublicRoute(pathname) && authenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated user visiting protected pages → redirect to login
  if (
    !isPublicRoute(pathname) &&
    !authenticated &&
    !pathname.startsWith("/api")
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return cspResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
