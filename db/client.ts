import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Open SQLite database (creates if doesn't exist)
const expoDb = openDatabaseSync('tabagismo.db');

// Create Drizzle instance with schema
export const db = drizzle(expoDb, { schema });
