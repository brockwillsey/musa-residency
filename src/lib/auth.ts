import type { NextAuthOptions, Awaitable } from "next-auth"
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import GoogleProvider from "next-auth/providers/google"
import { getDb } from "@/lib/db"

function LazyDrizzleAdapter(): Adapter {
  let _adapter: Adapter | null = null

  function getAdapter(): Adapter {
    if (!_adapter) {
      const db = getDb()
      _adapter = DrizzleAdapter(db) as Adapter
    }
    return _adapter
  }

  return {
    createUser(user) {
      return getAdapter().createUser!(user)
    },
    getUser(id) {
      return getAdapter().getUser!(id)
    },
    getUserByEmail(email) {
      return getAdapter().getUserByEmail!(email)
    },
    getUserByAccount(providerAccountId) {
      return getAdapter().getUserByAccount!(providerAccountId)
    },
    updateUser(user) {
      return getAdapter().updateUser!(user)
    },
    deleteUser(userId) {
      return getAdapter().deleteUser!(userId)
    },
    linkAccount(account) {
      return getAdapter().linkAccount!(account)
    },
    unlinkAccount(providerAccountId) {
      return getAdapter().unlinkAccount!(providerAccountId)
    },
    createSession(session) {
      return getAdapter().createSession!(session)
    },
    getSessionAndUser(sessionToken) {
      return getAdapter().getSessionAndUser!(sessionToken)
    },
    updateSession(session) {
      return getAdapter().updateSession!(session)
    },
    deleteSession(sessionToken) {
      return getAdapter().deleteSession!(sessionToken)
    },
    createVerificationToken(verificationToken) {
      return getAdapter().createVerificationToken!(verificationToken)
    },
    useVerificationToken(params) {
      return getAdapter().useVerificationToken!(params)
    },
  }
}

export const authOptions: NextAuthOptions = {
  adapter: LazyDrizzleAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}