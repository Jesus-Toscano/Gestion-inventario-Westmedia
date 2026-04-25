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
  kg_alambre?: number | null;
  llaves_entregadas?: boolean | null;
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
  kg_alambre: number | null;
  llaves_entregadas: boolean;
  sitio_instalacion: string;
  updated_at: string;
}

// Tipo para editar un registro completo (Update)
export interface FullInventoryUpdate {
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
  updated_at: string;
}

// ─── Módulo de Insumos ────────────────────────────────────────────────────────
export type UnidadMedida = 'Kg' | 'Piezas' | 'Metros' | 'Cajas' | 'Rollos' | 'Litros' | 'Bolsas';
export type TipoMovimiento = 'entrada' | 'salida';

export interface Insumo {
  id: string;
  nombre: string;
  unidad_medida: UnidadMedida;
  stock_actual: number;
  prioritario: boolean;
  created_at?: string;
  updated_at?: string;
}

export type NewInsumo = Omit<Insumo, 'id' | 'stock_actual' | 'created_at' | 'updated_at'>;

export interface MovimientoInsumo {
  id: string;
  insumo_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  responsable: string;
  sitio_instalacion?: string | null;
  notas_adicionales?: string | null;
  fecha?: string;
  insumos?: { nombre: string; unidad_medida: string }; // Join relation
}

export type NewMovimientoInsumo = Omit<MovimientoInsumo, 'id' | 'fecha' | 'insumos'>;
