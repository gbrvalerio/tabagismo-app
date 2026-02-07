# Tabagismo - Smoking Cessation App

## Project Overview
React Native Expo app helping users quit smoking. Local-only data storage using SQLite + TanStack Query.

## Tech Stack
- **Framework:** Expo 54 + React Native 0.81.5
- **Navigation:** expo-router (file-based)
- **Database:** Drizzle ORM + expo-sqlite
- **Data Layer:** TanStack Query
- **Language:** TypeScript

## Data Architecture

### Database Pattern
- **Schema-as-code:** Define tables in `/db/schema/*.ts`
- **Auto migrations:** Run on app start via `runMigrations()`
- **Repository pattern:** Typed hooks wrap all queries/mutations
- **Local-first:** No server sync, all data stored locally

### Current Schema
- `settings` table: Key-value store (onboarding status)

### Adding New Tables
1. Create schema file in `/db/schema/`
2. Export from `/db/schema/index.ts`
3. Run `npm run db:generate`
4. Create repository with typed hooks in `/db/repositories/`

## Code Conventions

### Database Access
- **Always use repositories** - never raw SQL in components
- **Query keys:** Scoped by domain `['entity', 'operation']`
- **Mutations:** Always invalidate related queries on success

### Error Handling
- All errors logged automatically
- User-facing alerts for query/mutation failures
- Error boundary catches unhandled errors
- Components can handle errors via returned error states

### Repository Pattern Example
```typescript
// Good: Typed hook
const { data, isLoading } = useOnboardingStatus();

// Bad: Direct SQL in component
const result = await db.select()...
```

## Project Structure
```
/db               # Database layer
  /schema         # Table definitions
  /repositories   # Typed query/mutation hooks
  /migrations     # Auto-generated SQL
/lib              # Shared utilities
/app              # expo-router pages
/components       # Reusable components
```

## Key Commands
```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:studio    # Visual database browser
```

## Migration Workflow
Schema changes auto-apply on app start. Run `db:generate` after editing schema files to create migration SQL.

## Design Docs
See `/docs/plans/` for detailed architecture decisions and rationale.
