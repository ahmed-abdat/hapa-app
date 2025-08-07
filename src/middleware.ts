import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest } from 'next/server';
 
const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  // Explicitly exclude preview routes - let them pass through untouched
  if (req.nextUrl.pathname.startsWith('/next/')) {
    return; // Skip middleware processing for preview routes
  }
  
  // Handle root path explicitly
  if (req.nextUrl.pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/fr';
    return Response.redirect(url);
  }
  
  return intlMiddleware(req);
}
 
export const config = {
  // Match only internationalized pathnames, excluding Payload admin, API routes, and Next.js preview routes
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/admin`, `/next`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|admin|next|_next|_vercel|.*\\..*).*)'
  ]
};