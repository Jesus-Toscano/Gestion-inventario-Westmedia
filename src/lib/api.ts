import { supabase } from './supabase';
import type { InventoryItem, NewInventoryItem, SalidaUpdate } from './types';

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
