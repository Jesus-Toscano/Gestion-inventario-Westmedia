-- ==============================================================================
-- MIGRACIÓN 04: PROVEEDORES Y COSTOS PARA DASHBOARD FINANCIERO
-- ==============================================================================

-- 1. Crear tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  telefono VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Añadir campos financieros a los insumos
ALTER TABLE insumos
ADD COLUMN IF NOT EXISTS costo_unitario NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES proveedores(id);

-- Opcional: Podríamos insertar un proveedor por defecto
INSERT INTO proveedores (nombre, contacto) VALUES ('Proveedor General', 'S/N') ON CONFLICT DO NOTHING;

-- Habilitar RLS y Políticas
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon select proveedores" ON proveedores FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert proveedores" ON proveedores FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update proveedores" ON proveedores FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete proveedores" ON proveedores FOR DELETE TO anon USING (true);
