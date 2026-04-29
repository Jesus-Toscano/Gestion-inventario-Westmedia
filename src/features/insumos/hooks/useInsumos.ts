import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInsumos, createInsumo, updateInsumo, getMovimientosInsumos, createMovimientoInsumo, updateMovimientoInsumo } from '../../../lib/api';
import type { Insumo } from '../../../lib/types';

export function useInsumos() {
  return useQuery({
    queryKey: ['insumos'],
    queryFn: getInsumos,
  });
}

export function useCreateInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInsumo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}

export function useUpdateInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Insumo> }) => updateInsumo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}

export function useMovimientosInsumos() {
  return useQuery({
    queryKey: ['movimientos_insumos'],
    queryFn: getMovimientosInsumos,
  });
}

export function useCreateMovimientoInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMovimientoInsumo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos_insumos'] });
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}

export function useUpdateMovimientoInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateMovimientoInsumo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos_insumos'] });
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}

export function useDeleteInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { deleteInsumo } = await import('../../../lib/api');
      return deleteInsumo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
    },
  });
}
