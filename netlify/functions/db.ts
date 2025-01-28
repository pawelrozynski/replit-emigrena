import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from "../../db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in Netlify environment variables");
}

// Konfiguracja połączenia z bazą danych
neonConfig.fetchConnectionCache = true;

// Dodaj szczegółowe logowanie dla debugowania
console.log('Inicjalizacja połączenia z bazą danych...');
console.log('URL bazy:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Prosty test połączenia przy inicjalizacji
(async () => {
  try {
    const test = await sql`SELECT current_timestamp`;
    console.log('Test połączenia z bazą danych:', test);
    console.log('Połączenie z bazą danych zostało ustanowione pomyślnie');
  } catch (error) {
    console.error('Błąd połączenia z bazą danych:', error);
    // Nie rzucamy błędu, aby funkcja mogła się zainicjalizować
  }
})();