import { auth } from "@/auth"; // Import the auth function from your auth.ts
import { NextResponse } from "next/server";
import type { Role } from "@/auth";

const roleRoutes: Record<Role, string[]> = {
  customer:   ["/dashboard/customer", "/checkout"],
  vendor:     ["/dashboard/vendor", "/vendor"],
  shop_admin: ["/dashboard/admin", "/admin"],   
};

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const { auth: session } = req; // req.auth contains the user session

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/admin") ||
    pathname === "/checkout";

  if (!isProtected) return NextResponse.next();

  // If there is no session (token), redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check roles
  const userRole = (session.user as any)?.role as Role || "customer";
  const allowedPrefixes = roleRoutes[userRole] || [];
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isAllowed) {
    const fallback = allowedPrefixes[0] || "/";
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/vendor/:path*", "/admin/:path*", "/checkout"],
};