import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames, excluding Payload admin and API routes
  matcher: ['/', '/(fr|ar)/:path*', '/((?!api|admin|_next|_vercel|.*\\..*).*)',]
};