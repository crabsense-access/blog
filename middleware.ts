import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://crabsense.com").replace(/\/$/, "");

export async function middleware(request: NextRequest) {
  // En producción, cualquier acceso por un dominio *.vercel.app (ej.
  // blog-snowy-one-21.vercel.app) redirige 301 al dominio propio para no
  // duplicar contenido en Google. Los previews (VERCEL_ENV=preview) siguen
  // funcionando normal, y /api/ queda afuera para no romper los cron jobs.
  const host = request.headers.get("host") ?? "";
  if (
    process.env.VERCEL_ENV === "production" &&
    host.endsWith(".vercel.app") &&
    !request.nextUrl.pathname.startsWith("/api/")
  ) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, SITE_URL);
    return NextResponse.redirect(target, 301);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
