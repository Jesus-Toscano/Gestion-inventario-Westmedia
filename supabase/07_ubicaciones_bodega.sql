-- ==============================================================================
-- CATÁLOGO DE UBICACIONES EN BODEGA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS ubicaciones_bodega (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas RLS
ALTER TABLE ubicaciones_bodega ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select ubicaciones" ON ubicaciones_bodega FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert ubicaciones" ON ubicaciones_bodega FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update ubicaciones" ON ubicaciones_bodega FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete ubicaciones" ON ubicaciones_bodega FOR DELETE TO anon USING (true);

-- Datos iniciales de ejemplo (ajusta según tus ubicaciones reales)
INSERT INTO ubicaciones_bodega (nombre, descripcion) VALUES
  ('Tarima 1', 'Tarima metálica lado norte'),
  ('Tarima 2', 'Tarima metálica lado sur'),
  ('Estante A', 'Estante de madera área A'),
  ('Estante B', 'Estante de madera área B'),
  ('Piso bodega', 'Piso libre de la bodega general')
ON CONFLICT (nombre) DO NOTHING;

-- Recargar esquema
NOTIFY pgrst, reload schema;
