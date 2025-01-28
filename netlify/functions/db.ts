import { drizzle } from "drizzle-orm/neon-http";
import { neon } from '@neondatabase/serverless';
import * as schema from "../../db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in Netlify environment variables");
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });