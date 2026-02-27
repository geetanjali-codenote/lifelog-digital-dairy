import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// Routes that require authentication
const protectedPaths = [
  "/timeline",
  "/stats",
  "/profile",
  "/entry",
  "/memory",
  "/notifications",
  "/transactions",
  "/highlight",
  "/highlights",
  "/gallery",
]

function isProtectedRoute(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )
}

export default async function middleware(request: NextRequest) {
  const cookieNames = [...request.cookies.getAll()].map((c) => c.name)

  // Detect chunked next-auth session cookies and clear them.
  // This fixes HTTP 431 errors caused by bloated JWT cookies from
  // OAuth sign-ins that stored the full token payload.
  const chunkedCookies = cookieNames.filter(
    (name) =>
      name.startsWith("next-auth.session-token.") ||
      name.startsWith("__Secure-next-auth.session-token.")
  )

  if (chunkedCookies.length >= 2) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    for (const name of chunkedCookies) {
      response.cookies.delete(name)
    }
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("__Secure-next-auth.session-token")

    return response
  }

  // Auth check — only for protected routes
  if (isProtectedRoute(request.nextUrl.pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      const signInUrl = new URL("/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/timeline/:path*",
    "/stats/:path*",
    "/profile/:path*",
    "/entry/:path*",
    "/memory/:path*",
    "/notifications/:path*",
    "/transactions/:path*",
    "/highlight/:path*",
    "/highlights/:path*",
    "/gallery/:path*",
  ],
}
