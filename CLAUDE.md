# Tabagismo - Smoking Cessation App

React Native Expo app for smoking cessation. Local-first architecture with SQLite + TanStack Query.

## Tech Stack
- **Framework:** Expo 54 + React Native 0.81.5
- **Database:** Drizzle ORM + expo-sqlite
- **Data Layer:** TanStack Query v5
- **Navigation:** expo-router (file-based)
- **Language:** TypeScript

---

## Creating New Features

### 1. Add Database Table

**Create schema in `/db/schema/new-table.ts`:**
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const tableName = sqliteTable('table_name', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type TableName = typeof tableName.$inferSelect;
export type NewTableName = typeof tableName.$inferInsert;
```

**Export from `/db/schema/index.ts`:**
```typescript
export * from './new-table';
```

**Generate migration:**
```bash
npm run db:generate
```

**CRITICAL - Metro Bundler Workaround:**

Drizzle generates `.sql` files that Metro can't import. Convert each new migration:

1. Open `/db/migrations/XXXX_name.sql`
2. Create `/db/migrations/XXXX_name.ts`:
   ```typescript
   export default `<paste SQL content here>`;
   ```
3. Update `/db/migrations/migrations.ts`:
   ```typescript
   import mXXXX from './XXXX_name'; // Remove .sql extension
   ```

### 2. Create Repository

**Create `/db/repositories/entity.repository.ts`:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { tableName } from '../schema';

// Query hook
export function useEntity(id: number) {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: async () => {
      return await db.select()
        .from(tableName)
        .where(eq(tableName.id, id))
        .get();
    },
  });
}

// Mutation hook
export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewTableName) => {
      return await db.insert(tableName).values(data).returning();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity'] });
    },
  });
}
```

**Export from `/db/repositories/index.ts`:**
```typescript
export * from './entity.repository';
```

### 3. Use in Components

**Import from `/db`:**
```typescript
import { useEntity, useCreateEntity } from '@/db';

export default function MyScreen() {
  const { data, isLoading, error } = useEntity(1);
  const createMutation = useCreateEntity();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <View>
      <Text>{data?.name}</Text>
      <Button
        onPress={() => createMutation.mutate({ name: 'New' })}
        disabled={createMutation.isPending}
      />
    </View>
  );
}
```

---

## Code Conventions

### Database Access Rules
- ✅ **Always use repository hooks** in components
- ❌ **Never use `db` directly** in components
- ✅ **Query keys:** `['entity', 'action', ...params]`
- ✅ **Mutations:** Always invalidate related queries in `onSuccess`

### Error Handling
- **Automatic logging:** All errors logged via `handleQueryError`
- **User alerts:** TanStack Query errors trigger React Native alerts
- **Component errors:** Caught by ErrorBoundary in `app/_layout.tsx`
- **Manual handling:** Use error state from hooks when needed

### Repository Pattern
```typescript
// ✅ Good - Type-safe, cached, error-handled
const { data } = useOnboardingStatus();

// ❌ Bad - No caching, no error handling, not reusable
const result = await db.select().from(settings).where(...);
```

---

## Project Structure
```
/db
  /schema         # Table definitions (*.ts)
  /repositories   # Typed hooks (*.repository.ts)
  /migrations     # SQL as TS modules (*.ts)
  /client.ts      # Drizzle instance
  /migrate.ts     # Auto-migration runner
  /index.ts       # Public API
/lib
  /query-client.ts   # TanStack Query config
  /error-handler.ts  # Logging & alerts
/app
  /(tabs)         # Tab navigation screens
  /_layout.tsx    # Root with providers
/components       # Reusable UI
```

---

## Commands

```bash
npm run db:generate   # Generate migrations from schema
npm run db:studio     # Visual database browser (localhost:4983)
npm start             # Start Expo dev server
npx tsc --noEmit      # Type check without building
```

---

## Migration Workflow

1. **Edit schema** → `/db/schema/*.ts`
2. **Generate SQL** → `npm run db:generate`
3. **Convert to TS** → `/db/migrations/XXXX.sql` → `/db/migrations/XXXX.ts`
4. **Update imports** → `/db/migrations/migrations.ts`
5. **Auto-apply** → Migrations run on app start via `runMigrations()`

**Why convert SQL to TS?** Metro bundler (React Native) cannot import `.sql` files. Converting to TS modules with string exports solves this.

---

## Current Schema

- **settings:** Key-value store (e.g., `onboardingCompleted`)

---

## Design Docs

Detailed architecture decisions: `/docs/plans/`
