-- ==============================================================================
-- MIGRACIÓN 05: GESTIÓN DE INSTALACIONES Y SEGUIMIENTO DE PRECIOS
-- ==============================================================================

-- 1. Tabla para agrupar proyectos de Instalación de Estructuras
CREATE TABLE IF NOT EXISTS instalaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_proyecto VARCHAR(255) NOT NULL, -- ej. "Espectacular Av. Patria"
  cliente VARCHAR(255),
  fecha_inicio DATE DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  estado VARCHAR(50) DEFAULT 'En Progreso', -- 'En Progreso', 'Completada', 'Cancelada'
  presupuesto_estimado NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla para el Checklist de Gastos Adicionales (Grúas, Permisos, Comidas, etc.)
CREATE TABLE IF NOT EXISTS costos_instalacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instalacion_id UUID REFERENCES instalaciones(id) ON DELETE CASCADE,
  concepto VARCHAR(255) NOT NULL,
  monto NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  categoria VARCHAR(100), -- 'Trámites', 'Maquinaria', 'Mano de Obra Externa', 'Viáticos'
  fecha_gasto DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modificaciones a la tabla de Movimientos para enlazar materiales e historial de precios
ALTER TABLE movimientos_insumos
ADD COLUMN IF NOT EXISTS instalacion_id UUID REFERENCES instalaciones(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS costo_unitario NUMERIC(10, 2); -- Para guardar el precio exacto al que se compró en esa fecha

-- ==============================================================================
-- POLÍTICAS DE RLS (Row Level Security) PARA ACCESO PÚBLICO (ANON)
-- ==============================================================================

ALTER TABLE instalaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon select instalaciones" ON instalaciones FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert instalaciones" ON instalaciones FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update instalaciones" ON instalaciones FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete instalaciones" ON instalaciones FOR DELETE TO anon USING (true);

ALTER TABLE costos_instalacion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon select costos_instalacion" ON costos_instalacion FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert costos_instalacion" ON costos_instalacion FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update costos_instalacion" ON costos_instalacion FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete costos_instalacion" ON costos_instalacion FOR DELETE TO anon USING (true);
