import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from "../../db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in Netlify environment variables");
}

// Konfiguracja połączenia z bazą danych
neonConfig.fetchConnectionCache = true;
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Prosty test połączenia przy inicjalizacji
(async () => {
  try {
    const test = await sql`SELECT 1`;
    console.log('Database connection successful:', test);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();