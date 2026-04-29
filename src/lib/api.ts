import { supabase } from './supabase';
import type { InventoryItem, NewInventoryItem, SalidaUpdate, FullInventoryUpdate, Insumo, NewInsumo, MovimientoInsumo, NewMovimientoInsumo, Cliente, Empleado, Sitio, UbicacionBodega, Proveedor, Instalacion, CostoInstalacion } from './types';

/**
 * Obtiene todos los items del inventario, ordenados del más nuevo al más antiguo.
 */
export async function getInventoryItems(
  page: number = 0,
  pageSize: number = 100,
  searchTerm: string = ''
): Promise<{ data: InventoryItem[], count: number }> {
  let query = supabase
    .from('inventory_items')
    .select('*, vendedor_rel:vendedor_id(*)', { count: 'exact' });

  if (searchTerm) {
    query = supabase
      .from('inventory_items')
      .select('*, vendedor_rel:vendedor_id(*)', { count: 'exact' })
      .ilike('arte_anunciante', `%${searchTerm}%`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error('Error al cargar el inventario:', error.message);
    throw new Error(error.message);
  }

  return { data: data as InventoryItem[], count: count || 0 };
}

/**
 * Obtiene solo los items que están disponibles en almacén (sin fecha de salida).
 */
export async function getAvailableItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*, vendedor_rel:vendedor_id(*)')
    .is('fecha_salida', null)
    .order('fecha_ingreso', { ascending: false });

  if (error) {
    console.error('Error al cargar items disponibles:', error.message);
    throw new Error(error.message);
  }

  return data as InventoryItem[];
}

/**
 * Crea un nuevo registro de ingreso de material.
 */
export async function createInventoryItem(item: NewInventoryItem): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error al registrar el ingreso:', error.message);
    throw new Error(error.message);
  }

  return data as InventoryItem;
}

/**
 * Registra la salida/entrega de un item existente.
 */
export async function updateInventoryItemSalida(
  id: string,
  salida: SalidaUpdate
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(salida)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al registrar la salida:', error.message);
    throw new Error(error.message);
  }

  return data as InventoryItem;
}

/**
 * Actualiza completamente un registro de inventario existente.
 */
export async function updateInventoryItem(
  id: string,
  data: FullInventoryUpdate
): Promise<InventoryItem> {
  const { data: updated, error } = await supabase
    .from('inventory_items')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar el registro:', error.message);
    throw new Error(error.message);
  }

  return updated as InventoryItem;
}

/**
 * Elimina un registro de inventario por su ID.
 */
export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar el registro:', error.message);
    throw new Error(error.message);
  }
}

// ============================================================================
// Catálogos (Normalization)
// ============================================================================

export async function getClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase.from('clientes').select('*').order('nombre');
  if (error) throw new Error(error.message);
  return data as Cliente[];
}

export async function getEmpleados(): Promise<Empleado[]> {
  const { data, error } = await supabase.from('empleados').select('*').order('nombre');
  if (error) throw new Error(error.message);
  return data as Empleado[];
}

export async function getSitios(): Promise<Sitio[]> {
  const { data, error } = await supabase.from('sitios').select('*').order('nombre');
  if (error) throw new Error(error.message);
  return data as Sitio[];
}

export async function getUbicacionesBodega(): Promise<UbicacionBodega[]> {
  const { data, error } = await supabase.from('ubicaciones_bodega').select('*').order('nombre');
  if (error) throw new Error(error.message);
  return data as UbicacionBodega[];
}

export async function createUbicacionBodega(ub: Omit<UbicacionBodega, 'id' | 'created_at' | 'updated_at'>): Promise<UbicacionBodega> {
  const { data, error } = await supabase
    .from('ubicaciones_bodega')
    .insert([ub])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as UbicacionBodega;
}

export async function updateUbicacionBodega(id: string, ub: Partial<Omit<UbicacionBodega, 'id' | 'created_at'>>): Promise<UbicacionBodega> {
  const { data, error } = await supabase
    .from('ubicaciones_bodega')
    .update({ ...ub, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as UbicacionBodega;
}

export async function deleteUbicacionBodega(id: string): Promise<void> {
  const { error } = await supabase.from('ubicaciones_bodega').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// API Insumos y Proveedores
// ============================================================================

export async function getProveedores(): Promise<Proveedor[]> {
  const { data, error } = await supabase.from('proveedores').select('*').order('nombre');
  if (error) throw new Error(error.message);
  return data as Proveedor[];
}

export async function createProveedor(proveedor: Omit<Proveedor, 'id' | 'created_at'>): Promise<Proveedor> {
  const { data, error } = await supabase
    .from('proveedores')
    .insert([proveedor])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Proveedor;
}

export async function getInsumos(): Promise<Insumo[]> {
  const { data, error } = await supabase
    .from('insumos')
    .select('*, proveedor:proveedor_id(*)')
    .order('prioritario', { ascending: false })
    .order('nombre', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Insumo[];
}

export async function createInsumo(insumo: NewInsumo): Promise<Insumo> {
  const { data, error } = await supabase
    .from('insumos')
    .insert([insumo])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Insumo;
}

export async function getMovimientosInsumos(): Promise<MovimientoInsumo[]> {
  const { data, error } = await supabase
    .from('movimientos_insumos')
    .select('*, insumos(nombre, unidad_medida)')
    .order('fecha', { ascending: false });

  if (error) throw new Error(error.message);
  return data as MovimientoInsumo[];
}

export async function createMovimientoInsumo(movimiento: NewMovimientoInsumo): Promise<MovimientoInsumo> {
  const { data, error } = await supabase
    .from('movimientos_insumos')
    .insert([movimiento])
    .select('*, insumos(nombre, unidad_medida)')
    .single();

  if (error) throw new Error(error.message);
  return data as MovimientoInsumo;
}

export async function updateInsumo(id: string, updates: Partial<Insumo>): Promise<Insumo> {
  const { data, error } = await supabase
    .from('insumos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Insumo;
}

export async function deleteMovimientoInsumo(id: string): Promise<void> {
  const { error } = await supabase
    .from('movimientos_insumos')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function updateMovimientoInsumo(id: string, updates: any): Promise<void> {
  const { error } = await supabase
    .from('movimientos_insumos')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteInsumo(id: string): Promise<void> {
  const { error } = await supabase
    .from('insumos')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ============================================================================
// API Instalaciones y Costos
// ============================================================================

export async function getInstalaciones(): Promise<Instalacion[]> {
  const { data, error } = await supabase
    .from('instalaciones')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Instalacion[];
}

export async function createInstalacion(instalacion: Partial<Instalacion>): Promise<Instalacion> {
  const { data, error } = await supabase
    .from('instalaciones')
    .insert([instalacion])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Instalacion;
}

export async function updateInstalacion(id: string, updates: Partial<Instalacion>): Promise<void> {
  const { error } = await supabase
    .from('instalaciones')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getCostosInstalacion(instalacionId: string): Promise<CostoInstalacion[]> {
  const { data, error } = await supabase
    .from('costos_instalacion')
    .select('*')
    .eq('instalacion_id', instalacionId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as CostoInstalacion[];
}

export async function createCostoInstalacion(costo: Omit<CostoInstalacion, 'id' | 'created_at'>): Promise<CostoInstalacion> {
  const { data, error } = await supabase
    .from('costos_instalacion')
    .insert([costo])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CostoInstalacion;
}

export async function deleteCostoInstalacion(id: string): Promise<void> {
  const { error } = await supabase
    .from('costos_instalacion')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
