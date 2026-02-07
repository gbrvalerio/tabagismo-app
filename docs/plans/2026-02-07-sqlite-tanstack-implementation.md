# SQLite + TanStack Query Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up local SQLite database with TanStack Query for Tabagismo app, starting with onboarding status persistence.

**Architecture:** Drizzle ORM for type-safe schema and auto-migrations, TanStack Query for data fetching/caching, repository pattern for clean component API. All database operations wrapped in typed hooks.

**Tech Stack:** Drizzle ORM, expo-sqlite, TanStack Query, TypeScript

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install production dependencies**

Run:
```bash
npm install drizzle-orm expo-sqlite @tanstack/react-query
```

Expected: Dependencies added to package.json

**Step 2: Install development dependencies**

Run:
```bash
npm install -D drizzle-kit
```

Expected: drizzle-kit added to devDependencies

**Step 3: Add database scripts to package.json**

Modify `package.json` scripts section:
```json
{
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Step 4: Commit dependency changes**

```bash
git add package.json package-lock.json
git commit -m "deps: add drizzle-orm, expo-sqlite, and tanstack query"
```

---

## Task 2: Create Drizzle Configuration

**Files:**
- Create: `drizzle.config.ts`

**Step 1: Create Drizzle config file**

Create `drizzle.config.ts` in project root:
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
```

**Step 2: Commit configuration**

```bash
git add drizzle.config.ts
git commit -m "config: add drizzle-kit configuration"
```

---

## Task 3: Create Database Schema

**Files:**
- Create: `db/schema/settings.ts`
- Create: `db/schema/index.ts`

**Step 1: Create db/schema directory**

Run:
```bash
mkdir -p db/schema
```

**Step 2: Create settings schema**

Create `db/schema/settings.ts`:
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
```

**Step 3: Create schema index**

Create `db/schema/index.ts`:
```typescript
export * from './settings';
```

**Step 4: Generate initial migration**

Run:
```bash
npm run db:generate
```

Expected: Migration file created in `db/migrations/`

**Step 5: Commit schema and migration**

```bash
git add db/schema/ db/migrations/
git commit -m "feat: add settings schema with auto-generated migration"
```

---

## Task 4: Create Database Client

**Files:**
- Create: `db/client.ts`

**Step 1: Create database client**

Create `db/client.ts`:
```typescript
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Open SQLite database (creates if doesn't exist)
const expoDb = openDatabaseSync('tabagismo.db');

// Create Drizzle instance with schema
export const db = drizzle(expoDb, { schema });
```

**Step 2: Commit database client**

```bash
git add db/client.ts
git commit -m "feat: add database client with drizzle instance"
```

---

## Task 5: Create Migration Runner

**Files:**
- Create: `db/migrate.ts`

**Step 1: Create migration runner**

Create `db/migrate.ts`:
```typescript
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';

export async function runMigrations() {
  try {
    const expoDb = openDatabaseSync('tabagismo.db');
    const db = drizzle(expoDb);

    await migrate(db, {
      migrationsFolder: './db/migrations'
    });

    console.log('[DB] Migrations completed successfully');
  } catch (error) {
    console.error('[DB] Migration failed:', error);
    throw error;
  }
}
```

**Step 2: Commit migration runner**

```bash
git add db/migrate.ts
git commit -m "feat: add auto-migration runner"
```

---

## Task 6: Create Error Handler

**Files:**
- Create: `lib/error-handler.ts`

**Step 1: Create lib directory**

Run:
```bash
mkdir -p lib
```

**Step 2: Create error handler utility**

Create `lib/error-handler.ts`:
```typescript
import { Alert } from 'react-native';

export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Layer 1: Silent logging
export function logError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
  // TODO: Add crash reporting (Sentry, etc.) later
}

// Layer 2: User-facing toast/alert
export function showErrorAlert(message: string) {
  Alert.alert('Error', message, [{ text: 'OK' }]);
}

