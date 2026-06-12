import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useReorder() {
  const queryClient = useQueryClient();

  return async <T extends { id: string }>(
    queryKey: QueryKey,
    endpoint: string,
    items: T[],
  ) => {
    const previous = queryClient.getQueryData<T[]>(queryKey);
    queryClient.setQueryData(queryKey, items);

    try {
      await api.post(endpoint, { ids: items.map((item) => item.id) });
    } catch (error) {
      queryClient.setQueryData(queryKey, previous);
      throw error;
    }
  };
}
