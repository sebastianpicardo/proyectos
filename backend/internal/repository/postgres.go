package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sebastianpicardo/proyectos/backend/internal/config"
)

type PostgresDB struct {
	Pool *pgxpool.Pool
}

func NewPostgresDB(cfg *config.DatabaseConfig) (*PostgresDB, error) {
	if cfg.URL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	poolConfig, err := pgxpool.ParseConfig(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database config: %w", err)
	}

	poolConfig.MaxConns = cfg.MaxConns
	poolConfig.MinConns = cfg.MinConns
	poolConfig.MaxConnLifetime = cfg.MaxConnLifetime
	poolConfig.MaxConnIdleTime = cfg.MaxConnIdleTime
	poolConfig.HealthCheckPeriod = 1 * time.Minute

	pool, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &PostgresDB{Pool: pool}, nil
}

func (db *PostgresDB) Close() {
	db.Pool.Close()
}

func (db *PostgresDB) Ping(ctx context.Context) error {
	return db.Pool.Ping(ctx)
}

func (db *PostgresDB) BeginTx(ctx context.Context) (pgxpool.Tx, error) {
	return db.Pool.Begin(ctx)
}

func RunMigrations(pool *pgxpool.Pool) error {
	migrations := []string{
		`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
		`CREATE TABLE IF NOT EXISTS invoices (
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
		);`,
		`CREATE INDEX IF NOT EXISTS idx_invoices_rut_clean ON invoices(rut_emisor_clean);`,
		`CREATE INDEX IF NOT EXISTS idx_invoices_fecha ON invoices(fecha_emision);`,
		`CREATE INDEX IF NOT EXISTS idx_invoices_estado ON invoices(estado);`,
		`CREATE TABLE IF NOT EXISTS bank_movements (
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
		);`,
		`CREATE INDEX IF NOT EXISTS idx_movements_rut_clean ON bank_movements(rut_contraparte_clean);`,
		`CREATE INDEX IF NOT EXISTS idx_movements_fecha ON bank_movements(fecha);`,
		`CREATE INDEX IF NOT EXISTS idx_movements_conciliado ON bank_movements(conciliado);`,
		`CREATE INDEX IF NOT EXISTS idx_movements_run ON bank_movements(reconciliation_run_id);`,
		`CREATE TABLE IF NOT EXISTS reconciliation_runs (
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
		);`,
		`CREATE INDEX IF NOT EXISTS idx_runs_fecha ON reconciliation_runs(fecha DESC);`,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for _, migration := range migrations {
		if _, err := pool.Exec(ctx, migration); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	return nil
}