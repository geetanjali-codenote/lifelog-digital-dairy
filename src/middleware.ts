import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/signin",
  },
})

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
