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
    "/notifications/:path*",
  ],
}
