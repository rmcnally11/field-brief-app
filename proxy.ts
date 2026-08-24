import { NextRequest, NextResponse } from "next/server";
import { GATE_COOKIE, GATE_PATH, isValidGateToken, safeNextPath } from "@/lib/gate";
import { AREA_BY_ID } from "@/lib/data/areas";
import { parseActivity } from "@/lib/briefing";
import { encodeWaterPref, WATER_COOKIE, waterCookieOptions } from "@/lib/prefs";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const open =
    pathname === GATE_PATH ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/newsletter" ||
    pathname.startsWith("/newsletter/") ||
    pathname === "/for-the-letter";

  if (open) return NextResponse.next();
  if (isValidGateToken(request.cookies.get(GATE_COOKIE)?.value)) {
    const res = NextResponse.next();
    const areaId = request.nextUrl.searchParams.get("area") ?? request.nextUrl.searchParams.get("a");
    const area = areaId ? AREA_BY_ID[areaId] : null;
    if (area) {
      res.cookies.set(
        WATER_COOKIE,
        encodeWaterPref({
          areaId: area.id,
          theater: request.nextUrl.searchParams.get("theater") ?? area.theater,
          activity: parseActivity(request.nextUrl.searchParams.get("activity")),
        }),
        waterCookieOptions(),
      );
    }
    return res;
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
