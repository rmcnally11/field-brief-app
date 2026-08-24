import { NextRequest, NextResponse } from "next/server";
import { GATE_COOKIE, GATE_PATH, isValidGateToken, safeNextPath } from "@/lib/gate";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const open =
    pathname === GATE_PATH ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (open) return NextResponse.next();
  if (isValidGateToken(request.cookies.get(GATE_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = GATE_PATH;
  url.search = "";
  const next = safeNextPath(`${pathname}${search}`);
  if (next !== "/") url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
