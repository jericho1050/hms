import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "./utils/supabase/middleware"
export async function middleware(request: NextRequest) {
  
  return await updateSession(request);
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

