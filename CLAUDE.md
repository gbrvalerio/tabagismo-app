# Tabagismo - Smoking Cessation App

React Native Expo app for smoking cessation. Local-first with SQLite.

---

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

---

## Getting Started

### Run the App

```bash
npm install        # Install dependencies
npm start          # Start Expo dev server
# Then press 'i' for iOS or 'a' for Android
```

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

## Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator

# Database
npm run db:generate    # Generate migrations
npm run db:studio      # Open Drizzle Studio (GUI)

# Code Quality
npx tsc --noEmit       # Type check
npm run lint           # Run linter
```

---

## Key Files

| File | Purpose |
|------|---------|
| `/app/_layout.tsx` | Root layout (providers, migrations) |
| `/db/index.ts` | Database public API |
| `/db/client.ts` | Drizzle instance |
| `/lib/query-client.ts` | TanStack Query config |
| `/lib/error-handler.ts` | Error logging & alerts |

---

## Conventions

### Imports

```typescript
// Database
import { useUsers, useCreateUser } from '@/db';

// Navigation
import { router } from 'expo-router';

// React Native
import { View, Text } from 'react-native';
```

### File Naming

- **Screens:** `kebab-case.tsx` in `/app`
- **Components:** `PascalCase.tsx` in `/components`
- **Schemas:** `kebab-case.ts` in `/db/schema`
- **Repositories:** `kebab-case.repository.ts` in `/db/repositories`

### Query Keys

```typescript
['users']              // List
['users', id]          // Single item
['users', 'search']    // Specific operation
```

---

## Troubleshooting

### Metro bundler error: "Unable to resolve .sql"
**Fix:** Convert migration to `.ts` → [See db/CLAUDE.md](/db/CLAUDE.md)

### TypeScript errors after schema change
**Fix:** Run `npm run db:generate` to regenerate types

### Navigation not working
**Fix:** Check file is in `/app` and exported as `export default`

### Query not updating
**Fix:** Invalidate queries in mutation `onSuccess`

---

## Current Features

- ✅ SQLite database with auto-migrations
- ✅ Settings table (onboarding status)
- ✅ Error handling & logging
- ✅ Tab navigation
- ✅ Type-safe database access

---

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Expo Router](https://docs.expo.dev/router/introduction/)
