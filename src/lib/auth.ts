import type { NextAuthOptions } from "next-auth"
import type { Adapter } from "next-auth/adapters"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import GoogleProvider from "next-auth/providers/google"
import { getDb } from "@/lib/db"

function getLazyAdapter(): Adapter {
  let _adapter: Adapter | null = null

  function ensureAdapter(): Adapter {
    if (!_adapter) {
      const db = getDb()
      _adapter = DrizzleAdapter(db) as Adapter
    }
    return _adapter
  }

  // Use a Proxy to lazily initialize the adapter on first method call
  return new Proxy({} as Adapter, {
    get(_target, prop, receiver) {
      const adapter = ensureAdapter()
      const value = Reflect.get(adapter, prop, receiver)
      if (typeof value === "function") {
        return value.bind(adapter)
      }
      return value
    },
  })
}

export const authOptions: NextAuthOptions = {
  adapter: getLazyAdapter(),
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