# Database Layer Guide

SQLite + Drizzle ORM + TanStack Query for local-first data storage.

---

## Quick Start: Add a New Table

### 1. Define Schema

**Create `/db/schema/users.ts`:**
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

**Export from `/db/schema/index.ts`:**
```typescript
export * from './users';
```

### 2. Generate Migration

```bash
npm run db:generate
```

### 3. Convert Migration (CRITICAL)

Drizzle generates `.sql` files that Metro bundler cannot import.

**Steps:**
1. Find new file: `/db/migrations/0001_name.sql`
2. Copy SQL content
3. Create `/db/migrations/0001_name.ts`:
   ```typescript
   export default `CREATE TABLE \`users\` (
     \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
     \`name\` text NOT NULL,
     \`email\` text NOT NULL,
     \`created_at\` integer NOT NULL
   );
   `;
   ```
4. Update `/db/migrations/migrations.ts`:
   ```typescript
   import m0001 from './0001_name'; // Remove .sql extension

   export default {
     journal,
     migrations: {
       m0000,
       m0001  // Add new migration
     }
   };
   ```

### 4. Create Repository

**Create `/db/repositories/users.repository.ts`:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { users, type NewUser } from '../schema';

// Query: Get all users
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      return await db.select().from(users).all();
    },
  });
}

// Query: Get single user
export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      return await db.select()
        .from(users)
        .where(eq(users.id, id))
        .get();
    },
  });
}

// Mutation: Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewUser) => {
      const result = await db.insert(users)
        .values(data)
        .returning();
      return result[0];
    },
    onSuccess: () => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Mutation: Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<NewUser> }) => {
      const result = await db.update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return result[0];
    },
    onSuccess: (_, variables) => {
      // Invalidate specific user and list
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Mutation: Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await db.delete(users).where(eq(users.id, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

**Export from `/db/repositories/index.ts`:**
```typescript
export * from './users.repository';
```

### 5. Use in Components

```typescript
import { useUsers, useCreateUser } from '@/db';

export default function UsersScreen() {
  const { data: users, isLoading } = useUsers();
  const createMutation = useCreateUser();

  if (isLoading) return <LoadingSpinner />;

  return (
    <View>
      {users?.map(user => <Text key={user.id}>{user.name}</Text>)}

      <Button
        onPress={() => createMutation.mutate({
          name: 'John',
          email: 'john@example.com'
        })}
        disabled={createMutation.isPending}
      />
    </View>
  );
}
```

---

## Rules

### ✅ DO
- Use repository hooks in components
- Define query keys as `['entity', ...params]`
- Invalidate queries in mutation `onSuccess`
- Export types from schema files
- Convert all `.sql` migrations to `.ts`

### ❌ DON'T
- Import `db` directly in components
- Write raw SQL queries in components
- Skip migration conversion (Metro will fail)
- Forget to export new schemas/repositories

---

## Query Keys Pattern

```typescript
['users']                             // List all users
['users', userId]                     // Single user
['users', 'search']                   // Search results
['settings', 'theme']                 // Specific setting
['settings', 'onboardingCompleted']   // Onboarding status
['onboarding', 'questions']           // All onboarding questions
['onboarding', 'answers']             // All onboarding answers
```

**Why scoped?** TanStack Query uses keys for caching and invalidation.

---

## Common Patterns

### Optimistic Updates

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => { /* ... */ },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['users', id] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['users', id]);

      // Optimistically update
      queryClient.setQueryData(['users', id], (old) => ({ ...old, ...data }));

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['users', variables.id], context?.previous);
    },
    onSettled: (_, __, variables) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}
```

### Dependent Queries

```typescript
export function useUserPosts(userId: number) {
  return useQuery({
    queryKey: ['posts', userId],
    queryFn: async () => {
      return await db.select()
        .from(posts)
        .where(eq(posts.userId, userId))
        .all();
    },
    enabled: !!userId, // Only run if userId exists
  });
}
```

### Pagination

```typescript
export function useUsersPaginated(page: number, pageSize = 10) {
  return useQuery({
    queryKey: ['users', 'paginated', page],
    queryFn: async () => {
      return await db.select()
        .from(users)
        .limit(pageSize)
        .offset(page * pageSize)
        .all();
    },
  });
}
```

---

## Error Handling

Errors are handled automatically:
1. **Logged** via `logError()` in `/lib/error-handler.ts`
2. **Alerted** to user via React Native `Alert`
3. **Available** in component via `error` state

**Manual error handling:**
```typescript
const { data, error, isError } = useUsers();

if (isError) {
  return <ErrorMessage message={error.message} />;
}
```

---

## Drizzle ORM Queries

### Select

