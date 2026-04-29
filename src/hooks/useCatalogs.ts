import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClientes, getEmpleados, getSitios, getProveedores, createProveedor } from '../lib/api';
import type { Proveedor } from '../lib/types';

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });
}

export function useEmpleados() {
  return useQuery({
    queryKey: ['empleados'],
    queryFn: getEmpleados,
  });
}

export function useSitios() {
  return useQuery({
    queryKey: ['sitios'],
    queryFn: getSitios,
  });
}

export function useProveedores() {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: getProveedores,
  });
}

export function useCreateProveedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (proveedor: Omit<Proveedor, 'id' | 'created_at'>) => createProveedor(proveedor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    },
  });
}
