import { NextRequest, NextResponse } from "next/server";
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
  const { pathname } = request.nextUrl;
  if (pathname === "/subscribers" || pathname.startsWith("/subscribers/")) {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return remember(request, NextResponse.redirect(home));
  }
  return remember(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
