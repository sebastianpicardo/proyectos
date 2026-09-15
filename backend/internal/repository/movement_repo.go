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

type MovementRepository struct {
	db *pgxpool.Pool
}

func NewMovementRepository(db *pgxpool.Pool) *MovementRepository {
	return &MovementRepository{db: db}
}

func (r *MovementRepository) Create(ctx context.Context, mov *models.BankMovement) error {
	query := `
		INSERT INTO bank_movements (fecha, rut_contraparte, rut_contraparte_clean, monto, tipo_movimiento, descripcion, numero_documento, codigo_concepto, banco_origen, conciliado, invoice_id, reconciliation_run_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at
	`
	return r.db.QueryRow(ctx, query,
		mov.Fecha,
		mov.RUTContraparte,
		mov.RUTContraparteClean,
		mov.Monto,
		mov.TipoMovimiento,
		mov.Descripcion,
		mov.NumeroDocumento,
		mov.CodigoConcepto,
		mov.BancoOrigen,
		mov.Conciliado,
		mov.InvoiceID,
		mov.ReconciliationRunID,
	).Scan(&mov.ID, &mov.CreatedAt)
}

func (r *MovementRepository) CreateBatch(ctx context.Context, movements []*models.BankMovement) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	query := `
		INSERT INTO bank_movements (fecha, rut_contraparte, rut_contraparte_clean, monto, tipo_movimiento, descripcion, numero_documento, codigo_concepto, banco_origen, conciliado, invoice_id, reconciliation_run_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at
	`

	for _, mov := range movements {
		err := tx.QueryRow(ctx, query,
			mov.Fecha,
			mov.RUTContraparte,
			mov.RUTContraparteClean,
			mov.Monto,
			mov.TipoMovimiento,
			mov.Descripcion,
			mov.NumeroDocumento,
			mov.CodigoConcepto,
			mov.BancoOrigen,
			mov.Conciliado,
			mov.InvoiceID,
			mov.ReconciliationRunID,
		).Scan(&mov.ID, &mov.CreatedAt)
		if err != nil {
			return fmt.Errorf("failed to insert movement: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *MovementRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.BankMovement, error) {
	query := `
		SELECT id, fecha, rut_contraparte, rut_contraparte_clean, monto, tipo_movimiento, descripcion, numero_documento, codigo_concepto, banco_origen, conciliado, invoice_id, reconciliation_run_id, created_at
		FROM bank_movements WHERE id = $1
	`
	var mov models.BankMovement
	err := r.db.QueryRow(ctx, query, id).Scan(
		&mov.ID, &mov.Fecha, &mov.RUTContraparte, &mov.RUTContraparteClean,
		&mov.Monto, &mov.TipoMovimiento, &mov.Descripcion, &mov.NumeroDocumento,
		&mov.CodigoConcepto, &mov.BancoOrigen, &mov.Conciliado, &mov.InvoiceID,
		&mov.ReconciliationRunID, &mov.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &mov, nil
}

func (r *MovementRepository) List(ctx context.Context, filter models.BankMovementFilter) (*models.BankMovementListResponse, error) {
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if filter.RUTContraparte != "" {
		whereClause += fmt.Sprintf(" AND rut_contraparte_clean = $%d", argIndex)
		args = append(args, cleanRUTForQuery(filter.RUTContraparte))
		argIndex++
	}

	if filter.FechaDesde != nil {
		whereClause += fmt.Sprintf(" AND fecha >= $%d", argIndex)
		args = append(args, *filter.FechaDesde)
		argIndex++
	}

	if filter.FechaHasta != nil {
		whereClause += fmt.Sprintf(" AND fecha <= $%d", argIndex)
		args = append(args, *filter.FechaHasta)
		argIndex++
	}

	if filter.TipoMovimiento != "" {
		whereClause += fmt.Sprintf(" AND tipo_movimiento = $%d", argIndex)
		args = append(args, filter.TipoMovimiento)
		argIndex++
	}

	if filter.Conciliado != nil {
		whereClause += fmt.Sprintf(" AND conciliado = $%d", argIndex)
		args = append(args, *filter.Conciliado)
		argIndex++
	}

	if filter.BancoOrigen != "" {
		whereClause += fmt.Sprintf(" AND banco_origen = $%d", argIndex)
		args = append(args, filter.BancoOrigen)
		argIndex++
	}

	if filter.ReconciliationRunID != nil {
		whereClause += fmt.Sprintf(" AND reconciliation_run_id = $%d", argIndex)
		args = append(args, *filter.ReconciliationRunID)
		argIndex++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM bank_movements %s", whereClause)
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
		SELECT id, fecha, rut_contraparte, rut_contraparte_clean, monto, tipo_movimiento, descripcion, numero_documento, codigo_concepto, banco_origen, conciliado, invoice_id, reconciliation_run_id, created_at
		FROM bank_movements %s
		ORDER BY fecha DESC, created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var movements []models.BankMovement
	for rows.Next() {
		var mov models.BankMovement
		err := rows.Scan(
			&mov.ID, &mov.Fecha, &mov.RUTContraparte, &mov.RUTContraparteClean,
			&mov.Monto, &mov.TipoMovimiento, &mov.Descripcion, &mov.NumeroDocumento,
			&mov.CodigoConcepto, &mov.BancoOrigen, &mov.Conciliado, &mov.InvoiceID,
			&mov.ReconciliationRunID, &mov.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		movements = append(movements, mov)
	}

	return &models.BankMovementListResponse{
		Movements: movements,
		Total:     total,
		Limit:     limit,
		Offset:    offset,
	}, nil
}

func (r *MovementRepository) UpdateConciliado(ctx context.Context, id uuid.UUID, conciliado bool, invoiceID *uuid.UUID, runID uuid.UUID) error {
	query := `
		UPDATE bank_movements SET conciliado = $1, invoice_id = $2, reconciliation_run_id = $3
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query, conciliado, invoiceID, runID, id)
	return err
}

func (r *MovementRepository) UpdateBatchConciliado(ctx context.Context, updates []struct {
	MovementID uuid.UUID
	InvoiceID  *uuid.UUID
	RunID      uuid.UUID
}) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	query := `
		UPDATE bank_movements SET conciliado = TRUE, invoice_id = $1, reconciliation_run_id = $2
		WHERE id = $3
	`

	for _, u := range updates {
		_, err := tx.Exec(ctx, query, u.InvoiceID, u.RunID, u.MovementID)
		if err != nil {
			return fmt.Errorf("failed to update movement: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *MovementRepository) DeleteByReconciliationRun(ctx context.Context, runID uuid.UUID) error {
	query := `DELETE FROM bank_movements WHERE reconciliation_run_id = $1`
	_, err := r.db.Exec(ctx, query, runID)
	return err
}

func (r *MovementRepository) GetByRUTAndMonto(ctx context.Context, rutClean string, monto int64, tipoMovimiento string) ([]*models.BankMovement, error) {
	query := `
		SELECT id, fecha, rut_contraparte, rut_contraparte_clean, monto, tipo_movimiento, descripcion, numero_documento, codigo_concepto, banco_origen, conciliado, invoice_id, reconciliation_run_id, created_at
		FROM bank_movements
		WHERE rut_contraparte_clean = $1 AND monto = $2 AND tipo_movimiento = $3 AND conciliado = FALSE
		ORDER BY fecha ASC
	`
	rows, err := r.db.Query(ctx, query, rutClean, monto, tipoMovimiento)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var movements []*models.BankMovement
	for rows.Next() {
		var mov models.BankMovement
		err := rows.Scan(
			&mov.ID, &mov.Fecha, &mov.RUTContraparte, &mov.RUTContraparteClean,
			&mov.Monto, &mov.TipoMovimiento, &mov.Descripcion, &mov.NumeroDocumento,
			&mov.CodigoConcepto, &mov.BancoOrigen, &mov.Conciliado, &mov.InvoiceID,
			&mov.ReconciliationRunID, &mov.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		movements = append(movements, &mov)
	}
	return movements, nil
}

func (r *MovementRepository) GetUnconciliatedByRUT(ctx context.Context, rutClean string, tipoMovimiento string) ([]*models.BankMovement, error) {
	query := `
		SELECT id, fecha, rut_contraparte, rut_contraparte_clean, monto, tipo_movimiento, descripcion, numero_documento, codigo_concepto, banco_origen, conciliado, invoice_id, reconciliation_run_id, created_at
		FROM bank_movements
		WHERE rut_contraparte_clean = $1 AND tipo_movimiento = $2 AND conciliado = FALSE
		ORDER BY fecha ASC
	`
	rows, err := r.db.Query(ctx, query, rutClean, tipoMovimiento)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var movements []*models.BankMovement
	for rows.Next() {
		var mov models.BankMovement
		err := rows.Scan(
			&mov.ID, &mov.Fecha, &mov.RUTContraparte, &mov.RUTContraparteClean,
			&mov.Monto, &mov.TipoMovimiento, &mov.Descripcion, &mov.NumeroDocumento,
			&mov.CodigoConcepto, &mov.BancoOrigen, &mov.Conciliado, &mov.InvoiceID,
			&mov.ReconciliationRunID, &mov.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		movements = append(movements, &mov)
	}
	return movements, nil
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