// Layer 3: Error handler for TanStack Query
export function handleQueryError(error: unknown, userMessage: string) {
  logError(error, 'Query Error');
  showErrorAlert(userMessage);
}
```

**Step 3: Commit error handler**

```bash
git add lib/error-handler.ts
git commit -m "feat: add layered error handling utilities"
```

---

## Task 7: Create TanStack Query Client

**Files:**
- Create: `lib/query-client.ts`

**Step 1: Create query client configuration**

Create `lib/query-client.ts`:
```typescript
import { QueryClient } from '@tanstack/react-query';
import { handleQueryError } from './error-handler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,    // 5 min (local data)
      gcTime: 1000 * 60 * 60,       // 1 hour cache
      refetchOnWindowFocus: false,  // Mobile app
      refetchOnMount: true,
      onError: (error) => handleQueryError(error, 'Failed to load data'),
    },
    mutations: {
      retry: 1,
      onError: (error) => handleQueryError(error, 'Failed to save data'),
    },
  },
});
```

**Step 2: Commit query client**

```bash
git add lib/query-client.ts
git commit -m "feat: add tanstack query client with error handling"
```

---

## Task 8: Create Settings Repository

**Files:**
- Create: `db/repositories/settings.repository.ts`
- Create: `db/repositories/index.ts`

**Step 1: Create repositories directory**

Run:
```bash
mkdir -p db/repositories
```

**Step 2: Create settings repository with hooks**

Create `db/repositories/settings.repository.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { settings } from '../schema';

// Query: Get onboarding status
export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['settings', 'onboardingCompleted'],
    queryFn: async () => {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'onboardingCompleted'))
        .get();

      return result?.value === 'true';
    },
  });
}

// Mutation: Mark onboarding as completed
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await db
        .insert(settings)
        .values({
          key: 'onboardingCompleted',
          value: 'true'
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: 'true', updatedAt: new Date() }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['settings', 'onboardingCompleted']
      });
    },
  });
}
```

**Step 3: Create repository index**

Create `db/repositories/index.ts`:
```typescript
export * from './settings.repository';
```

**Step 4: Commit repositories**

```bash
git add db/repositories/
git commit -m "feat: add settings repository with onboarding hooks"
```

---

## Task 9: Create Database Public API

**Files:**
- Create: `db/index.ts`

**Step 1: Create database index file**

Create `db/index.ts`:
```typescript
// Export database client
export { db } from './client';

// Export repositories (hooks for components)
export * from './repositories';

// Export migration runner
export { runMigrations } from './migrate';

