# SQLite + TanStack Query Data System Design

**Date:** 2026-02-07
**Status:** Approved
**App:** Tabagismo (Smoking Cessation)

## Overview

Local-only data system using SQLite + TanStack Query for a React Native Expo app. Starting with simple onboarding status tracking, designed to scale to relational data (quit attempts, smoking logs, milestones).

## Architecture Decision

**Selected: Drizzle ORM + expo-sqlite + TanStack Query**

### Why Drizzle?
- Schema-as-code with automatic migrations
- Full TypeScript type safety
- Repository pattern fits naturally
- Lightweight (~20kb)
- Works seamlessly with TanStack Query

### Alternatives Considered
- **Raw SQL**: Too much boilerplate, no type safety
- **WatermelonDB**: Overkill, doesn't use TanStack Query, heavier bundle

## Project Structure

```
/db
  /schema
    settings.ts          # App settings (onboarding status)
    index.ts            # Export all schemas
  /repositories
    settings.repository.ts  # Typed hooks (useOnboardingStatus, etc.)
    index.ts            # Export all repositories
  /migrations
    [auto-generated]    # Drizzle generates from schema
  client.ts             # SQLite connection + Drizzle instance
  migrate.ts            # Auto-migration runner
  index.ts              # Public API

/lib
  query-client.ts       # TanStack Query configuration
  error-handler.ts      # Logging + alerts

/app
  _layout.tsx           # QueryClientProvider + error boundary
```

## Database Schema

### Settings Table (Key-Value)
```typescript
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

**Current use case:** `onboardingCompleted: "true"`

**Future tables:** quit-attempts, smoking-logs, milestones (to be added as needed)

## Repository Pattern

All database access wrapped in typed hooks:

```typescript
// Query hook
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

// Mutation hook
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await db
        .insert(settings)
        .values({ key: 'onboardingCompleted', value: 'true' })
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

**Benefits:**
- Components never write SQL
- Type-safe queries
- Centralized query logic
- Auto cache invalidation

## Database Initialization

1. **App start**: Run migrations in `_layout.tsx` before rendering
2. **Migration check**: Auto-apply pending migrations from `/db/migrations`
3. **Loading state**: Show loading screen until DB ready
4. **Single connection**: One SQLite instance shared across app

```typescript
useEffect(() => {
  runMigrations()
    .then(() => setDbReady(true))
    .catch(console.error);
}, []);
```

## Error Handling (Layered)

### Layer 1: Silent Logging
All errors logged to console (+ crash reporting later)

### Layer 2: Error States
Components receive error objects from hooks for custom handling

### Layer 3: Error Boundary
Catches unhandled React render errors

### Layer 4: User Alerts
Query/mutation errors show Alert dialogs automatically

**Implementation:**
- `error-handler.ts` - logging + alert utilities
- TanStack Query `onError` callbacks - automatic alerts
- `ErrorBoundary` component wrapping app root

## TanStack Query Configuration

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,    // 5 min (local data)
      gcTime: 1000 * 60 * 60,       // 1 hour cache
      refetchOnWindowFocus: false,  // Mobile app
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**Optimizations for local-only data:**
- Longer staleTime (5 minutes) - local data doesn't change externally
- No window focus refetch - not relevant for mobile
- Aggressive garbage collection (1 hour) - keep cache longer

## Migration Workflow

### Development
1. Edit schema file (e.g., add column to `settings.ts`)
2. Run `npm run db:generate` - generates migration SQL
3. Migration auto-applies on next app start

### Adding New Tables
1. Create `/db/schema/new-table.ts`
2. Export from `/db/schema/index.ts`
3. Generate migration
4. Create repository file with hooks

## Dependencies to Add

```bash
npm install drizzle-orm expo-sqlite
npm install @tanstack/react-query
npm install -D drizzle-kit
```

**Package scripts:**
```json
{
  "db:generate": "drizzle-kit generate",
  "db:studio": "drizzle-kit studio"
}
```

## Future Considerations

### When Adding Relational Tables
- Foreign keys for relationships (e.g., quit attempts → user)
- Indexes on frequently queried columns
- Cascade deletes where appropriate

### Potential Enhancements
- Offline-first sync (if adding cloud backup later)
- Database encryption (for sensitive health data)
- Export/import functionality (backup/restore)
- Query result pagination (for large datasets)

## Success Criteria

✅ Onboarding status persists across app restarts
✅ Type-safe database queries throughout app
✅ Automatic migrations on schema changes
✅ Comprehensive error handling (logging + user feedback)
✅ Clean component code (no SQL strings)
✅ Easy to add new tables/repositories
