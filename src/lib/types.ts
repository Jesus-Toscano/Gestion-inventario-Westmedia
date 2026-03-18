export type BannerSize = 'sencilla' | 'doble' | 'cuadruple';
export type BannerMaterial = 'front' | 'mesh';
export type BannerCondition = 'nueva' | 'bueno' | 'regular' | 'en mal estado' | 'rota';

export interface InventoryItem {
  id: string;
  fecha_ingreso: string;
  arte_anunciante: string;
  vendedor: string;
  sitio_instalacion: string;
  tamano: BannerSize;
  material: BannerMaterial;
  estado_lona: BannerCondition;
  fecha_salida?: string | null;
  entregado_a?: string | null;
  estado_entrega?: BannerCondition | null;
  created_at?: string;
  updated_at?: string;
}

// Tipo para crear un nuevo item (sin campos auto-generados)
export type NewInventoryItem = Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>;

// Tipo para actualizar la salida de un item
export interface SalidaUpdate {
  fecha_salida: string;
  entregado_a: string;
  estado_entrega: BannerCondition;
  updated_at: string;
}
