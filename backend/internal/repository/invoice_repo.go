package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sebastianpicardo/proyectos/backend/internal/models"
)

type InvoiceRepository struct {
	db *pgxpool.Pool
}

func NewInvoiceRepository(db *pgxpool.Pool) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}

func (r *InvoiceRepository) Create(ctx context.Context, inv *models.Invoice) error {
	query := `
		INSERT INTO invoices (rut_emisor, rut_emisor_clean, folio, fecha_emision, monto_neto, monto_iva, monto_total, tipo_doc, estado, monto_pagado)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(ctx, query,
		inv.RUTEmisor,
		inv.RUTEmisorClean,
		inv.Folio,
		inv.FechaEmision,
		inv.MontoNeto,
		inv.MontoIVA,
		inv.MontoTotal,
		inv.TipoDoc,
		inv.Estado,
		inv.MontoPagado,
	).Scan(&inv.ID, &inv.CreatedAt, &inv.UpdatedAt)
}

func (r *InvoiceRepository) CreateBatch(ctx context.Context, invoices []*models.Invoice) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO invoices (rut_emisor, rut_emisor_clean, folio, fecha_emision, monto_neto, monto_iva, monto_total, tipo_doc, estado, monto_pagado)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`

	for _, inv := range invoices {
		err := tx.QueryRow(ctx, query,
			inv.RUTEmisor,
			inv.RUTEmisorClean,
			inv.Folio,
			inv.FechaEmision,
			inv.MontoNeto,
			inv.MontoIVA,
			inv.MontoTotal,
			inv.TipoDoc,
			inv.Estado,
			inv.MontoPagado,
		).Scan(&inv.ID, &inv.CreatedAt, &inv.UpdatedAt)
		if err != nil {
			return fmt.Errorf("failed to insert invoice: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *InvoiceRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Invoice, error) {
	query := `
		SELECT id, rut_emisor, rut_emisor_clean, folio, fecha_emision, monto_neto, monto_iva, monto_total, tipo_doc, estado, monto_pagado, created_at, updated_at
		FROM invoices WHERE id = $1
	`
	var inv models.Invoice
	err := r.db.QueryRow(ctx, query, id).Scan(
		&inv.ID, &inv.RUTEmisor, &inv.RUTEmisorClean, &inv.Folio,
		&inv.FechaEmision, &inv.MontoNeto, &inv.MontoIVA, &inv.MontoTotal,
		&inv.TipoDoc, &inv.Estado, &inv.MontoPagado, &inv.CreatedAt, &inv.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &inv, nil
}

func (r *InvoiceRepository) List(ctx context.Context, filter models.InvoiceFilter) (*models.InvoiceListResponse, error) {
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if filter.RUTEmisor != "" {
		whereClause += fmt.Sprintf(" AND rut_emisor_clean = $%d", argIndex)
		args = append(args, cleanRUTForQuery(filter.RUTEmisor))
		argIndex++
	}

	if filter.FechaDesde != nil {
		whereClause += fmt.Sprintf(" AND fecha_emision >= $%d", argIndex)
		args = append(args, *filter.FechaDesde)
		argIndex++
	}

	if filter.FechaHasta != nil {
		whereClause += fmt.Sprintf(" AND fecha_emision <= $%d", argIndex)
		args = append(args, *filter.FechaHasta)
		argIndex++
	}

	if filter.Estado != "" {
		whereClause += fmt.Sprintf(" AND estado = $%d", argIndex)
		args = append(args, filter.Estado)
		argIndex++
	}

	if filter.TipoDoc != "" {
		whereClause += fmt.Sprintf(" AND tipo_doc = $%d", argIndex)
		args = append(args, filter.TipoDoc)
		argIndex++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM invoices %s", whereClause)
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	limit := filter.Limit
	if limit <= 0 {
		limit = 50
	}
	offset := filter.Offset

	query := fmt.Sprintf(`
		SELECT id, rut_emisor, rut_emisor_clean, folio, fecha_emision, monto_neto, monto_iva, monto_total, tipo_doc, estado, monto_pagado, created_at, updated_at
		FROM invoices %s
		ORDER BY fecha_emision DESC, created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invoices []models.Invoice
	for rows.Next() {
		var inv models.Invoice
		err := rows.Scan(
			&inv.ID, &inv.RUTEmisor, &inv.RUTEmisorClean, &inv.Folio,
			&inv.FechaEmision, &inv.MontoNeto, &inv.MontoIVA, &inv.MontoTotal,
			&inv.TipoDoc, &inv.Estado, &inv.MontoPagado, &inv.CreatedAt, &inv.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		invoices = append(invoices, inv)
	}

	return &models.InvoiceListResponse{
		Invoices: invoices,
		Total:    total,
		Limit:    limit,
		Offset:   offset,
	}, nil
}

func (r *InvoiceRepository) UpdateEstado(ctx context.Context, id uuid.UUID, estado string, montoPagado int64) error {
	query := `
		UPDATE invoices SET estado = $1, monto_pagado = $2, updated_at = NOW()
		WHERE id = $3
	`
	_, err := r.db.Exec(ctx, query, estado, montoPagado, id)
	return err
}

func (r *InvoiceRepository) UpdateMontoPagado(ctx context.Context, id uuid.UUID, montoPagado int64) error {
	query := `
		UPDATE invoices SET monto_pagado = $1, updated_at = NOW()
		WHERE id = $2
	`
	_, err := r.db.Exec(ctx, query, montoPagado, id)
	return err
}

func (r *InvoiceRepository) DeleteByReconciliationRun(ctx context.Context, runID uuid.UUID) error {
	query := `DELETE FROM invoices WHERE id IN (SELECT invoice_id FROM bank_movements WHERE reconciliation_run_id = $1)`
	_, err := r.db.Exec(ctx, query, runID)
	return err
}

func (r *InvoiceRepository) GetByRUTAndMonto(ctx context.Context, rutClean string, monto int64) ([]*models.Invoice, error) {
	query := `
		SELECT id, rut_emisor, rut_emisor_clean, folio, fecha_emision, monto_neto, monto_iva, monto_total, tipo_doc, estado, monto_pagado, created_at, updated_at
		FROM invoices
		WHERE rut_emisor_clean = $1 AND monto_total = $2 AND estado IN ('pendiente', 'parcial')
		ORDER BY fecha_emision ASC
	`
	rows, err := r.db.Query(ctx, query, rutClean, monto)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invoices []*models.Invoice
	for rows.Next() {
		var inv models.Invoice
		err := rows.Scan(
			&inv.ID, &inv.RUTEmisor, &inv.RUTEmisorClean, &inv.Folio,
			&inv.FechaEmision, &inv.MontoNeto, &inv.MontoIVA, &inv.MontoTotal,
			&inv.TipoDoc, &inv.Estado, &inv.MontoPagado, &inv.CreatedAt, &inv.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		invoices = append(invoices, &inv)
	}
	return invoices, nil
}

func cleanRUTForQuery(rut string) string {
	result := ""
	for _, c := range rut {
		if (c >= '0' && c <= '9') || c == 'k' || c == 'K' {
			result += string(c)
		}
	}
	if len(result) > 1 {
		result = result[:len(result)-1]
	}
	return result
}