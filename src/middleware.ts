// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { ROLE_ROUTES } from '@/lib/roles';

// Map route prefixes to required roles
const roleMap: Record<string, string> = Object.fromEntries(
  ROLE_ROUTES.map((role) => [`/${role}`, role])
);

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth; // decoded JWT
    const pathname = req.nextUrl.pathname;

    // Block non-logged-in users early
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Check role-based access
    for (const pathPrefix in roleMap) {
      if (pathname.startsWith(pathPrefix)) {
        const requiredRole = roleMap[pathPrefix];
        if (token.role !== requiredRole) {
          // Option 1: redirect to home
          // return NextResponse.redirect(new URL('/', req.url));

          // Option 2: redirect to unauthorized page
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
        break; // role matched, no need to check other prefixes
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // allow only if token exists
    },
  }
);

// Match only protected routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/nurse/:path*',
    '/student/:path*',
    '/pharmacist/:path*',
    '/lab_technician/:path*',
    '/store_keeper/:path*',
  ],
};
