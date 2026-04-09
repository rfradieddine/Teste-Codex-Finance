import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE = "finflow_unlock";

export function middleware(request: NextRequest) {
  if (!process.env.APP_PIN) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/unlock") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const isUnlocked = request.cookies.get(AUTH_COOKIE)?.value === "granted";
  if (isUnlocked) {
    return NextResponse.next();
  }

  const unlockUrl = new URL("/unlock", request.url);
  unlockUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
