-- ==============================================================================
-- MÓDULO DE INSUMOS (STOCK ACTIVO)
-- ==============================================================================

-- 1. Crear el ENUM (desplegable) para las unidades de medida
CREATE TYPE unidad_medida_enum AS ENUM (
    'Kg',
    'Piezas',
    'Metros',
    'Cajas',
    'Rollos',
    'Litros',
    'Bolsas'
);

-- 2. Crear el ENUM para los tipos de movimiento
CREATE TYPE tipo_movimiento_enum AS ENUM ('entrada', 'salida');

-- 3. Crear la tabla de Catálogo de Insumos
CREATE TABLE insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    unidad_medida unidad_medida_enum NOT NULL,
    stock_actual NUMERIC(10, 2) NOT NULL DEFAULT 0,
    prioritario BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Crear la tabla de Movimientos (Kardex)
CREATE TABLE movimientos_insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insumo_id UUID NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
    tipo tipo_movimiento_enum NOT NULL,
    cantidad NUMERIC(10, 2) NOT NULL CHECK (cantidad > 0),
    responsable TEXT NOT NULL,           -- Quién entregó (entrada) o a quién se le dio (salida)
    sitio_instalacion TEXT,              -- Justificación de uso (usualmente para salidas)
    notas_adicionales TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- AUTOMATIZACIONES (TRIGGERS) PARA EL STOCK
-- ==============================================================================

-- 5. Función que recalcula el stock automáticamente
CREATE OR REPLACE FUNCTION actualizar_stock_insumo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo = 'entrada' THEN
        UPDATE insumos 
        SET stock_actual = stock_actual + NEW.cantidad,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.insumo_id;
    ELSIF NEW.tipo = 'salida' THEN
        UPDATE insumos 
        SET stock_actual = stock_actual - NEW.cantidad,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.insumo_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. El disparador que ejecuta la función cada vez que se inserta un movimiento
CREATE TRIGGER trigger_movimiento_insumo
AFTER INSERT ON movimientos_insumos
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_insumo();

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD (RLS) - Permiso para aplicación
-- ==============================================================================

ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select insumos" ON insumos FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert insumos" ON insumos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update insumos" ON insumos FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete insumos" ON insumos FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon select movimientos" ON movimientos_insumos FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert movimientos" ON movimientos_insumos FOR INSERT TO anon WITH CHECK (true);
-- No se permite UPDATE ni DELETE en movimientos_insumos para mantener el historial asegurado
