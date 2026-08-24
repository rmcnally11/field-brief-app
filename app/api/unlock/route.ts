import { NextRequest, NextResponse } from "next/server";
import {
  GATE_COOKIE,
  GATE_PATH,
  gateCookieOptions,
  gateToken,
  passwordMatches,
  safeNextPath,
} from "@/lib/gate";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const next = safeNextPath(String(form.get("next") ?? "/"));

  if (!passwordMatches(password)) {
    const url = request.nextUrl.clone();
    url.pathname = GATE_PATH;
    url.search = "";
    url.searchParams.set("error", "1");
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const dest = request.nextUrl.clone();
  dest.pathname = next.split("?")[0] || "/";
  dest.search = next.includes("?") ? next.slice(next.indexOf("?")) : "";
  const res = NextResponse.redirect(dest, 303);
  res.cookies.set(GATE_COOKIE, gateToken(), gateCookieOptions());
  return res;
}
