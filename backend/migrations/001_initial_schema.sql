-- Migración inicial para MVP Conciliación Bancaria Chile
-- Ejecutar en Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla facturas (desde SII - Libro Compras/Ventas)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut_emisor VARCHAR(12) NOT NULL,
    rut_emisor_clean VARCHAR(10) NOT NULL,
    folio VARCHAR(20) NOT NULL,
    fecha_emision DATE NOT NULL,
    monto_neto BIGINT NOT NULL,
    monto_iva BIGINT NOT NULL,
    monto_total BIGINT NOT NULL,
    tipo_doc VARCHAR(10) DEFAULT '33',
    estado VARCHAR(20) DEFAULT 'pendiente',
    monto_pagado BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_rut_clean ON invoices(rut_emisor_clean);
CREATE INDEX IF NOT EXISTS idx_invoices_fecha ON invoices(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_invoices_estado ON invoices(estado);
CREATE INDEX IF NOT EXISTS idx_invoices_folio ON invoices(folio);

-- Tabla movimientos bancarios (desde cartola)
CREATE TABLE IF NOT EXISTS bank_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha DATE NOT NULL,
    rut_contraparte VARCHAR(12),
    rut_contraparte_clean VARCHAR(10),
    monto BIGINT NOT NULL,
    tipo_movimiento VARCHAR(10) NOT NULL,
    descripcion TEXT,
    numero_documento VARCHAR(50),
    codigo_concepto VARCHAR(20),
    banco_origen VARCHAR(50),
    conciliado BOOLEAN DEFAULT FALSE,
    invoice_id UUID REFERENCES invoices(id),
    reconciliation_run_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movements_rut_clean ON bank_movements(rut_contraparte_clean);
CREATE INDEX IF NOT EXISTS idx_movements_fecha ON bank_movements(fecha);
CREATE INDEX IF NOT EXISTS idx_movements_conciliado ON bank_movements(conciliado);
CREATE INDEX IF NOT EXISTS idx_movements_run ON bank_movements(reconciliation_run_id);
CREATE INDEX IF NOT EXISTS idx_movements_monto ON bank_movements(monto);

-- Tabla runs de conciliación (historial)
CREATE TABLE IF NOT EXISTS reconciliation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha TIMESTAMPTZ DEFAULT NOW(),
    archivo_cartola VARCHAR(255),
    archivo_sii VARCHAR(255),
    total_facturas INT DEFAULT 0,
    total_movimientos INT DEFAULT 0,
    matches_exactos INT DEFAULT 0,
    matches_parciales INT DEFAULT 0,
    monto_total_facturado BIGINT DEFAULT 0,
    monto_total_pagado BIGINT DEFAULT 0,
    monto_total_pendiente BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed',
    error_message TEXT,
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_runs_fecha ON reconciliation_runs(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_runs_created_by ON reconciliation_runs(created_by);

-- Vista para resumen rápido
CREATE OR REPLACE VIEW reconciliation_summary AS
SELECT
    rr.*,
    COALESCE(
        json_agg(
            json_build_object(
                'invoice_id', i.id,
                'folio', i.folio,
                'rut', i.rut_emisor,
                'monto_total', i.monto_total,
                'estado', i.estado,
                'movimiento_id', bm.id,
                'fecha_movimiento', bm.fecha,
                'monto_movimiento', bm.monto
            ) ORDER BY i.fecha_emision
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
    ) as detalles
FROM reconciliation_runs rr
LEFT JOIN bank_movements bm ON bm.reconciliation_run_id = rr.id
LEFT JOIN invoices i ON i.id = bm.invoice_id
GROUP BY rr.id;

-- Función helper para limpiar RUT (quitar puntos, guión, validar DV)
CREATE OR REPLACE FUNCTION clean_rut(rut VARCHAR) RETURNS VARCHAR AS $$
DECLARE
    rut_clean VARCHAR;
    dv_calculado CHAR;
    dv_ingresado CHAR;
    suma INT := 0;
    mult INT := 2;
    i INT;
BEGIN
    -- Limpiar: solo dígitos y K/k
    rut_clean := regexp_replace(rut, '[^0-9kK]', '', 'g');
    rut_clean := upper(rut_clean);
    
    IF length(rut_clean) < 2 THEN
        RETURN rut_clean;
    END IF;
    
    dv_ingresado := right(rut_clean, 1);
    rut_clean := left(rut_clean, length(rut_clean) - 1);
    
    -- Calcular DV
    FOR i IN REVERSE 1..length(rut_clean) LOOP
        suma := suma + (substring(rut_clean FROM i FOR 1)::INT * mult);
        mult := mult + 1;
        IF mult > 7 THEN mult := 2; END IF;
    END LOOP;
    
    dv_calculado := CASE (11 - (suma % 11))
        WHEN 11 THEN '0'
        WHEN 10 THEN 'K'
        ELSE (11 - (suma % 11))::TEXT
    END;
    
    IF dv_calculado = dv_ingresado THEN
        RETURN rut_clean;
    ELSE
        RETURN rut_clean; -- Devolver sin DV si no valida, para matching flexible
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para updated_at en invoices
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();