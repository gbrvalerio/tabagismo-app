import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useOnboardingSlides } from './onboarding-slides.repository';
import { db } from '../client';

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
    metadata: JSON.stringify({ showBenefits: true, benefits: ['a', 'b'] }),
    createdAt: new Date(),
  },
  {
    id: 3,
    order: 3,
    icon: '@/assets/images/onboarding-3.svg',
    title: 'Slide 3',
    description: 'Description 3',
    metadata: null,
    createdAt: new Date(),
  },
];

jest.mock('../client', () => {
  const mockAll = jest.fn().mockResolvedValue([]);
  const mockOrderBy = jest.fn(() => ({ all: mockAll }));
  const mockFrom = jest.fn(() => ({
    all: mockAll,
    orderBy: mockOrderBy,
  }));

  return {
    db: {
      select: jest.fn(() => ({ from: mockFrom })),
    },
    __mockAll: mockAll,
  };
});

const { __mockAll } = jest.requireMock('../client') as { __mockAll: jest.Mock };

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('onboarding-slides.repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __mockAll.mockResolvedValue(mockSlides);
  });

  describe('useOnboardingSlides', () => {
    it('should return slides data after loading', async () => {
      const { result } = renderHook(() => useOnboardingSlides(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSlides);
    });

    it('should call db.select to query slides', async () => {
      const { result } = renderHook(() => useOnboardingSlides(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(db.select).toHaveBeenCalled();
    });

    it('should finish loading without error', async () => {
      const { result } = renderHook(() => useOnboardingSlides(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(!result.current.isLoading).toBe(true);
      });

      expect(result.current.isError).toBe(false);
    });

    it('should use correct query key', async () => {
      const queryClient = createTestQueryClient();
      const wrapper = function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
      };

      renderHook(() => useOnboardingSlides(), { wrapper });

      await waitFor(() => {
        const cache = queryClient.getQueryCache().findAll();
        const slideQuery = cache.find(q =>
          JSON.stringify(q.queryKey) === JSON.stringify(['onboarding-slides'])
        );
        expect(slideQuery).toBeDefined();
      });
    });

    it('should provide standard TanStack Query states', async () => {
      const { result } = renderHook(() => useOnboardingSlides(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('isSuccess');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should return an array of slides', async () => {
      const { result } = renderHook(() => useOnboardingSlides(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data).toHaveLength(3);
    });

    it('should return slides with all required fields', async () => {
      const { result } = renderHook(() => useOnboardingSlides(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const slide = result.current.data![0];
      expect(slide).toHaveProperty('id');
      expect(slide).toHaveProperty('order');
      expect(slide).toHaveProperty('icon');
      expect(slide).toHaveProperty('title');
      expect(slide).toHaveProperty('description');
      expect(slide).toHaveProperty('metadata');
      expect(slide).toHaveProperty('createdAt');
    });

    it('should handle empty results', async () => {
      __mockAll.mockResolvedValue([]);

      const { result } = renderHook(() => useOnboardingSlides(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });
});
