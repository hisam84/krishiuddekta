import { neon } from "@neondatabase/serverless";

const fallbackDbUrl =
  "postgresql://neondb_owner:npg_Jeo3zhfWIMB8@ep-odd-scene-av8t5fmp-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Cap each DB query so slow/unreachable databases fail fast
// and the app can fall back instead of blocking the page for minutes.
// Set above observed Neon serverless latency (up to ~7s) so valid
// queries are not killed, only genuinely hung ones.
const DB_TIMEOUT_MS = 10000;

export function getDb() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    fallbackDbUrl;
  return neon(connectionString, {
    fetchOptions: {
      signal: AbortSignal.timeout(DB_TIMEOUT_MS),
    },
  });
}
