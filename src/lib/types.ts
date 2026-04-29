export type BannerSize = 'sencilla' | 'doble' | 'cuadruple';
export type BannerMaterial = 'front' | 'mesh';
export type BannerCondition = 'nueva' | 'bueno' | 'regular' | 'en mal estado' | 'rota';

// ─── Catálogos ──────────────────────────────────────────────────────────────
export interface Cliente {
  id: string;
  nombre: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  rol?: string;
}

export interface Sitio {
  id: string;
  nombre: string;
  direccion?: string;
}

// ─── Lonas ──────────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  fecha_ingreso: string;
  arte_anunciante: string;
  vendedor_id: string;
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

  // Joins
  vendedor_rel?: Empleado;
}

export type NewInventoryItem = Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'vendedor_rel'>;

export interface SalidaUpdate {
  fecha_salida: string;
  entregado_a: string;
  estado_entrega: BannerCondition;
  kg_alambre: number | null;
  llaves_entregadas: boolean;
  sitio_instalacion: string;
  updated_at: string;
}

export interface FullInventoryUpdate {
  fecha_ingreso: string;
  arte_anunciante: string;
  vendedor_id: string;
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

export interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  created_at?: string;
}

export interface Insumo {
  id: string;
  nombre: string;
  unidad_medida: UnidadMedida;
  stock_actual: number;
  prioritario: boolean;
  costo_unitario?: number;
  proveedor_id?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Joins
  proveedor?: Proveedor;
}

export type NewInsumo = Omit<Insumo, 'id' | 'stock_actual' | 'created_at' | 'updated_at'>;

export interface Instalacion {
  id: string;
  nombre_proyecto: string;
  cliente?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado: string;
  presupuesto_estimado?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CostoInstalacion {
  id: string;
  instalacion_id: string;
  concepto: string;
  monto: number;
  categoria?: string;
  fecha_gasto?: string;
  created_at?: string;
}

export interface MovimientoInsumo {
  id: string;
  insumo_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  responsable?: string;
  sitio_instalacion?: string;
  notas_adicionales?: string;
  fecha: string;
  cancelado: boolean;
  costo_unitario?: number;
  instalacion_id?: string | null;
  
  // Joins
  insumos?: Insumo;
  instalacion?: Instalacion;
}

export type NewMovimientoInsumo = Omit<MovimientoInsumo, 'id' | 'fecha' | 'insumos' | 'instalacion'>;
