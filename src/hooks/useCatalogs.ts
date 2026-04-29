import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClientes, getEmpleados, getSitios, getProveedores, createProveedor,
  getUbicacionesBodega, createUbicacionBodega, updateUbicacionBodega, deleteUbicacionBodega
} from '../lib/api';
import type { Proveedor, UbicacionBodega } from '../lib/types';

export function useClientes() {
  return useQuery({ queryKey: ['clientes'], queryFn: getClientes });
}

export function useEmpleados() {
  return useQuery({ queryKey: ['empleados'], queryFn: getEmpleados });
}

export function useSitios() {
  return useQuery({ queryKey: ['sitios'], queryFn: getSitios });
}

export function useProveedores() {
  return useQuery({ queryKey: ['proveedores'], queryFn: getProveedores });
}

export function useCreateProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proveedor: Omit<Proveedor, 'id' | 'created_at'>) => createProveedor(proveedor),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['proveedores'] }); },
  });
}

// ── Ubicaciones Bodega ────────────────────────────────────────────────────────

export function useUbicacionesBodega() {
  return useQuery({ queryKey: ['ubicaciones_bodega'], queryFn: getUbicacionesBodega });
}

export function useCreateUbicacionBodega() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ub: Omit<UbicacionBodega, 'id' | 'created_at' | 'updated_at'>) => createUbicacionBodega(ub),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ubicaciones_bodega'] }); },
  });
}

export function useUpdateUbicacionBodega() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<UbicacionBodega, 'id' | 'created_at'>> }) =>
      updateUbicacionBodega(id, updates),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ubicaciones_bodega'] }); },
  });
}

export function useDeleteUbicacionBodega() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUbicacionBodega(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ubicaciones_bodega'] }); },
  });
}
