import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
