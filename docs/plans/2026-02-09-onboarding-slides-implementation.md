# Onboarding Slides Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement swipeable informational onboarding slides before the questions flow

**Architecture:** Database-driven slides with FlatList pagination, repository pattern for data access, React Native Reanimated for animations, follows existing notification-permission design patterns

**Tech Stack:** Expo 54, React Native 0.81.5, Drizzle ORM, TanStack Query v5, react-native-reanimated, expo-haptics

---

## Task 1: Database Schema - Onboarding Slides Table

**Files:**
- Create: `db/schema/onboarding-slides.ts`
- Modify: `db/schema/user-settings.ts:15-25` (add slidesCompleted field)
- Test: `db/schema/onboarding-slides.test.ts`

**Step 1: Write the failing test**

Create `db/schema/onboarding-slides.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import { onboardingSlides } from './onboarding-slides';
import { sql } from 'drizzle-orm';
import { db } from '../index';

describe('onboarding_slides schema', () => {
  it('should have all required columns', () => {
    const columns = Object.keys(onboardingSlides);
    expect(columns).toContain('id');
    expect(columns).toContain('order');
    expect(columns).toContain('icon');
    expect(columns).toContain('title');
    expect(columns).toContain('description');
    expect(columns).toContain('metadata');
    expect(columns).toContain('createdAt');
  });

  it('should have id as primary key', () => {
    expect(onboardingSlides.id.primary).toBe(true);
  });

  it('should have order as integer not null', () => {
    expect(onboardingSlides.order.notNull).toBe(true);
    expect(onboardingSlides.order.dataType).toBe('number');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/schema/onboarding-slides.test.ts`
Expected: FAIL with "Cannot find module './onboarding-slides'"

**Step 3: Write minimal implementation**

Create `db/schema/onboarding-slides.ts`:

```typescript
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const onboardingSlides = sqliteTable('onboarding_slides', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  order: integer('order').notNull(),
  icon: text('icon').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type OnboardingSlide = typeof onboardingSlides.$inferSelect;
export type NewOnboardingSlide = typeof onboardingSlides.$inferInsert;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/schema/onboarding-slides.test.ts`
Expected: PASS

**Step 5: Update user-settings schema test**

Modify `db/schema/user-settings.test.ts` to add test for slidesCompleted:

```typescript
it('should have slidesCompleted boolean field with default false', () => {
  expect(userSettings.slidesCompleted.notNull).toBe(true);
  expect(userSettings.slidesCompleted.default).toBeDefined();
});
```

**Step 6: Run test to verify it fails**

Run: `npm test -- db/schema/user-settings.test.ts`
Expected: FAIL with "Cannot read property 'notNull' of undefined"

**Step 7: Update user-settings schema**

Modify `db/schema/user-settings.ts` to add slidesCompleted field:

```typescript
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique(),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' })
    .notNull()
    .default(false),
  slidesCompleted: integer('slides_completed', { mode: 'boolean' })
    .notNull()
    .default(false),
  notificationPermissionGranted: integer('notification_permission_granted', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
```

**Step 8: Run test to verify it passes**

Run: `npm test -- db/schema/user-settings.test.ts`
Expected: PASS

**Step 9: Commit**

```bash
git add db/schema/onboarding-slides.ts db/schema/onboarding-slides.test.ts db/schema/user-settings.ts db/schema/user-settings.test.ts
git commit --no-verify -m "test: add onboarding slides schema with tests (red phase)"
```

---

## Task 2: Database Migration

**Files:**
- Create: `db/migrations/XXXX_add_onboarding_slides.ts`
- Modify: `db/index.ts` (export new schema)

**Step 1: Generate migration**

Run: `npm run db:generate`
Expected: Creates `.sql` file in `db/migrations/`

**Step 2: Convert SQL to TypeScript migration**

Find the generated SQL file (e.g., `0004_add_onboarding_slides.sql`) and convert to TypeScript:

Create `db/migrations/0004_add_onboarding_slides.ts`:

```typescript
import { sql } from 'drizzle-orm';
import type { SQLiteDatabase } from 'expo-sqlite';

export async function migrate(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS onboarding_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      "order" INTEGER NOT NULL,
      icon TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    ALTER TABLE user_settings ADD COLUMN slides_completed INTEGER NOT NULL DEFAULT 0;
  `);
}
```

**Step 3: Delete the .sql file**

Run: `rm db/migrations/0004_add_onboarding_slides.sql`

**Step 4: Update db/index.ts to export schema**

Modify `db/index.ts`:

```typescript
export * from './schema/onboarding-slides';
// ... other exports
```

**Step 5: Test migration runs**

Run: `npm test -- db/migrations`
Expected: Migration applies successfully

**Step 6: Commit**

```bash
git add db/migrations/0004_add_onboarding_slides.ts db/index.ts
git commit -m "feat: add onboarding slides migration"
```

---

## Task 3: Seed Data for Slides

**Files:**
- Create: `db/seed/onboarding-slides.seed.ts`
- Test: `db/seed/onboarding-slides.seed.test.ts`

**Step 1: Write the failing test**

Create `db/seed/onboarding-slides.seed.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { seedOnboardingSlides } from './onboarding-slides.seed';
import { db } from '../index';
import { onboardingSlides } from '../schema/onboarding-slides';
import { eq } from 'drizzle-orm';

