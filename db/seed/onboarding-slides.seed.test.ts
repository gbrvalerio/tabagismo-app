import { describe, it, expect } from '@jest/globals';
import { onboardingSlidesData, seedOnboardingSlides } from './onboarding-slides.seed';
import { db } from '../client';

// Mock db for seed function execution
jest.mock('../client', () => {
  const mockExecute = jest.fn().mockResolvedValue(undefined);
  const mockValues = jest.fn().mockResolvedValue(undefined);

  return {
    db: {
      delete: jest.fn(() => ({ execute: mockExecute })),
      insert: jest.fn(() => ({ values: mockValues })),
    },
  };
});

describe('onboardingSlidesData', () => {
  it('should contain exactly 3 slides', () => {
    expect(onboardingSlidesData).toHaveLength(3);
  });

  it('should have slides ordered 1, 2, 3', () => {
    expect(onboardingSlidesData[0].order).toBe(1);
    expect(onboardingSlidesData[1].order).toBe(2);
    expect(onboardingSlidesData[2].order).toBe(3);
  });

  it('should have correct titles in Portuguese', () => {
    expect(onboardingSlidesData[0].title).toBe('Parar de fumar é difícil sozinho');
    expect(onboardingSlidesData[1].title).toBe('Nós ajudamos você nessa jornada');
    expect(onboardingSlidesData[2].title).toBe('Vamos começar juntos');
  });

  it('should have descriptions for all slides', () => {
    for (const slide of onboardingSlidesData) {
      expect(slide.description).toBeTruthy();
      expect(typeof slide.description).toBe('string');
    }
  });

  it('should have icon paths for all slides', () => {
    for (const slide of onboardingSlidesData) {
      expect(slide.icon).toBeTruthy();
      expect(slide.icon).toContain('onboarding-');
    }
  });

  it('should have metadata with benefits on slide 2', () => {
    const slide2 = onboardingSlidesData[1];
    expect(slide2.metadata).toBeTruthy();
    const metadata = JSON.parse(slide2.metadata!);
    expect(metadata.showBenefits).toBe(true);
    expect(metadata.benefits).toHaveLength(3);
    expect(Array.isArray(metadata.benefits)).toBe(true);
  });

  it('should have null metadata on slides 1 and 3', () => {
    expect(onboardingSlidesData[0].metadata).toBeNull();
    expect(onboardingSlidesData[2].metadata).toBeNull();
  });

  it('should have unique order values', () => {
    const orders = onboardingSlidesData.map(s => s.order);
    const uniqueOrders = new Set(orders);
    expect(uniqueOrders.size).toBe(orders.length);
  });
});

describe('seedOnboardingSlides', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof seedOnboardingSlides).toBe('function');
  });

  it('should delete existing slides before inserting', async () => {
    await seedOnboardingSlides();

    expect(db.delete).toHaveBeenCalled();
  });

  it('should insert all slide data', async () => {
    await seedOnboardingSlides();

    expect(db.insert).toHaveBeenCalled();
  });

  it('should log the number of inserted slides', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await seedOnboardingSlides();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(`[SEED] Inserted ${onboardingSlidesData.length} onboarding slides`)
    );

    consoleSpy.mockRestore();
  });
});
