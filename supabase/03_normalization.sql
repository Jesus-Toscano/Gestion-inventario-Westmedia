-- ==============================================================================
-- 03_NORMALIZATION: Migración de texto libre a Catálogos Relacionales
-- ==============================================================================

-- 1. Crear Tabla Clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear Tabla Empleados / Instaladores
CREATE TABLE empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    rol TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear Tabla Sitios
CREATE TABLE sitios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    direccion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select clientes" ON clientes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert clientes" ON clientes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update clientes" ON clientes FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon select empleados" ON empleados FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert empleados" ON empleados FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update empleados" ON empleados FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon select sitios" ON sitios FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert sitios" ON sitios FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update sitios" ON sitios FOR UPDATE TO anon USING (true);

-- ==============================================================================
-- MIGRACIÓN DE DATOS EXISTENTES
-- ==============================================================================

-- Insertar Clientes únicos
INSERT INTO clientes (nombre)
SELECT DISTINCT arte_anunciante FROM inventory_items 
WHERE arte_anunciante IS NOT NULL AND trim(arte_anunciante) <> '' 
ON CONFLICT (nombre) DO NOTHING;

-- Insertar Empleados únicos (Vendedores y Entregados)
INSERT INTO empleados (nombre)
SELECT DISTINCT vendedor FROM inventory_items 
WHERE vendedor IS NOT NULL AND trim(vendedor) <> '' 
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO empleados (nombre)
SELECT DISTINCT entregado_a FROM inventory_items 
WHERE entregado_a IS NOT NULL AND trim(entregado_a) <> '' 
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO empleados (nombre)
SELECT DISTINCT responsable FROM movimientos_insumos 
WHERE responsable IS NOT NULL AND trim(responsable) <> '' 
ON CONFLICT (nombre) DO NOTHING;

-- Insertar Sitios únicos
INSERT INTO sitios (nombre)
SELECT DISTINCT sitio_instalacion FROM inventory_items 
WHERE sitio_instalacion IS NOT NULL AND trim(sitio_instalacion) <> '' 
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO sitios (nombre)
SELECT DISTINCT sitio_instalacion FROM movimientos_insumos 
WHERE sitio_instalacion IS NOT NULL AND trim(sitio_instalacion) <> '' 
ON CONFLICT (nombre) DO NOTHING;

-- ==============================================================================
-- ACTUALIZACIÓN DE TABLAS (Añadir FKs)
-- ==============================================================================

-- INVENTORY ITEMS
ALTER TABLE inventory_items 
ADD COLUMN cliente_id UUID REFERENCES clientes(id),
ADD COLUMN vendedor_id UUID REFERENCES empleados(id),
ADD COLUMN sitio_id UUID REFERENCES sitios(id),
ADD COLUMN entregado_a_id UUID REFERENCES empleados(id);

-- Llenar los IDs
UPDATE inventory_items i SET cliente_id = c.id FROM clientes c WHERE c.nombre = i.arte_anunciante;
UPDATE inventory_items i SET vendedor_id = e.id FROM empleados e WHERE e.nombre = i.vendedor;
UPDATE inventory_items i SET sitio_id = s.id FROM sitios s WHERE s.nombre = i.sitio_instalacion;
UPDATE inventory_items i SET entregado_a_id = e.id FROM empleados e WHERE e.nombre = i.entregado_a;

-- Hacer las nuevas columnas NO NULL donde corresponda
ALTER TABLE inventory_items ALTER COLUMN cliente_id SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN vendedor_id SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN sitio_id SET NOT NULL;

-- MOVIMIENTOS INSUMOS
ALTER TABLE movimientos_insumos
ADD COLUMN responsable_id UUID REFERENCES empleados(id),
ADD COLUMN sitio_id UUID REFERENCES sitios(id);

UPDATE movimientos_insumos m SET responsable_id = e.id FROM empleados e WHERE e.nombre = m.responsable;
UPDATE movimientos_insumos m SET sitio_id = s.id FROM sitios s WHERE s.nombre = m.sitio_instalacion;

ALTER TABLE movimientos_insumos ALTER COLUMN responsable_id SET NOT NULL;

-- ==============================================================================
-- LIMPIEZA FINAL: ELIMINAR COLUMNAS DE TEXTO LIBRE
-- ==============================================================================
-- Descomentar estas líneas SOLO DESPUÉS de comprobar que los IDs se pasaron correctamente.
-- Para producción, lo más seguro es tirarlas:
ALTER TABLE inventory_items 
  DROP COLUMN arte_anunciante, 
  DROP COLUMN vendedor, 
  DROP COLUMN sitio_instalacion, 
  DROP COLUMN entregado_a;

ALTER TABLE movimientos_insumos 
  DROP COLUMN responsable, 
  DROP COLUMN sitio_instalacion;
