import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInstalaciones, createInstalacion, updateInstalacion, getCostosInstalacion, createCostoInstalacion, deleteCostoInstalacion } from '../../../lib/api';
import type { Instalacion, CostoInstalacion } from '../../../lib/types';

export function useInstalaciones() {
  return useQuery({
    queryKey: ['instalaciones'],
    queryFn: getInstalaciones,
  });
}

export function useCreateInstalacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (instalacion: Partial<Instalacion>) => createInstalacion(instalacion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instalaciones'] });
    },
  });
}

export function useUpdateInstalacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Instalacion> }) => updateInstalacion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instalaciones'] });
    },
  });
}

export function useCostosInstalacion(instalacionId: string) {
  return useQuery({
    queryKey: ['costos_instalacion', instalacionId],
    queryFn: () => getCostosInstalacion(instalacionId),
    enabled: !!instalacionId,
  });
}

export function useCreateCostoInstalacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (costo: Omit<CostoInstalacion, 'id' | 'created_at'>) => createCostoInstalacion(costo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['costos_instalacion', variables.instalacion_id] });
    },
  });
}

export function useDeleteCostoInstalacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string, instalacion_id: string }) => deleteCostoInstalacion(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['costos_instalacion', variables.instalacion_id] });
    },
  });
}
