import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GATE_COOKIE = "fb_gate";
export const GATE_PATH = "/enter";

/** Brief, calendar, and map are the public instrument. The rest still sits behind the hobby door. */
export function isOpenAppPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/calendar" ||
    pathname.startsWith("/calendar/") ||
    pathname === "/map" ||
    pathname.startsWith("/map/")
  );
}

function sitePassword() {
  return process.env.SITE_PASSWORD?.trim() || "fishing111";
}

export function gateToken() {
  return createHash("sha256").update(`field-brief-gate|${sitePassword()}`).digest("hex");
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

export function passwordMatches(submitted: string) {
  const a = sha256(submitted);
  const b = sha256(sitePassword());
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isValidGateToken(token: string | undefined | null) {
  if (!token) return false;
  const expected = Buffer.from(gateToken());
  const got = Buffer.from(token);
  return expected.length === got.length && timingSafeEqual(expected, got);
}

export function safeNextPath(raw?: string | null) {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) return "/";
  if (raw.startsWith(GATE_PATH)) return "/";
  return raw;
}

export async function hasGateCookie() {
  const jar = await cookies();
  return isValidGateToken(jar.get(GATE_COOKIE)?.value);
}

export function denyIfClosed(request: NextRequest) {
  if (isValidGateToken(request.cookies.get(GATE_COOKIE)?.value)) return null;
  return NextResponse.json({ error: "The brief is behind the door." }, { status: 401 });
}

export function gateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
