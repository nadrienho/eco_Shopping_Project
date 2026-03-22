import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 1. Define the Role-to-Route mapping
const roleRoutes: Record<string, string[]> = {
  customer: ["/dashboard/customer", "/checkout"],
  vendor: ["/dashboard/vendor", "/vendor"],
  admin: ["/dashboard/admin", "/admin"],
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // The 'withAuth' authorized callback already ensures 'token' exists here
    const userRole = (token?.role as string) || "customer";
    const allowedRoutes = roleRoutes[userRole] || [];

    /**
     * LOGIC: Check if the current path is allowed for this role.
     * We check if the path starts with any of the allowed prefixes for that user.
     */
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));

    // If the user is trying to access a restricted area they aren't allowed in
    if (pathname.startsWith("/dashboard") || 
        pathname.startsWith("/vendor") || 
        pathname.startsWith("/admin")) {
      
      if (!isAllowed) {
        // Redirect them to their own dashboard or home
        const fallback = roleRoutes[userRole]?.[0] || "/";
        return NextResponse.redirect(new URL(fallback, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // This ensures the middleware code only runs if the user is logged in
      authorized: ({ token }) => !!token,
    },
  }
);

// 2. Define which paths trigger this middleware
export const config = { 
  matcher: [
    "/dashboard/:path*", 
    "/vendor/:path*", 
    "/admin/:path*", 
    "/checkout"
  ] 
};