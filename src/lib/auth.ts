import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
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
    async session({ session, token }) {
      if (token && session.user && token.sub) {
        // Task 2: Invalidating Sessions on Account Deletion
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true }
        })

        // If the user doesn't exist in the DB, inject an error in the session payload
        if (!dbUser) {
          return { ...session, error: "UserDeleted" } as any
        }

        session.user.id = token.sub
        session.user.email = token.email!
        session.user.name = token.name
        session.user.image = token.picture
      }
      return session
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      if (account?.provider) {
        token.provider = account.provider
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

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
}
