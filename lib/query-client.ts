import { QueryClient } from '@tanstack/react-query';
import { handleQueryError } from './error-handler';

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
      onError: (error: Error) => handleQueryError(error, 'Failed to save data'),
    },
  },
});
