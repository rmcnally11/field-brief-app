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
import { COAST_HUB_BY_SLUG } from "@/lib/coast-hubs";
import { isYmd } from "@/lib/time";

const CANONICAL_HOST = "onthiswater.com";
const ALIAS_HOSTS = new Set([
  "www.onthiswater.com",
  "onthiswater.vercel.app",
  "field-brief-app.vercel.app",
  "onthiswater-bobby-204e.vercel.app",
]);

function rememberWater(request: NextRequest, res: NextResponse) {
  const fromQuery = request.nextUrl.searchParams.get("area") ?? request.nextUrl.searchParams.get("a");
  const morning = request.nextUrl.pathname.match(/^\/morning\/([^/]+)(?:\/\d{4}-\d{2}-\d{2})?$/);
  const areaId = fromQuery ?? morning?.[1];
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
  if (raw) {
    if (raw === "all") {
      res.cookies.set(COASTS_COOKIE, encodeCoasts([...THEATER_IDS]), coastsCookieOptions());
      return res;
    }
    const coasts = parseCoasts(raw);
    if (coasts.length) res.cookies.set(COASTS_COOKIE, encodeCoasts(coasts), coastsCookieOptions());
    return res;
  }
  const slug = request.nextUrl.pathname.replace(/^\//, "");
  const hub = !slug.includes("/") ? COAST_HUB_BY_SLUG[slug] : null;
  if (hub) {
    res.cookies.set(COASTS_COOKIE, encodeCoasts([hub.theater]), coastsCookieOptions());
  }
  return res;
}

function remember(request: NextRequest, res: NextResponse) {
  return rememberCoasts(request, rememberWater(request, res));
}

function hostRedirect(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (!ALIAS_HOSTS.has(host)) return null;
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  return NextResponse.redirect(url, 308);
}

function morningQueryRedirect(request: NextRequest) {
  if (request.nextUrl.pathname !== "/morning") return null;
  const areaId = request.nextUrl.searchParams.get("area");
  const area = areaId ? AREA_BY_ID[areaId] : null;
  if (!area) return null;
  const date = request.nextUrl.searchParams.get("date");
  const url = request.nextUrl.clone();
  url.pathname = isYmd(date) ? `/morning/${area.id}/${date}` : `/morning/${area.id}`;
  url.searchParams.delete("area");
  url.searchParams.delete("theater");
  url.searchParams.delete("date");
  return remember(request, NextResponse.redirect(url, 308));
}

export function proxy(request: NextRequest) {
  const aliased = hostRedirect(request);
  if (aliased) return aliased;

  const { pathname } = request.nextUrl;
  if (pathname === "/subscribers" || pathname.startsWith("/subscribers/")) {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return remember(request, NextResponse.redirect(home));
  }

  const morning = morningQueryRedirect(request);
  if (morning) return morning;

  return remember(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
