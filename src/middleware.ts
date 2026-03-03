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
  "/insights",
]

function isProtectedRoute(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )
}

export default async function middleware(request: NextRequest) {
  const cookies = request.cookies.getAll()
  const cookieNames = cookies.map((c) => c.name)

  // Detect leftover chunked session cookies (e.g. next-auth.session-token.0, .1)
  // from previous OAuth sign-ins with bloated JWT payloads.
  // These corrupt getToken() because SessionStore concatenates all matching
  // cookie values — mixing the valid main token with stale chunks.
  const chunkedCookies = cookieNames.filter(
    (name) =>
      name.startsWith("next-auth.session-token.") ||
      name.startsWith("__Secure-next-auth.session-token.")
  )

  const hasMainCookie =
    cookieNames.includes("next-auth.session-token") ||
    cookieNames.includes("__Secure-next-auth.session-token")

  // Only clean up chunks when a valid main (non-chunked) session cookie exists.
  // This means the chunks are stale leftovers — delete them and retry the request.
  if (chunkedCookies.length > 0 && hasMainCookie) {
    const response = NextResponse.redirect(request.url)
    for (const name of chunkedCookies) {
      response.cookies.delete(name)
    }
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
    "/insights/:path*",
  ],
}
