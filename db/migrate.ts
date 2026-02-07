import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';
import migrations from './migrations/migrations';

export async function runMigrations() {
  try {
    const expoDb = openDatabaseSync('tabagismo.db');
    const db = drizzle(expoDb);

    await migrate(db, migrations);

    console.log('[DB] Migrations completed successfully');
  } catch (error) {
    console.error('[DB] Migration failed:', error);
    throw error;
  }
}
