import { NextRequest, NextResponse } from "next/server";
import { GATE_COOKIE, GATE_PATH, isValidGateToken, safeNextPath } from "@/lib/gate";
import { AREA_BY_ID } from "@/lib/data/areas";
import { parseActivity } from "@/lib/briefing";
import { encodeWaterPref, WATER_COOKIE, waterCookieOptions } from "@/lib/prefs";
import {
  COASTS_COOKIE,
  coastsCookieOptions,
  encodeCoasts,
  parseCoasts,
} from "@/lib/coasts";
import { THEATER_IDS } from "@/lib/data/theaters";

function rememberWater(request: NextRequest, res: NextResponse) {
  const areaId = request.nextUrl.searchParams.get("area") ?? request.nextUrl.searchParams.get("a");
  const area = areaId ? AREA_BY_ID[areaId] : null;
  if (!area) return res;
  res.cookies.set(
    WATER_COOKIE,
    encodeWaterPref({
      areaId: area.id,
      theater: request.nextUrl.searchParams.get("theater") ?? area.theater,
      activity: parseActivity(request.nextUrl.searchParams.get("activity")),
    }),
    waterCookieOptions(),
  );
  return res;
}

function rememberCoasts(request: NextRequest, res: NextResponse) {
  const raw = request.nextUrl.searchParams.get("coasts");
  if (!raw) return res;
  if (raw === "all") {
    res.cookies.set(COASTS_COOKIE, encodeCoasts([...THEATER_IDS]), coastsCookieOptions());
    return res;
  }
  const coasts = parseCoasts(raw);
  if (coasts.length) res.cookies.set(COASTS_COOKIE, encodeCoasts(coasts), coastsCookieOptions());
  return res;
}

function remember(request: NextRequest, res: NextResponse) {
  return rememberCoasts(request, rememberWater(request, res));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const open =
    pathname === GATE_PATH ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/newsletter" ||
    pathname.startsWith("/newsletter/") ||
    pathname === "/for-the-letter" ||
    pathname === "/card" ||
    pathname.startsWith("/card/") ||
    pathname === "/" ||
    pathname === "/calendar" ||
    pathname.startsWith("/calendar/") ||
    pathname === "/map" ||
    pathname.startsWith("/map/") ||
    pathname === "/join" ||
    pathname.startsWith("/join/") ||
    pathname === "/compare" ||
    pathname.startsWith("/compare/") ||
    pathname === "/morning" ||
    pathname.startsWith("/morning/") ||
    pathname === "/species" ||
    pathname.startsWith("/species/") ||
    pathname === "/method" ||
    pathname.startsWith("/method/") ||
    pathname === "/fundamentals" ||
    pathname.startsWith("/fundamentals/");

  if (open) return remember(request, NextResponse.next());
  if (isValidGateToken(request.cookies.get(GATE_COOKIE)?.value)) {
    return remember(request, NextResponse.next());
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
