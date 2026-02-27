import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Adapter } from 'next-auth/adapters'
import bcrypt from 'bcrypt'
import prisma from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Facebook OAuth Provider (also covers Instagram/Meta login)
    ...(process.env.FACEBOOK_CLIENT_ID
      ? [
        FacebookProvider({
          clientId: process.env.FACEBOOK_CLIENT_ID!,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
      : []),

    // GitHub OAuth Provider
    ...(process.env.GITHUB_CLIENT_ID
      ? [
        GitHubProvider({
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
      : []),

    // Email/Password Provider (Credentials)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('Email not found')
        }

        if (!user.passwordHash) {
          throw new Error('Invalid credentials') // User has a Google account without a password
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('Incorrect password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth] signIn callback:', {
        userId: user?.id,
        provider: account?.provider,
        email: (profile as { email?: string })?.email ?? user?.email,
      })
      return true
    },

    async session({ session, token }) {
      if (token && session.user && token.sub) {
        // Task 2: Invalidating Sessions on Account Deletion
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true, name: true, email: true, image: true }
        })

        // If the user doesn't exist in the DB, inject an error in the session payload
        if (!dbUser) {
          return { ...session, error: "UserDeleted" } as any
        }

        session.user.id = token.sub
        session.user.email = dbUser.email
        session.user.name = dbUser.name
        session.user.image = dbUser.image
      }
      return session
    },

    async jwt({ token, user, account }) {
      // Prevent massive base64 images from blowing up the cookie size limit
      if (token && typeof token.picture === 'string' && token.picture.length > 300) {
        token.picture = undefined
      }

      // On sign-in: return a CLEAN minimal token — do NOT spread `...token`
      // because the initial token object can contain the full OAuth payload
      // (id_token, access_token, refresh_token) which bloats the cookie.
      if (user) {
        return {
          sub: user.id,
          email: user.email,
          name: user.name,
          provider: account?.provider,
          iat: token.iat,
          exp: token.exp,
          jti: token.jti,
        }
      }

      return token
    },
  },

  pages: {
    signIn: '/signin',
    error: '/signin',
    newUser: '/dashboard',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn({ user, account }) {
      console.log('[NextAuth] signIn event — success:', { userId: user.id, provider: account?.provider })
    },
    async linkAccount({ user, account }) {
      console.log('[NextAuth] linkAccount event:', { userId: user.id, provider: account.provider })
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
}
