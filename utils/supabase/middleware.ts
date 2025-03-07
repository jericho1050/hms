import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
    
      // Create supabase server client
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value),
              );
              response = NextResponse.next({
                request: request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options),
              );
            },
          },
        },
      );
      // Refresh session if expired
    
      const user = await supabase.auth.getUser()
    
      // Protected routes - redirect to login if not authenticated
      const protectedRoutes = ["/dashboard", "/patients", "/appointments", "/staff", "/inventory", "/billing", "/reports"]
    
      // Public routes - redirect to dashboard if already logged in
      const publicAuthRoutes = ["/auth/login", "/auth/register"]
    
      const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
      const isPublicAuthRoute = publicAuthRoutes.some((route) => request.nextUrl.pathname === route)
      const isRootPath = request.nextUrl.pathname === "/"
    
      // If trying to access protected route without being logged in
      if (isProtectedRoute && user.error) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    
      // If trying to access login/register when already logged in
      if (isPublicAuthRoute && !user.error) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // If authenticated user visits the root path, redirect to dashboard
      if (isRootPath && !user.error) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    
      return response;
}