// Export schema types (for type annotations)
export type { Setting, NewSetting } from './schema/settings';
```

**Step 2: Commit database public API**

```bash
git add db/index.ts
git commit -m "feat: add database public API exports"
```

---

## Task 10: Install react-error-boundary

**Files:**
- Modify: `package.json`

**Step 1: Install react-error-boundary**

Run:
```bash
npm install react-error-boundary
```

Expected: react-error-boundary added to dependencies

**Step 2: Commit dependency**

```bash
git add package.json package-lock.json
git commit -m "deps: add react-error-boundary"
```

---

## Task 11: Integrate Database into App Layout

**Files:**
- Modify: `app/_layout.tsx`

**Step 1: Add imports to _layout.tsx**

Add these imports at the top of `app/_layout.tsx`:
```typescript
import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { queryClient } from '@/lib/query-client';
import { runMigrations } from '@/db';
```

**Step 2: Create error fallback component**

Add before RootLayout function in `app/_layout.tsx`:
```typescript
function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
```

**Step 3: Update RootLayout to run migrations**

Replace the existing RootLayout function:
```typescript
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    runMigrations()
      .then(() => setDbReady(true))
      .catch((error) => {
        console.error('Failed to initialize database:', error);
        setDbReady(true); // Continue anyway to show error boundary
      });
  }, []);

  if (!dbReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

**Step 4: Commit app layout integration**

```bash
git add app/_layout.tsx
git commit -m "feat: integrate database and query client into app layout"
```

---

## Task 12: Create Test Component for Onboarding

**Files:**
- Modify: `app/(tabs)/index.tsx`

**Step 1: Replace index.tsx content**

Replace the entire content of `app/(tabs)/index.tsx`:
```typescript
import { View, Text, Button, StyleSheet } from 'react-native';
import { useOnboardingStatus, useCompleteOnboarding } from '@/db';

export default function HomeScreen() {
  const { data: onboardingCompleted, isLoading } = useOnboardingStatus();
  const completeMutation = useCompleteOnboarding();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading onboarding status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Test</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.label}>Onboarding Status:</Text>
        <Text style={styles.value}>
          {onboardingCompleted ? 'Completed ✅' : 'Not Completed ❌'}
        </Text>
      </View>

      {!onboardingCompleted && (
        <Button
          title="Complete Onboarding"
          onPress={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
        />
      )}

      {completeMutation.isPending && (
        <Text style={styles.saving}>Saving...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  statusContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
  },
  saving: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
```

**Step 2: Commit test component**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: add database test screen for onboarding status"
```

---

## Task 13: Manual Testing & Verification

**Files:**
- None (testing only)

**Step 1: Start the development server**

Run:
```bash
npm start
```

Expected: Expo dev server starts successfully

**Step 2: Test on iOS simulator (if available)**

Run:
```bash
npm run ios
```

OR press `i` in the Expo dev server terminal.

Expected:
- App loads with loading screen
- Migrations run successfully (check console logs)
- Home screen shows "Onboarding Status: Not Completed ❌"

**Step 3: Test onboarding completion**

1. Press "Complete Onboarding" button
2. Observe status changes to "Completed ✅"
3. Reload app (shake device/simulator, press "r")
4. Verify status persists as "Completed ✅"

**Step 4: Test error handling**

Check console logs for:
- `[DB] Migrations completed successfully`
- No error alerts or crashes

**Step 5: Verify database file**

The SQLite database file should exist at:
- iOS: Library/LocalDatabase/tabagismo.db
- Android: databases/tabagismo.db

You can use `npm run db:studio` to browse the database visually.

**Step 6: Document test results**

Create a quick test summary (no commit needed, just verification):
- ✅ App initializes without crashes
- ✅ Migrations run successfully
- ✅ Onboarding status reads correctly
- ✅ Onboarding completion saves to DB
- ✅ Data persists across app restarts
- ✅ Error handling works (no crashes)

---

## Task 14: Update README Documentation

**Files:**
- Modify: `README.md`

**Step 1: Add database section to README**

Add this section to `README.md` after the project description:

```markdown
## Database

This app uses SQLite for local data storage with Drizzle ORM and TanStack Query.

### Key Commands

- `npm run db:generate` - Generate migrations from schema changes
- `npm run db:studio` - Open visual database browser

### Architecture

- **Schema:** `/db/schema/` - TypeScript table definitions
- **Repositories:** `/db/repositories/` - Typed query/mutation hooks
- **Migrations:** Auto-applied on app start

### Adding New Tables

1. Create schema file in `/db/schema/new-table.ts`
2. Export from `/db/schema/index.ts`
3. Run `npm run db:generate` to create migration
4. Create repository file with typed hooks

See `CLAUDE.md` for detailed conventions.
```

**Step 2: Commit README update**

```bash
git add README.md
git commit -m "docs: add database section to README"
```

---

## Success Criteria Checklist

After completing all tasks, verify:

- ✅ All dependencies installed (drizzle-orm, expo-sqlite, @tanstack/react-query)
- ✅ Drizzle config created and migrations generate successfully
- ✅ Settings schema defined with TypeScript types
- ✅ Database client and migration runner created
- ✅ Error handling utilities implemented (4 layers)
- ✅ TanStack Query client configured with local-first optimizations
- ✅ Settings repository with useOnboardingStatus and useCompleteOnboarding hooks
- ✅ Database integrated into app layout with migrations
- ✅ Test component demonstrates full flow
- ✅ Manual testing passes (data persists across restarts)
- ✅ Documentation updated

## Next Steps

After implementation:
1. Build actual onboarding flow screens
2. Add more tables as needed (quit attempts, smoking logs, etc.)
3. Consider adding database encryption for sensitive health data
4. Set up automated tests for repository hooks
