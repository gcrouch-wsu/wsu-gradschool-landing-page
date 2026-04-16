import { jwtVerify } from "jose/jwt/verify";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/manage")) {
    return NextResponse.next();
  }

  const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;

  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json(
      { error: "Server misconfiguration: SESSION_SECRET is not set" },
      { status: 500 },
    );
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", nextPath);
    return NextResponse.redirect(login);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", nextPath);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
