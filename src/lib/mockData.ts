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
  fecha_salida?: string;
  entregado_a?: string;
  estado_entrega?: BannerCondition;
}

// Temporary mock data for development
export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    fecha_ingreso: '2026-03-01',
    arte_anunciante: 'Campaña Verano 2026',
    vendedor: 'Juan Pérez',
    sitio_instalacion: 'Av. Reforma 123',
    tamano: 'doble',
    material: 'front',
    estado_lona: 'bueno',
  },
  {
    id: '2',
    fecha_ingreso: '2026-03-10',
    arte_anunciante: 'Lanzamiento Producto X',
    vendedor: 'María García',
    sitio_instalacion: 'Periférico Sur Km 15',
    tamano: 'cuadruple',
    material: 'mesh',
    estado_lona: 'nueva',
  },
  {
    id: '3',
    fecha_ingreso: '2026-02-15',
    arte_anunciante: 'Promoción Fin de Temporada',
    vendedor: 'Carlos López',
    sitio_instalacion: 'Insurgentes Centro 45',
    tamano: 'sencilla',
    material: 'front',
    estado_lona: 'regular',
    fecha_salida: '2026-03-12',
    entregado_a: 'Equipo de Instalación A',
    estado_entrega: 'en mal estado',
  },
];
