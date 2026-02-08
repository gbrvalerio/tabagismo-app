# Tabagismo - Smoking Cessation App

React Native Expo app for smoking cessation. Local-first with SQLite.

---

## Platform Support

- ✅ iOS
- ✅ Android
- ❌ Web (not supported)

---

## Language/Idiom

The code should be in english but the user facing strings in Brazilian Portuguese

## Tech Stack

- **Framework:** Expo 54 + React Native 0.81.5
- **Database:** Drizzle ORM + expo-sqlite
- **Data Layer:** TanStack Query v5
- **Navigation:** expo-router (file-based)
- **Language:** TypeScript

---

## Quick Links

📁 **[Database Guide](/db/CLAUDE.md)** - Schemas, migrations, repositories
📱 **[App & Navigation Guide](/app/CLAUDE.md)** - Screens, routing, layouts
📋 **[Architecture Decisions](/docs/plans/)** - Detailed design docs

### Add a Feature

1. **Database table?** → See [/db/CLAUDE.md](/db/CLAUDE.md)
2. **New screen?** → See [/app/CLAUDE.md](/app/CLAUDE.md)
3. **Reusable component?** → Create in `/components`

---

## Architecture Overview

```
┌─────────────────┐
│   Components    │  React Native UI
├─────────────────┤
│  TanStack Query │  Caching & state management
├─────────────────┤
│  Repositories   │  Typed hooks (useUsers, etc.)
├─────────────────┤
│  Drizzle ORM    │  Type-safe SQL builder
├─────────────────┤
│  SQLite         │  Local database
└─────────────────┘
```

**Pattern:** Repository hooks → Never access `db` directly in components

---

## Project Structure

```
/app                # Screens (file-based routing)
  /(tabs)           # Tab navigator
  /_layout.tsx      # Root layout (providers)

/db                 # Database layer
  /schema           # Table definitions
  /repositories     # Typed query/mutation hooks
  /migrations       # Auto-generated migrations

/components         # Reusable UI components

/lib                # Utilities
  /query-client.ts  # TanStack Query config
  /error-handler.ts # Error logging & alerts

/docs/plans         # Architecture decisions
```

---

## Core Principles

### 1. Repository Pattern

✅ **DO:** Use typed hooks
❌ **DON'T:** Access database directly

```typescript
// ✅ Good
const { data } = useUsers();

// ❌ Bad
const users = await db.select().from(users);
```

### 2. Local-First

- All data stored in SQLite
- No server sync (for now)
- TanStack Query handles caching

### 3. Type Safety

- Drizzle ORM generates types from schema
- End-to-end TypeScript
- No runtime schema validation needed

### 4. Testing

- Always develop new code by using TDD.
- All code created should include it's tests
- Tests should be comprehensive and test real scenarios and edge cases
- 90% coverage is required, push and CI will fail.
- In the red phase of the TDD development, use --no-verify to commit code skipping failing tests.

### 5. Claude Files

- At the end of a feature creation, fix or update, update/create the relevant CLAUDE.md files for that feature. No need to be super granular, just add relevant quick information that would affect future development.

---

## Common Tasks

### Add Database Table

→ [Full guide in /db/CLAUDE.md](/db/CLAUDE.md)

1. Create schema in `/db/schema/users.ts`
2. Run `npm run db:generate`
3. Convert `.sql` to `.ts` (Metro bundler requirement)
4. Create repository in `/db/repositories/users.repository.ts`

### Add Screen

→ [Full guide in /app/CLAUDE.md](/app/CLAUDE.md)

1. Create file in `/app/(tabs)/profile.tsx`
2. Export default component
3. Configure tab icon in `_layout.tsx`

### Add Component

1. Create in `/components/Button.tsx`
2. Export component
3. Import in screens: `import { Button } from '@/components/Button'`

---

### File Naming

- **Screens:** `kebab-case.tsx` in `/app`
- **Components:** `PascalCase.tsx` in `/components`
- **Schemas:** `kebab-case.ts` in `/db/schema`
- **Repositories:** `kebab-case.repository.ts` in `/db/repositories`

### Query Keys

```typescript
["users"][("users", id)][("users", "search")]; // List // Single item // Specific operation
```