```typescript
// All rows
await db.select().from(users).all();

// Single row
await db.select().from(users).where(eq(users.id, 1)).get();

// Specific columns
await db.select({ name: users.name }).from(users).all();

// With where
await db.select().from(users).where(eq(users.email, 'test@example.com')).all();
```

### Insert

```typescript
// Single insert
await db.insert(users).values({ name: 'John', email: 'john@example.com' });

// With returning
const [user] = await db.insert(users)
  .values({ name: 'John', email: 'john@example.com' })
  .returning();

// Bulk insert
await db.insert(users).values([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
]);
```

### Update

```typescript
await db.update(users)
  .set({ name: 'John Doe' })
  .where(eq(users.id, 1));

// With returning
const [updated] = await db.update(users)
  .set({ name: 'John Doe' })
  .where(eq(users.id, 1))
  .returning();
```

### Delete

```typescript
await db.delete(users).where(eq(users.id, 1));
```

### Joins

```typescript
await db.select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId))
  .where(eq(users.id, 1))
  .all();
```

---

## Commands

```bash
npm run db:generate   # Generate migration from schema changes
npm run db:studio     # Open Drizzle Studio (localhost:4983)
```

---

## File Structure

```
/db
  /schema
    /settings.ts              # Settings table schema
    /questions.ts             # Questions table + QuestionType/QuestionCategory enums
    /onboarding-answers.ts    # Onboarding answers table
    /index.ts                 # Export all schemas
  /repositories
    /settings.repository.ts   # Settings hooks (useOnboardingStatus, useCompleteOnboarding)
    /onboarding.repository.ts # Onboarding hooks (useOnboardingQuestions, useOnboardingAnswers, useSaveAnswer, useDeleteDependentAnswers)
    /index.ts                 # Export all repositories
  /seed
    /seed-questions.ts        # Seeds initial onboarding questions
  /migrations
    /0000_name.ts                   # Migration as TS module
    /0001_add_onboarding_tables.ts  # Onboarding tables migration
    /migrations.ts                  # Migration registry
    /meta/            # Drizzle metadata
  /client.ts          # Drizzle instance
  /migrate.ts         # Migration runner
  /index.ts           # Public API (exports all)
```

---

## Current Tables

- **settings:** Key-value store (`key`, `value`, `updatedAt`)
- **questions:** Onboarding questions (`id`, `key`, `order`, `type`, `category`, `questionText`, `required`, `dependsOnQuestionKey`, `dependsOnValue`, `metadata`, `createdAt`)
- **onboarding_answers:** User answers (`id`, `questionKey`, `userId`, `answer`, `answeredAt`, `updatedAt`)

### Question Types & Categories

```typescript
enum QuestionType { TEXT, NUMBER, SINGLE_CHOICE, MULTIPLE_CHOICE }
enum QuestionCategory { PROFILE, ADDICTION, HABITS, MOTIVATION, GOALS }
```

### Onboarding Repository Hooks

| Hook | Type | Query Key | Description |
|------|------|-----------|-------------|
| `useOnboardingQuestions()` | Query | `['onboarding', 'questions']` | All questions ordered by `order` |
| `useOnboardingAnswers()` | Query | `['onboarding', 'answers']` | All saved answers |
| `useSaveAnswer()` | Mutation | Invalidates answers | Upserts answer by `questionKey` (insert or update via existence check) |
| `useDeleteDependentAnswers()` | Mutation | Invalidates answers | Deletes answers for questions that depend on a parent |
| `useOnboardingStatus()` | Query | `['settings', 'onboardingCompleted']` | Returns `boolean` — whether onboarding is done |
| `useCompleteOnboarding()` | Mutation | Invalidates status | Sets `onboardingCompleted` to `true` |

### Conditional Questions

Questions can depend on a parent question's answer via `dependsOnQuestionKey` and `dependsOnValue`. The flow engine (`lib/onboarding-flow.ts`) filters applicable questions at runtime.

### Auto-Seeding

On first launch, `_layout.tsx` checks if questions table is empty and runs `seedOnboardingQuestions()` from `db/seed/seed-questions.ts`.

---

## Troubleshooting

### Metro bundler error: "Unable to resolve .sql"
**Fix:** Convert migration to `.ts` file (see step 3 above)

### Migration not applying
**Fix:** Check console for "[DB] Migrations completed successfully"

### Type errors in repository
**Fix:** Ensure schema types are exported: `export type User = typeof users.$inferSelect`

### Jest fails with "Unexpected identifier TABLE" from migrations.js
**Cause:** `drizzle-kit generate` auto-creates a `migrations.js` file that imports `.sql` files, which Jest can't parse.
**Fix:** The `db:generate` script auto-removes `migrations.js` after generation. If it reappears, delete it manually (`rm db/migrations/migrations.js`) and clear Jest cache (`npx jest --clearCache`). The file is in `.gitignore`. We use `migrations.ts` instead.
