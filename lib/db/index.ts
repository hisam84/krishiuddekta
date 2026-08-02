import { neon } from "@neondatabase/serverless";

const fallbackDbUrl =
  "postgresql://neondb_owner:npg_Jeo3zhfWIMB8@ep-odd-scene-av8t5fmp-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require";

export function getDb() {
  const connectionString =
    process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || fallbackDbUrl;
  return neon(connectionString);
}
