import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export type Database = PostgresJsDatabase<typeof schema>;

let _db: Database | null = null;

export function getDb(): Database {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    // Supabase transaction pooler (port 6543) doesn't support prepared statements.
    // Detect pooler port and disable prepared statements accordingly.
    const isTransactionPooler = connectionString.includes(":6543/");
    const client = postgres(connectionString, {
      prepare: !isTransactionPooler,
    });
    _db = drizzle(client, { schema });
  }
  return _db;
}
