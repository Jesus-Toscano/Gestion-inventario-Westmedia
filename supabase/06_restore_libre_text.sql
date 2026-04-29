-- ==============================================================================
-- MIGRACIÓN PARA REVERTIR LA NORMALIZACIÓN DE LONAS (INVENTORY_ITEMS)
-- ==============================================================================

-- 1. Asegurarnos de que las columnas de texto libre existan
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS arte_anunciante TEXT,
ADD COLUMN IF NOT EXISTS vendedor TEXT,
ADD COLUMN IF NOT EXISTS sitio_instalacion TEXT,
ADD COLUMN IF NOT EXISTS entregado_a TEXT;

-- 2. Recuperar la información desde las tablas de catálogos y rellenar las columnas de texto
-- (Asumiendo que las columnas _id aún existen en inventory_items, si no existen no pasa nada, pero si existen, restauramos la data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'cliente_id') THEN
        UPDATE inventory_items i SET arte_anunciante = c.nombre FROM clientes c WHERE c.id = i.cliente_id AND i.arte_anunciante IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'vendedor_id') THEN
        UPDATE inventory_items i SET vendedor = e.nombre FROM empleados e WHERE e.id = i.vendedor_id AND i.vendedor IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'sitio_id') THEN
        UPDATE inventory_items i SET sitio_instalacion = s.nombre FROM sitios s WHERE s.id = i.sitio_id AND i.sitio_instalacion IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'entregado_a_id') THEN
        UPDATE inventory_items i SET entregado_a = e.nombre FROM empleados e WHERE e.id = i.entregado_a_id AND i.entregado_a IS NULL;
    END IF;
END $$;

-- 3. Hacemos las columnas requeridas (opcional, pero útil para la app)
ALTER TABLE inventory_items ALTER COLUMN arte_anunciante SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN vendedor SET NOT NULL;
ALTER TABLE inventory_items ALTER COLUMN sitio_instalacion SET NOT NULL;

-- 4. Notificar a Supabase que recargue la cache de esquemas
NOTIFY pgrst, reload schema;
