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

let _db: ReturnType<typeof createDb> | undefined

export function getDb() {
  if (!_db) {
    _db = createDb()
  }
  return _db
}