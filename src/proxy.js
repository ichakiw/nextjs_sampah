import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isApiRoute = pathname.startsWith('/api');
  const isPublicRoute = isAuthPage || pathname === '/';

  if (isApiRoute) {
    return NextResponse.next();
  }

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    const decoded = verifyToken(token);
    if (decoded) {
      const redirectPath = decoded.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  if (token) {
    const decoded = verifyToken(token);
    if (!decoded && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (decoded) {
      const isAdminRoute = pathname.startsWith('/admin');
      const isUserRoute = pathname.startsWith('/user');

      if (isAdminRoute && decoded.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
      }

      if (isUserRoute && decoded.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
