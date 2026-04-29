// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "./auth"; // or wherever you export Role

const roleRoutes: Record<Role, string[]> = {
  customer:   ["/dashboard/customer", "/checkout"],
  vendor:     ["/dashboard/vendor", "/vendor"],
  shop_admin: ["/dashboard/admin", "/admin"],   // ← was "admin", now "shop_admin"
};

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/admin") ||
    pathname === "/checkout";

  if (!isProtected) return NextResponse.next();

  if (!process.env.NEXTAUTH_SECRET) {
    console.warn("NEXTAUTH_SECRET is not set.");
    return NextResponse.next();
  }

  let token;
  try {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  } catch (err) {
    console.error("getToken error:", err);
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userRole = (token.role as Role) || "customer";
  const allowedPrefixes = roleRoutes[userRole] || [];
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isAllowed) {
    const fallback = allowedPrefixes[0] || "/";
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/vendor/:path*", "/admin/:path*", "/checkout"],
};