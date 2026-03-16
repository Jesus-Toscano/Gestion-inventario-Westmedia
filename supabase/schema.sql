-- Create the enum for the size (tamaño)
CREATE TYPE banner_size AS ENUM ('sencilla', 'doble', 'cuadruple');

-- Create the enum for the material
CREATE TYPE banner_material AS ENUM ('front', 'mesh');

-- Create the enum for the condition (estado)
CREATE TYPE banner_condition AS ENUM ('nueva', 'bueno', 'regular', 'en mal estado', 'rota');

-- Create the main inventory table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Información de Ingreso
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    arte_anunciante TEXT NOT NULL,
    vendedor TEXT NOT NULL,
    sitio_instalacion TEXT NOT NULL,
    
    -- Características del elemento
    tamano banner_size NOT NULL,
    material banner_material NOT NULL,
    estado_lona banner_condition NOT NULL,
    
    -- Información de Salida / Entrega
    fecha_salida DATE,
    entregado_a TEXT,
    estado_entrega banner_condition,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We might want a transactions table later if an item can go in and out multiple times,
-- but based on the requirements, it seems like a single item lifecycle right now.

-- Enable Row Level Security (RLS)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies (Example: Allow all authenticated users to read/write for now)
CREATE POLICY "Allow authenticated users to read inventory_items" ON inventory_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert inventory_items" ON inventory_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update inventory_items" ON inventory_items
    FOR UPDATE USING (auth.role() = 'authenticated');
