import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

function createDb() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  const sql = neon(databaseUrl)
  return drizzle(sql, { schema })
}

export type DbClient = ReturnType<typeof createDb>

let _db: DbClient | undefined

export function getDb(): DbClient {
  if (!_db) {
    _db = createDb()
  }
  return _db
}

// Proxy that lazily initializes the database connection on first property access.
// This allows passing `lazyDb` to adapters/configs at module level without
// actually connecting to the database until a request is made at runtime.
export const lazyDb: DbClient = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    const db = getDb()
    const value = Reflect.get(db, prop, receiver)
    if (typeof value === "function") {
      return value.bind(db)
    }
    return value
  },
})