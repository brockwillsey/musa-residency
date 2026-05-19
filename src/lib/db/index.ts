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