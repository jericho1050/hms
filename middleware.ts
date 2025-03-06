import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("my session lo", session);

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ["/dashboard", "/patients", "/appointments", "/staff", "/inventory", "/billing", "/reports"]

  // Public routes - redirect to dashboard if already logged in
  const publicAuthRoutes = ["/auth/login", "/auth/register"]

  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  const isPublicAuthRoute = publicAuthRoutes.some((route) => req.nextUrl.pathname === route)

  // If trying to access protected route without being logged in
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // If trying to access login/register when already logged in
  if (isPublicAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/appointments/:path*",
    "/staff/:path*",
    "/inventory/:path*",
    "/billing/:path*",
    "/reports/:path*",
    "/auth/login",
    "/auth/register",
  ],
}

