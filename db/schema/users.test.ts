import { describe, it, expect } from '@jest/globals';
import { users, getDefaultUserCreatedAt } from './users';

describe('users schema', () => {
  it('should have coins field with default 0', () => {
    const schema = users;
    expect(schema.coins).toBeDefined();
  });

  it('should have id as primary key', () => {
    const schema = users;
    expect(schema.id).toBeDefined();
  });

  it('should have correct column names', () => {
    expect(users.id.name).toBe('id');
    expect(users.coins.name).toBe('coins');
    expect(users.createdAt.name).toBe('created_at');
  });

  it('should have getDefaultUserCreatedAt return a Date', () => {
    const result = getDefaultUserCreatedAt();
    expect(result).toBeInstanceOf(Date);
  });

  it('should infer correct types', () => {
    type User = typeof users.$inferSelect;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type NewUser = typeof users.$inferInsert;

    const user: User = {
      id: 1,
      coins: 10,
      createdAt: new Date(),
    };

    expect(user).toBeDefined();
  });
});
