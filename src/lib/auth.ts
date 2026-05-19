import type { NextAuthOptions } from "next-auth"
import type { Adapter } from "next-auth/adapters"
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
    createUser(user: any) {
      return getAdapter().createUser!(user)
    },
    getUser(id: string) {
      return getAdapter().getUser!(id)
    },
    getUserByEmail(email: string) {
      return getAdapter().getUserByEmail!(email)
    },
    getUserByAccount(providerAccountId: any) {
      return getAdapter().getUserByAccount!(providerAccountId)
    },
    updateUser(user: any) {
      return getAdapter().updateUser!(user)
    },
    deleteUser(userId: string) {
      return getAdapter().deleteUser!(userId)
    },
    linkAccount(account: any) {
      return getAdapter().linkAccount!(account)
    },
    unlinkAccount(providerAccountId: any) {
      return getAdapter().unlinkAccount!(providerAccountId)
    },
    createSession(session: any) {
      return getAdapter().createSession!(session)
    },
    getSessionAndUser(sessionToken: string) {
      return getAdapter().getSessionAndUser!(sessionToken)
    },
    updateSession(session: any) {
      return getAdapter().updateSession!(session)
    },
    deleteSession(sessionToken: string) {
      return getAdapter().deleteSession!(sessionToken)
    },
    createVerificationToken(verificationToken: any) {
      return getAdapter().createVerificationToken!(verificationToken)
    },
    useVerificationToken(params: any) {
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