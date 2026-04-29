import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventoryItems, getAvailableItems, createInventoryItem, updateInventoryItemSalida, updateInventoryItem, deleteInventoryItem } from '../../../lib/api';
import type { FullInventoryUpdate, SalidaUpdate } from '../../../lib/types';

export function useInventory(page: number = 0, pageSize: number = 100, searchTerm: string = '') {
  return useQuery({
    queryKey: ['inventory', page, pageSize, searchTerm],
    queryFn: () => getInventoryItems(page, pageSize, searchTerm),
  });
}

export function useAvailableInventory() {
  return useQuery({
    queryKey: ['inventory', 'available'],
    queryFn: getAvailableItems,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'available'] });
    },
  });
}

export function useUpdateInventoryItemSalida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, salida }: { id: string; salida: SalidaUpdate }) => updateInventoryItemSalida(id, salida),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'available'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FullInventoryUpdate }) => updateInventoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'available'] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'available'] });
    },
  });
}
