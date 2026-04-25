import { supabase } from './supabase';
import type { InventoryItem, NewInventoryItem, SalidaUpdate, FullInventoryUpdate, Insumo, NewInsumo, MovimientoInsumo, NewMovimientoInsumo } from './types';

/**
 * Obtiene todos los items del inventario, ordenados del más nuevo al más antiguo.
 */
export async function getInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al cargar el inventario:', error.message);
    throw new Error(error.message);
  }

  return data as InventoryItem[];
}

/**
 * Obtiene solo los items que están disponibles en almacén (sin fecha de salida).
 */
export async function getAvailableItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
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
// API Insumos
// ============================================================================

export async function getInsumos(): Promise<Insumo[]> {
  const { data, error } = await supabase
    .from('insumos')
    .select('*')
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