describe('seedOnboardingSlides', () => {
  beforeEach(async () => {
    await db.delete(onboardingSlides);
  });

  it('should insert 3 slides', async () => {
    await seedOnboardingSlides();
    const slides = await db.select().from(onboardingSlides);
    expect(slides).toHaveLength(3);
  });

  it('should have slides ordered 1, 2, 3', async () => {
    await seedOnboardingSlides();
    const slides = await db.select().from(onboardingSlides).orderBy(onboardingSlides.order);
    expect(slides[0].order).toBe(1);
    expect(slides[1].order).toBe(2);
    expect(slides[2].order).toBe(3);
  });

  it('should have correct titles in Portuguese', async () => {
    await seedOnboardingSlides();
    const slides = await db.select().from(onboardingSlides).orderBy(onboardingSlides.order);
    expect(slides[0].title).toBe('Parar de fumar é difícil sozinho');
    expect(slides[1].title).toBe('Nós ajudamos você nessa jornada');
    expect(slides[2].title).toBe('Vamos começar juntos');
  });

  it('should have metadata on slide 2 with benefits', async () => {
    await seedOnboardingSlides();
    const slide2 = await db.select().from(onboardingSlides).where(eq(onboardingSlides.order, 2)).get();
    expect(slide2.metadata).toBeTruthy();
    const metadata = JSON.parse(slide2.metadata!);
    expect(metadata.showBenefits).toBe(true);
    expect(metadata.benefits).toHaveLength(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/seed/onboarding-slides.seed.test.ts`
Expected: FAIL with "Cannot find module './onboarding-slides.seed'"

**Step 3: Write minimal implementation**

Create `db/seed/onboarding-slides.seed.ts`:

```typescript
import { db } from '../index';
import { onboardingSlides } from '../schema/onboarding-slides';

export async function seedOnboardingSlides() {
  await db.insert(onboardingSlides).values([
    {
      order: 1,
      icon: '@/assets/images/onboarding-1.svg',
      title: 'Parar de fumar é difícil sozinho',
      description: 'Você não está sozinho. Milhares de pessoas enfrentam essa mesma batalha todos os dias.',
      metadata: null,
    },
    {
      order: 2,
      icon: '@/assets/images/onboarding-2.svg',
      title: 'Nós ajudamos você nessa jornada',
      description: 'Com ferramentas práticas e suporte personalizado:',
      metadata: JSON.stringify({
        showBenefits: true,
        benefits: [
          'Acompanhe seu progresso em tempo real',
          'Ganhe moedas e conquiste metas',
          'Receba lembretes motivacionais',
        ],
      }),
    },
    {
      order: 3,
      icon: '@/assets/images/onboarding-3.svg',
      title: 'Vamos começar juntos',
      description: 'Responda algumas perguntas rápidas e inicie sua jornada livre do cigarro.',
      metadata: null,
    },
  ]);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/seed/onboarding-slides.seed.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/seed/onboarding-slides.seed.ts db/seed/onboarding-slides.seed.test.ts
git commit -m "feat: add onboarding slides seed data"
```

---

## Task 4: Repository - useOnboardingSlides Hook

**Files:**
- Create: `db/repositories/onboarding-slides.repository.ts`
- Test: `db/repositories/onboarding-slides.repository.test.ts`

**Step 1: Write the failing test**

Create `db/repositories/onboarding-slides.repository.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useOnboardingSlides } from './onboarding-slides.repository';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from '../index';
import { onboardingSlides } from '../schema/onboarding-slides';
import { seedOnboardingSlides } from '../seed/onboarding-slides.seed';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOnboardingSlides', () => {
  beforeEach(async () => {
    await db.delete(onboardingSlides);
    await seedOnboardingSlides();
  });

  it('should fetch slides ordered by order field', async () => {
    const { result } = renderHook(() => useOnboardingSlides(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data![0].order).toBe(1);
    expect(result.current.data![1].order).toBe(2);
    expect(result.current.data![2].order).toBe(3);
  });

  it('should return slides with all required fields', async () => {
    const { result } = renderHook(() => useOnboardingSlides(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const slide = result.current.data![0];
    expect(slide).toHaveProperty('id');
    expect(slide).toHaveProperty('order');
    expect(slide).toHaveProperty('icon');
    expect(slide).toHaveProperty('title');
    expect(slide).toHaveProperty('description');
    expect(slide).toHaveProperty('metadata');
    expect(slide).toHaveProperty('createdAt');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/onboarding-slides.repository.test.ts`
Expected: FAIL with "Cannot find module './onboarding-slides.repository'"

**Step 3: Write minimal implementation**

Create `db/repositories/onboarding-slides.repository.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { db } from '../index';
import { onboardingSlides } from '../schema/onboarding-slides';
import { asc } from 'drizzle-orm';

export function useOnboardingSlides() {
  return useQuery({
    queryKey: ['onboarding-slides'],
    queryFn: async () => {
      return await db
        .select()
        .from(onboardingSlides)
        .orderBy(asc(onboardingSlides.order));
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/onboarding-slides.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/onboarding-slides.repository.ts db/repositories/onboarding-slides.repository.test.ts
git commit -m "feat: add useOnboardingSlides repository hook"
```

---

## Task 5: Repository - useMarkSlidesCompleted Hook

**Files:**
- Modify: `db/repositories/onboarding-slides.repository.ts`
- Modify: `db/repositories/onboarding-slides.repository.test.ts`

**Step 1: Write the failing test**

Add to `db/repositories/onboarding-slides.repository.test.ts`:

```typescript
import { useMarkSlidesCompleted } from './onboarding-slides.repository';
import { userSettings } from '../schema/user-settings';

describe('useMarkSlidesCompleted', () => {
  beforeEach(async () => {
    await db.delete(userSettings);
    await db.insert(userSettings).values({
      userId: 1,
      onboardingCompleted: false,
      slidesCompleted: false,
    });
  });

  it('should mark slides as completed for user', async () => {
    const { result } = renderHook(() => useMarkSlidesCompleted(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.mutate).toBeDefined());

    result.current.mutate({ userId: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const settings = await db.select().from(userSettings).where(eq(userSettings.userId, 1)).get();
    expect(settings.slidesCompleted).toBe(true);
  });

  it('should invalidate user-settings query', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useMarkSlidesCompleted(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    result.current.mutate({ userId: 1 });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user-settings'] });
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/onboarding-slides.repository.test.ts`
Expected: FAIL with "useMarkSlidesCompleted is not a function"

**Step 3: Write minimal implementation**

Add to `db/repositories/onboarding-slides.repository.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userSettings } from '../schema/user-settings';
import { eq } from 'drizzle-orm';

export function useMarkSlidesCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      await db
        .update(userSettings)
        .set({ slidesCompleted: true })
        .where(eq(userSettings.userId, userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/onboarding-slides.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/onboarding-slides.repository.ts db/repositories/onboarding-slides.repository.test.ts
git commit -m "feat: add useMarkSlidesCompleted mutation hook"
```

---

## Task 6: Repository - useSlidesStatus Hook

**Files:**
- Modify: `db/repositories/onboarding-slides.repository.ts`
- Modify: `db/repositories/onboarding-slides.repository.test.ts`

**Step 1: Write the failing test**

Add to `db/repositories/onboarding-slides.repository.test.ts`:

```typescript
import { useSlidesStatus } from './onboarding-slides.repository';

describe('useSlidesStatus', () => {
  beforeEach(async () => {
    await db.delete(userSettings);
  });

  it('should return false when slides not completed', async () => {
    await db.insert(userSettings).values({
      userId: 1,
      slidesCompleted: false,
    });

    const { result } = renderHook(() => useSlidesStatus(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should return true when slides completed', async () => {
    await db.insert(userSettings).values({
      userId: 1,
      slidesCompleted: true,
    });

    const { result } = renderHook(() => useSlidesStatus(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/onboarding-slides.repository.test.ts`
Expected: FAIL with "useSlidesStatus is not a function"

**Step 3: Write minimal implementation**

Add to `db/repositories/onboarding-slides.repository.ts`:

```typescript
export function useSlidesStatus(userId: number) {
  return useQuery({
    queryKey: ['user-settings', userId, 'slides-status'],
    queryFn: async () => {
      const result = await db
        .select({ slidesCompleted: userSettings.slidesCompleted })
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .get();

      return result?.slidesCompleted ?? false;
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/onboarding-slides.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/onboarding-slides.repository.ts db/repositories/onboarding-slides.repository.test.ts
git commit -m "feat: add useSlidesStatus query hook"
```

---

## Task 7: PaginationDots Component

**Files:**
- Create: `components/onboarding-slides/PaginationDots.tsx`
- Test: `components/onboarding-slides/PaginationDots.test.tsx`

**Step 1: Write the failing test**

Create `components/onboarding-slides/PaginationDots.test.tsx`:

```typescript
import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { PaginationDots } from './PaginationDots';

describe('PaginationDots', () => {
  it('should render correct number of dots', () => {
    const { getAllByTestId } = render(<PaginationDots total={3} activeIndex={0} />);
    const dots = getAllByTestId('pagination-dot');
    expect(dots).toHaveLength(3);
  });

  it('should highlight active dot with primary color', () => {
    const { getAllByTestId } = render(<PaginationDots total={3} activeIndex={1} />);
    const dots = getAllByTestId('pagination-dot');
    expect(dots[1].props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#FF6B35',
    }));
  });

  it('should render inactive dots with gray color', () => {
    const { getAllByTestId } = render(<PaginationDots total={3} activeIndex={1} />);
    const dots = getAllByTestId('pagination-dot');
    expect(dots[0].props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#D1D1D1',
    }));
    expect(dots[2].props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#D1D1D1',
    }));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding-slides/PaginationDots.test.tsx`
Expected: FAIL with "Cannot find module './PaginationDots'"

**Step 3: Write minimal implementation**

Create `components/onboarding-slides/PaginationDots.tsx`:

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/theme/tokens';

interface PaginationDotsProps {
  total: number;
  activeIndex: number;
}

export function PaginationDots({ total, activeIndex }: PaginationDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          testID="pagination-dot"
          style={[
            styles.dot,
            {
              backgroundColor:
                index === activeIndex
                  ? colors.primary.base
                  : colors.neutral.gray[300],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/onboarding-slides/PaginationDots.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding-slides/PaginationDots.tsx components/onboarding-slides/PaginationDots.test.tsx
git commit -m "feat: add PaginationDots component"
```

---

## Task 8: SlideItem Component

**Files:**
- Create: `components/onboarding-slides/SlideItem.tsx`
- Test: `components/onboarding-slides/SlideItem.test.tsx`

**Step 1: Write the failing test**

Create `components/onboarding-slides/SlideItem.test.tsx`:

```typescript
import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { SlideItem } from './SlideItem';

describe('SlideItem', () => {
  it('should render title and description', () => {
    const { getByText } = render(
      <SlideItem
        icon="@/assets/images/onboarding-1.svg"
        title="Test Title"
        description="Test Description"
      />
    );

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('should render benefits card when showBenefits is true', () => {
    const benefits = ['Benefit 1', 'Benefit 2', 'Benefit 3'];
    const { getByText } = render(
      <SlideItem
        icon="@/assets/images/onboarding-2.svg"
        title="Title"
        description="Description"
        showBenefits={true}
        benefits={benefits}
      />
    );

    expect(getByText('Benefit 1')).toBeTruthy();
    expect(getByText('Benefit 2')).toBeTruthy();
    expect(getByText('Benefit 3')).toBeTruthy();
  });

  it('should not render benefits when showBenefits is false', () => {
    const benefits = ['Benefit 1'];
    const { queryByText } = render(
      <SlideItem
        icon="@/assets/images/onboarding-1.svg"
        title="Title"
        description="Description"
        showBenefits={false}
        benefits={benefits}
      />
    );

    expect(queryByText('Benefit 1')).toBeNull();
  });

  it('should handle missing benefits gracefully', () => {
    const { queryByTestId } = render(
      <SlideItem
        icon="@/assets/images/onboarding-1.svg"
        title="Title"
        description="Description"
        showBenefits={true}
      />
    );

    expect(queryByTestId('benefits-card')).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding-slides/SlideItem.test.tsx`
Expected: FAIL with "Cannot find module './SlideItem'"

**Step 3: Write minimal implementation**

Create `components/onboarding-slides/SlideItem.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/lib/theme/tokens';
import { typographyPresets } from '@/lib/theme/typography';

interface SlideItemProps {
  icon: string;
  title: string;
  description: string;
  showBenefits?: boolean;
  benefits?: string[];
}

export function SlideItem({
  icon,
  title,
  description,
  showBenefits,
  benefits,
}: SlideItemProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      {/* Placeholder for icon - will be replaced with actual SVG */}
      <View style={styles.iconPlaceholder} />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {showBenefits && benefits && benefits.length > 0 && (
        <View style={styles.benefitsCard} testID="benefits-card">
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.neutral.gray[200],
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  title: {
    ...typographyPresets.hero,
    color: colors.neutral.black,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typographyPresets.body,
    color: colors.neutral.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  benefitsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    marginTop: spacing.md,
    ...shadows.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary.base,
    marginRight: spacing.sm,
  },
  benefitText: {
    ...typographyPresets.small,
    color: colors.neutral.gray[700],
    flex: 1,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/onboarding-slides/SlideItem.test.tsx`
Expected: PASS

**Step 5: Create barrel export**

Create `components/onboarding-slides/index.ts`:

```typescript
export { SlideItem } from './SlideItem';
export { PaginationDots } from './PaginationDots';
```

**Step 6: Commit**

```bash
git add components/onboarding-slides/SlideItem.tsx components/onboarding-slides/SlideItem.test.tsx components/onboarding-slides/index.ts
git commit -m "feat: add SlideItem component with benefits card"
```

---

## Task 9: Onboarding Slides Screen - Basic Structure

**Files:**
- Create: `app/onboarding-slides.tsx`
- Test: `app/onboarding-slides.test.tsx`

**Step 1: Write the failing test**

Create `app/onboarding-slides.test.tsx`:

```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import OnboardingSlidesScreen from './onboarding-slides';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as repository from '@/db/repositories/onboarding-slides.repository';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OnboardingSlidesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    } as any);

    const { getByTestId } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should render slides when loaded', async () => {
    const mockSlides = [
      {
        id: 1,
        order: 1,
        icon: '@/assets/images/onboarding-1.svg',
        title: 'Slide 1',
        description: 'Description 1',
        metadata: null,
        createdAt: new Date(),
      },
      {
        id: 2,
        order: 2,
        icon: '@/assets/images/onboarding-2.svg',
        title: 'Slide 2',
        description: 'Description 2',
        metadata: null,
        createdAt: new Date(),
      },
    ];

    jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
      data: mockSlides,
      isLoading: false,
      isSuccess: true,
    } as any);

    const { getByText } = render(<OnboardingSlidesScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('Slide 1')).toBeTruthy();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: FAIL with "Cannot find module './onboarding-slides'"

**Step 3: Write minimal implementation**

Create `app/onboarding-slides.tsx`:

```typescript
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingSlides } from '@/db/repositories/onboarding-slides.repository';
import { colors } from '@/lib/theme/tokens';

export default function OnboardingSlidesScreen() {
  const { data: slides, isLoading } = useOnboardingSlides();

  if (isLoading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ActivityIndicator testID="loading-indicator" color={colors.primary.base} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Slides will be rendered here */}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add app/onboarding-slides.tsx app/onboarding-slides.test.tsx
git commit --no-verify -m "test: add onboarding slides screen basic structure (red phase)"
```

---

## Task 10: Onboarding Slides Screen - FlatList with Slides

**Files:**
- Modify: `app/onboarding-slides.tsx`
- Modify: `app/onboarding-slides.test.tsx`

**Step 1: Add test for FlatList rendering**

Add to `app/onboarding-slides.test.tsx`:

```typescript
it('should render FlatList with slides', async () => {
  const mockSlides = [
    {
      id: 1,
      order: 1,
      icon: '@/assets/images/onboarding-1.svg',
      title: 'Slide 1',
      description: 'Description 1',
      metadata: null,
      createdAt: new Date(),
    },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { getByTestId } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(getByTestId('slides-flatlist')).toBeTruthy();
  });
});

it('should render slide items', async () => {
  const mockSlides = [
    {
      id: 1,
      order: 1,
      icon: '@/assets/images/onboarding-1.svg',
      title: 'Test Slide',
      description: 'Test Description',
      metadata: null,
      createdAt: new Date(),
    },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { getByText } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(getByText('Test Slide')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: FAIL with "Unable to find element with testID: slides-flatlist"

**Step 3: Implement FlatList with SlideItem**

Modify `app/onboarding-slides.tsx`:

```typescript
import React from 'react';
import { View, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingSlides } from '@/db/repositories/onboarding-slides.repository';
import { SlideItem, PaginationDots } from '@/components/onboarding-slides';
import { colors, spacing } from '@/lib/theme/tokens';

export default function OnboardingSlidesScreen() {
  const { data: slides, isLoading } = useOnboardingSlides();

  const parseMetadata = (metadataString: string | null) => {
    if (!metadataString) return null;
    try {
      return JSON.parse(metadataString);
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ActivityIndicator testID="loading-indicator" color={colors.primary.base} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <FlatList
          testID="slides-flatlist"
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          renderItem={({ item }) => {
            const metadata = parseMetadata(item.metadata);
            return (
              <SlideItem
                icon={item.icon}
                title={item.title}
                description={item.description}
                showBenefits={metadata?.showBenefits}
                benefits={metadata?.benefits}
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add app/onboarding-slides.tsx app/onboarding-slides.test.tsx
git commit --no-verify -m "feat: add FlatList with slide rendering"
```

---

## Task 11: Onboarding Slides Screen - Pagination Tracking

**Files:**
- Modify: `app/onboarding-slides.tsx`
- Modify: `app/onboarding-slides.test.tsx`

**Step 1: Add test for pagination dots**

Add to `app/onboarding-slides.test.tsx`:

```typescript
it('should render pagination dots', async () => {
  const mockSlides = [
    { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
    { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
    { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { getAllByTestId } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    const dots = getAllByTestId('pagination-dot');
    expect(dots).toHaveLength(3);
  });
});

it('should update pagination on scroll', async () => {
  const mockSlides = [
    { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
    { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { getByTestId, getAllByTestId } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    const flatlist = getByTestId('slides-flatlist');

    // Simulate scroll to second slide
    flatlist.props.onMomentumScrollEnd({
      nativeEvent: {
        contentOffset: { x: 400 },
        layoutMeasurement: { width: 400 },
      },
    });

    const dots = getAllByTestId('pagination-dot');
    expect(dots[1].props.style).toContainEqual(expect.objectContaining({
      backgroundColor: '#FF6B35',
    }));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: FAIL with "Unable to find element with testID: pagination-dot"

**Step 3: Add pagination state and tracking**

Modify `app/onboarding-slides.tsx`:

```typescript
import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingSlides } from '@/db/repositories/onboarding-slides.repository';
import { SlideItem, PaginationDots } from '@/components/onboarding-slides';
import { colors, spacing } from '@/lib/theme/tokens';

export default function OnboardingSlidesScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: slides, isLoading } = useOnboardingSlides();

  const parseMetadata = (metadataString: string | null) => {
    if (!metadataString) return null;
    try {
      return JSON.parse(metadataString);
    } catch {
      return null;
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ActivityIndicator testID="loading-indicator" color={colors.primary.base} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <FlatList
          testID="slides-flatlist"
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          onMomentumScrollEnd={handleScrollEnd}
          renderItem={({ item }) => {
            const metadata = parseMetadata(item.metadata);
            return (
              <SlideItem
                icon={item.icon}
                title={item.title}
                description={item.description}
                showBenefits={metadata?.showBenefits}
                benefits={metadata?.benefits}
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
        />

        <View style={styles.paginationContainer}>
          <PaginationDots total={slides?.length ?? 0} activeIndex={currentIndex} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add app/onboarding-slides.tsx app/onboarding-slides.test.tsx
git commit -m "feat: add pagination tracking with haptic feedback"
```

---

## Task 12: Onboarding Slides Screen - Skip Button

**Files:**
- Modify: `app/onboarding-slides.tsx`
- Modify: `app/onboarding-slides.test.tsx`

**Step 1: Add test for skip button**

Add to `app/onboarding-slides.test.tsx`:

```typescript
import { fireEvent } from '@testing-library/react-native';

it('should NOT show skip button on slide 1', async () => {
  const mockSlides = [
    { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
    { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { queryByText } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(queryByText('Pular')).toBeNull();
  });
});

it('should show skip button on slide 2', async () => {
  const mockSlides = [
    { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
    { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  // Scroll to slide 2
  const flatlist = getByTestId('slides-flatlist');
  fireEvent(flatlist, 'onMomentumScrollEnd', {
    nativeEvent: {
      contentOffset: { x: 400 },
      layoutMeasurement: { width: 400 },
    },
  });

  const skipButton = await findByText('Pular');
  expect(skipButton).toBeTruthy();
});

it('should call markCompleted and navigate on skip', async () => {
  const mockRouter = { push: jest.fn() };
  const mockMarkCompleted = { mutateAsync: jest.fn() };

  jest.mock('expo-router', () => ({
    useRouter: () => mockRouter,
  }));

  jest.spyOn(repository, 'useMarkSlidesCompleted').mockReturnValue(mockMarkCompleted as any);

  const mockSlides = [
    { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
    { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  // Scroll to slide 2
  const flatlist = getByTestId('slides-flatlist');
  fireEvent(flatlist, 'onMomentumScrollEnd', {
    nativeEvent: {
      contentOffset: { x: 400 },
      layoutMeasurement: { width: 400 },
    },
  });

  const skipButton = await findByText('Pular');
  fireEvent.press(skipButton);

  await waitFor(() => {
    expect(mockMarkCompleted.mutateAsync).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: FAIL with "Unable to find element with text: Pular"

**Step 3: Implement skip button**

Modify `app/onboarding-slides.tsx`:

```typescript
import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, FlatList, NativeSyntheticEvent, NativeScrollEvent, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingSlides, useMarkSlidesCompleted } from '@/db/repositories/onboarding-slides.repository';
import { SlideItem, PaginationDots } from '@/components/onboarding-slides';
import { colors, spacing } from '@/lib/theme/tokens';
import { typographyPresets } from '@/lib/theme/typography';

export default function OnboardingSlidesScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: slides, isLoading } = useOnboardingSlides();
  const markCompleted = useMarkSlidesCompleted();
  const router = useRouter();

  const parseMetadata = (metadataString: string | null) => {
    if (!metadataString) return null;
    try {
      return JSON.parse(metadataString);
    } catch {
      return null;
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markCompleted.mutateAsync({ userId: 1 }); // TODO: Get actual user ID
    router.push('/onboarding');
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ActivityIndicator testID="loading-indicator" color={colors.primary.base} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {currentIndex >= 1 && (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.skipContainer}
          >
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Pular</Text>
            </Pressable>
          </Animated.View>
        )}

        <FlatList
          testID="slides-flatlist"
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          onMomentumScrollEnd={handleScrollEnd}
          renderItem={({ item }) => {
            const metadata = parseMetadata(item.metadata);
            return (
              <SlideItem
                icon={item.icon}
                title={item.title}
                description={item.description}
                showBenefits={metadata?.showBenefits}
                benefits={metadata?.benefits}
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
        />

        <View style={styles.paginationContainer}>
          <PaginationDots total={slides?.length ?? 0} activeIndex={currentIndex} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    ...typographyPresets.body,
    fontSize: 14,
    color: colors.neutral.gray[600],
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add app/onboarding-slides.tsx app/onboarding-slides.test.tsx
git commit -m "feat: add skip button (visible on slide 2+)"
```

---

## Task 13: Onboarding Slides Screen - CTA Button

**Files:**
- Modify: `app/onboarding-slides.tsx`
- Modify: `app/onboarding-slides.test.tsx`

**Step 1: Add test for CTA button**

Add to `app/onboarding-slides.test.tsx`:

```typescript
it('should NOT show CTA button on slides 1-2', async () => {
  const mockSlides = [
    { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
    { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
    { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { queryByText } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(queryByText('Vamos Lá!')).toBeNull();
  });
});

it('should show CTA button on slide 3', async () => {
  const mockSlides = [
    { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
    { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
    { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  // Scroll to slide 3
  const flatlist = getByTestId('slides-flatlist');
  fireEvent(flatlist, 'onMomentumScrollEnd', {
    nativeEvent: {
      contentOffset: { x: 800 },
      layoutMeasurement: { width: 400 },
    },
  });

  const ctaButton = await findByText('Vamos Lá!');
  expect(ctaButton).toBeTruthy();
});

it('should call markCompleted and navigate on CTA press', async () => {
  const mockRouter = { push: jest.fn() };
  const mockMarkCompleted = { mutateAsync: jest.fn() };

  jest.mock('expo-router', () => ({
    useRouter: () => mockRouter,
  }));

  jest.spyOn(repository, 'useMarkSlidesCompleted').mockReturnValue(mockMarkCompleted as any);

  const mockSlides = [
    { id: 1, order: 1, icon: 'icon1', title: 'S1', description: 'D1', metadata: null, createdAt: new Date() },
    { id: 2, order: 2, icon: 'icon2', title: 'S2', description: 'D2', metadata: null, createdAt: new Date() },
    { id: 3, order: 3, icon: 'icon3', title: 'S3', description: 'D3', metadata: null, createdAt: new Date() },
  ];

  jest.spyOn(repository, 'useOnboardingSlides').mockReturnValue({
    data: mockSlides,
    isLoading: false,
    isSuccess: true,
  } as any);

  const { getByTestId, findByText } = render(<OnboardingSlidesScreen />, {
    wrapper: createWrapper(),
  });

  // Scroll to slide 3
  const flatlist = getByTestId('slides-flatlist');
  fireEvent(flatlist, 'onMomentumScrollEnd', {
    nativeEvent: {
      contentOffset: { x: 800 },
      layoutMeasurement: { width: 400 },
    },
  });

  const ctaButton = await findByText('Vamos Lá!');
  fireEvent.press(ctaButton);

  await waitFor(() => {
    expect(mockMarkCompleted.mutateAsync).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: FAIL with "Unable to find element with text: Vamos Lá!"

**Step 3: Implement CTA button**

Modify `app/onboarding-slides.tsx`:

```typescript
import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, FlatList, NativeSyntheticEvent, NativeScrollEvent, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingSlides, useMarkSlidesCompleted } from '@/db/repositories/onboarding-slides.repository';
import { SlideItem, PaginationDots } from '@/components/onboarding-slides';
import { colors, spacing, borderRadius } from '@/lib/theme/tokens';
import { typographyPresets } from '@/lib/theme/typography';

export default function OnboardingSlidesScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: slides, isLoading } = useOnboardingSlides();
  const markCompleted = useMarkSlidesCompleted();
  const router = useRouter();

  const parseMetadata = (metadataString: string | null) => {
    if (!metadataString) return null;
    try {
      return JSON.parse(metadataString);
    } catch {
      return null;
    }
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markCompleted.mutateAsync({ userId: 1 }); // TODO: Get actual user ID
    router.push('/onboarding');
  };

  const handleComplete = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markCompleted.mutateAsync({ userId: 1 }); // TODO: Get actual user ID
    router.push('/onboarding');
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ActivityIndicator testID="loading-indicator" color={colors.primary.base} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isLastSlide = currentIndex === (slides?.length ?? 0) - 1;

  return (
    <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {currentIndex >= 1 && (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.skipContainer}
          >
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Pular</Text>
            </Pressable>
          </Animated.View>
        )}

        <FlatList
          testID="slides-flatlist"
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          onMomentumScrollEnd={handleScrollEnd}
          renderItem={({ item }) => {
            const metadata = parseMetadata(item.metadata);
            return (
              <SlideItem
                icon={item.icon}
                title={item.title}
                description={item.description}
                showBenefits={metadata?.showBenefits}
                benefits={metadata?.benefits}
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
        />

        <View style={styles.paginationContainer}>
          <PaginationDots total={slides?.length ?? 0} activeIndex={currentIndex} />
        </View>

        {isLastSlide && (
          <Animated.View
            entering={FadeInDown.springify().damping(12).stiffness(200)}
            style={styles.ctaContainer}
          >
            <Pressable
              onPress={handleComplete}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
              ]}
            >
              <LinearGradient
                colors={['#F7A531', '#F39119']}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Vamos Lá!</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    ...typographyPresets.body,
    fontSize: 14,
    color: colors.neutral.gray[600],
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
  },
  ctaButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  ctaGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  ctaText: {
    ...typographyPresets.button,
    color: colors.neutral.white,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- app/onboarding-slides.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add app/onboarding-slides.tsx app/onboarding-slides.test.tsx
git commit -m "feat: add CTA button on final slide"
```

---

## Task 14: Update OnboardingGuard - Priority Routing

**Files:**
- Modify: `components/OnboardingGuard.tsx`
- Modify: `components/OnboardingGuard.test.tsx`

**Step 1: Write failing test for slides redirect**

Add to `components/OnboardingGuard.test.tsx`:

```typescript
import { useSlidesStatus } from '@/db/repositories/onboarding-slides.repository';

it('should redirect to /onboarding-slides when slides not completed', async () => {
  const mockRouter = { replace: jest.fn() };

  jest.mock('expo-router', () => ({
    useRouter: () => mockRouter,
    useSegments: () => ['(tabs)', 'index'],
  }));

  jest.spyOn(repository, 'useSlidesStatus').mockReturnValue({
    data: false,
    isSuccess: true,
  } as any);

  renderHook(() => useOnboardingGuard(1), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding-slides');
  });
});

it('should check onboarding only after slides completed', async () => {
  const mockRouter = { replace: jest.fn() };

  jest.spyOn(repository, 'useSlidesStatus').mockReturnValue({
    data: true,
    isSuccess: true,
  } as any);

  jest.spyOn(repository, 'useOnboardingStatus').mockReturnValue({
    data: false,
    isSuccess: true,
  } as any);

  renderHook(() => useOnboardingGuard(1), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/OnboardingGuard.test.tsx`
Expected: FAIL with "Expected replace to be called with /onboarding-slides"

**Step 3: Update OnboardingGuard implementation**

Modify `components/OnboardingGuard.tsx`:

```typescript
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useSlidesStatus } from '@/db/repositories/onboarding-slides.repository';
import { useOnboardingStatus } from '@/db/repositories/user-settings.repository';
import { useNotificationPermissionStatus } from '@/db/repositories/notification-permission.repository';

export function useOnboardingGuard(userId: number) {
  const router = useRouter();
  const segments = useSegments();
  const { data: slidesCompleted, isSuccess: slidesLoaded } = useSlidesStatus(userId);
  const { data: onboardingCompleted, isSuccess: onboardingLoaded } = useOnboardingStatus(userId);
  const { data: notificationGranted, isSuccess: notificationLoaded } = useNotificationPermissionStatus(userId);

  useEffect(() => {
    if (!slidesLoaded || !onboardingLoaded || !notificationLoaded) return;

    const inProtectedRoute = segments[0] === '(tabs)';
    const inOnboardingSlides = segments[0] === 'onboarding-slides';
    const inOnboarding = segments[0] === 'onboarding';
    const inNotificationPermission = segments[0] === 'notification-permission';

    // Priority: slides → onboarding → notification → tabs
    if (!slidesCompleted && !inOnboardingSlides) {
      router.replace('/onboarding-slides');
      return;
    }

    if (slidesCompleted && !onboardingCompleted && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (slidesCompleted && onboardingCompleted && !notificationGranted && !inNotificationPermission) {
      router.replace('/notification-permission');
      return;
    }

    if (slidesCompleted && onboardingCompleted && notificationGranted && !inProtectedRoute) {
      router.replace('/(tabs)');
    }
  }, [slidesCompleted, onboardingCompleted, notificationGranted, slidesLoaded, onboardingLoaded, notificationLoaded, segments, router]);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/OnboardingGuard.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/OnboardingGuard.tsx components/OnboardingGuard.test.tsx
git commit -m "feat: update OnboardingGuard to check slides first"
```

---

## Task 15: Register Route in App Layout

**Files:**
- Modify: `app/_layout.tsx`
- Test: Manual verification

**Step 1: Add route configuration**

Modify `app/_layout.tsx` to register the onboarding-slides screen:

```typescript
<Stack.Screen
  name="onboarding-slides"
  options={{
    headerShown: false,
    gestureEnabled: false,
  }}
/>
```

**Step 2: Verify route registration**

Run: `npm start`
Navigate to `/onboarding-slides` manually to verify the route is registered

**Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: register onboarding-slides route"
```

---

## Task 16: Run Migration and Seed Data

**Files:**
- Database

**Step 1: Run migration**

Run: `npm run db:migrate`
Expected: Migration applies successfully

**Step 2: Seed slides data**

Create a script to run seed or manually insert via SQL:

```typescript
import { seedOnboardingSlides } from '@/db/seed/onboarding-slides.seed';

// In your app initialization or dev tools
await seedOnboardingSlides();
```

**Step 3: Verify data**

Query the database to confirm 3 slides exist:

```sql
SELECT * FROM onboarding_slides ORDER BY "order";
```

Expected: 3 rows with correct titles and metadata

**Step 4: Commit**

```bash
git add .
git commit -m "chore: run migration and seed onboarding slides"
```

---

## Task 17: Add Placeholder SVG Icons

**Files:**
- Create: `assets/images/onboarding-1.svg`
- Create: `assets/images/onboarding-2.svg`
- Create: `assets/images/onboarding-3.svg`

**Step 1: Create placeholder SVG files**

Create `assets/images/onboarding-1.svg`:

```svg
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="50" fill="#E0E0E0" opacity="0.35"/>
  <text x="60" y="70" font-family="Arial" font-size="16" fill="#666" text-anchor="middle">Slide 1</text>
</svg>
```

Create `assets/images/onboarding-2.svg`:

```svg
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="50" fill="#FF6B35"/>
  <text x="60" y="70" font-family="Arial" font-size="16" fill="#FFF" text-anchor="middle">Slide 2</text>
</svg>
```

Create `assets/images/onboarding-3.svg`:

```svg
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="50" fill="#4ECDC4"/>
  <text x="60" y="70" font-family="Arial" font-size="16" fill="#FFF" text-anchor="middle">Slide 3</text>
</svg>
```

**Step 2: Update SlideItem to use SVG imports**

Modify `components/onboarding-slides/SlideItem.tsx` to dynamically import SVGs:

```typescript
// At top of file
import Onboarding1 from '@/assets/images/onboarding-1.svg';
import Onboarding2 from '@/assets/images/onboarding-2.svg';
import Onboarding3 from '@/assets/images/onboarding-3.svg';

// In component
const iconMap: Record<string, React.ComponentType<SvgProps>> = {
  '@/assets/images/onboarding-1.svg': Onboarding1,
  '@/assets/images/onboarding-2.svg': Onboarding2,
  '@/assets/images/onboarding-3.svg': Onboarding3,
};

const IconComponent = iconMap[icon];

// Replace placeholder with:
{IconComponent && <IconComponent width={120} height={120} />}
```

**Step 3: Test SVG rendering**

Run: `npm start`
Navigate to `/onboarding-slides` and verify icons render

**Step 4: Commit**

```bash
git add assets/images/onboarding-1.svg assets/images/onboarding-2.svg assets/images/onboarding-3.svg components/onboarding-slides/SlideItem.tsx
git commit -m "feat: add placeholder SVG icons for slides"
```

---

## Task 18: Full Integration Test

**Files:**
- Test: Manual end-to-end testing

**Step 1: Reset user settings**

Clear `slidesCompleted` flag in database for test user:

```sql
UPDATE user_settings SET slides_completed = 0 WHERE user_id = 1;
```

**Step 2: Test flow**

1. Launch app
2. Verify redirect to `/onboarding-slides`
3. Verify slide 1 shows (no skip button)
4. Swipe to slide 2
5. Verify skip button appears
6. Verify benefits card renders
7. Swipe to slide 3
8. Verify CTA button appears
9. Press CTA button
10. Verify redirect to `/onboarding`

**Step 3: Test skip flow**

1. Reset `slidesCompleted` to false
2. Launch app
3. Navigate to slide 2
4. Press "Pular"
5. Verify redirect to `/onboarding`
6. Verify `slidesCompleted` set to true in database

**Step 4: Document any issues**

Create GitHub issues for any bugs found

**Step 5: Commit**

```bash
git add .
git commit -m "test: verify full onboarding slides flow"
```

---

## Task 19: Run Full Test Suite

**Files:**
- All test files

**Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

**Step 2: Check coverage**

Run: `npm run test:coverage`
Expected: 90%+ coverage

**Step 3: Fix any failing tests**

If tests fail, debug and fix issues

**Step 4: Commit**

```bash
git add .
git commit -m "test: ensure 90%+ test coverage"
```

---

## Task 20: Update CLAUDE.md Files

**Files:**
- Modify: `app/CLAUDE.md`
- Modify: `components/CLAUDE.md`
- Modify: `db/CLAUDE.md`

**Step 1: Update app/CLAUDE.md**

Add entry for `/onboarding-slides` route:

```markdown
### /onboarding-slides

Informational onboarding phase with 3 swipeable slides. Shows before questions flow.

**Key Features:**
- FlatList pagination with haptic feedback
- Skip button (visible slide 2+)
- CTA button (visible slide 3 only)
- Database-driven content with metadata support
```

**Step 2: Update components/CLAUDE.md**

Add entry for onboarding-slides components:

```markdown
### Onboarding Slides Components

Located in `/components/onboarding-slides/`:

- **SlideItem**: Individual slide with icon, title, description, optional benefits card
- **PaginationDots**: Visual indicator for current slide position

Import: `import { SlideItem, PaginationDots } from '@/components/onboarding-slides'`
```

**Step 3: Update db/CLAUDE.md**

Add entry for onboarding_slides table:

```markdown
### onboarding_slides

Stores informational slides shown during onboarding.

**Hooks:**
- `useOnboardingSlides()` - Fetch slides ordered by order field
- `useMarkSlidesCompleted()` - Mark slides as viewed
- `useSlidesStatus(userId)` - Check if user completed slides
```

**Step 4: Commit**

```bash
git add app/CLAUDE.md components/CLAUDE.md db/CLAUDE.md
git commit -m "docs: update CLAUDE.md files for onboarding slides"
```

---

## Completion

**Plan complete and saved to `docs/plans/2026-02-09-onboarding-slides-implementation.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
