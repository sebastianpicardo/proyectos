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

type ReconciliationRepository struct {
	db *pgxpool.Pool
}

func NewReconciliationRepository(db *pgxpool.Pool) *ReconciliationRepository {
	return &ReconciliationRepository{db: db}
}

func (r *ReconciliationRepository) Create(ctx context.Context, run *models.ReconciliationRun) error {
	query := `
		INSERT INTO reconciliation_runs (archivo_cartola, archivo_sii, total_facturas, total_movimientos, matches_exactos, matches_parciales, monto_total_facturado, monto_total_pagado, monto_total_pendiente, status, error_message, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, fecha
	`
	return r.db.QueryRow(ctx, query,
		run.ArchivoCartola,
		run.ArchivoSII,
		run.TotalFacturas,
		run.TotalMovimientos,
		run.MatchesExactos,
		run.MatchesParciales,
		run.MontoTotalFacturado,
		run.MontoTotalPagado,
		run.MontoTotalPendiente,
		run.Status,
		run.ErrorMessage,
		run.CreatedBy,
	).Scan(&run.ID, &run.Fecha)
}

func (r *ReconciliationRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.ReconciliationRun, error) {
	query := `
		SELECT id, fecha, archivo_cartola, archivo_sii, total_facturas, total_movimientos, matches_exactos, matches_parciales, monto_total_facturado, monto_total_pagado, monto_total_pendiente, status, error_message, created_by
		FROM reconciliation_runs WHERE id = $1
	`
	var run models.ReconciliationRun
	err := r.db.QueryRow(ctx, query, id).Scan(
		&run.ID, &run.Fecha, &run.ArchivoCartola, &run.ArchivoSII,
		&run.TotalFacturas, &run.TotalMovimientos, &run.MatchesExactos,
		&run.MatchesParciales, &run.MontoTotalFacturado, &run.MontoTotalPagado,
		&run.MontoTotalPendiente, &run.Status, &run.ErrorMessage, &run.CreatedBy,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &run, nil
}

func (r *ReconciliationRepository) GetWithDetails(ctx context.Context, id uuid.UUID) (*models.ReconciliationSummary, error) {
	query := `
		SELECT rr.id, rr.fecha, rr.archivo_cartola, rr.archivo_sii, rr.total_facturas, rr.total_movimientos,
			rr.matches_exactos, rr.matches_parciales, rr.monto_total_facturado, rr.monto_total_pagado,
			rr.monto_total_pendiente, rr.status, rr.error_message, rr.created_by,
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
		WHERE rr.id = $1
		GROUP BY rr.id
	`
	var run models.ReconciliationSummary
	var detallesJSON []byte

	err := r.db.QueryRow(ctx, query, id).Scan(
		&run.RunID, &run.Fecha, &run.ArchivoCartola, &run.ArchivoSII,
		&run.TotalFacturas, &run.TotalMovimientos, &run.MatchesExactos,
		&run.MatchesParciales, &run.MontoTotalFacturado, &run.MontoTotalPagado,
		&run.MontoTotalPendiente, &run.Status, &run.ErrorMessage, &run.CreatedBy,
		&detallesJSON,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &run, nil
}

func (r *ReconciliationRepository) List(ctx context.Context, filter models.ReconciliationFilter) (*models.ReconciliationListResponse, error) {
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

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

	if filter.Status != "" {
		whereClause += fmt.Sprintf(" AND status = $%d", argIndex)
		args = append(args, filter.Status)
		argIndex++
	}

	if filter.CreatedBy != nil {
		whereClause += fmt.Sprintf(" AND created_by = $%d", argIndex)
		args = append(args, *filter.CreatedBy)
		argIndex++
	}

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM reconciliation_runs %s", whereClause)
	var total int
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, err
	}

	limit := filter.Limit
	if limit <= 0 {
		limit = 20
	}
	offset := filter.Offset

	query := fmt.Sprintf(`
		SELECT id, fecha, archivo_cartola, archivo_sii, total_facturas, total_movimientos, matches_exactos, matches_parciales, monto_total_facturado, monto_total_pagado, monto_total_pendiente, status, error_message, created_by
		FROM reconciliation_runs %s
		ORDER BY fecha DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var runs []models.ReconciliationRun
	for rows.Next() {
		var run models.ReconciliationRun
		err := rows.Scan(
			&run.ID, &run.Fecha, &run.ArchivoCartola, &run.ArchivoSII,
			&run.TotalFacturas, &run.TotalMovimientos, &run.MatchesExactos,
			&run.MatchesParciales, &run.MontoTotalFacturado, &run.MontoTotalPagado,
			&run.MontoTotalPendiente, &run.Status, &run.ErrorMessage, &run.CreatedBy,
		)
		if err != nil {
			return nil, err
		}
		runs = append(runs, run)
	}

	return &models.ReconciliationListResponse{
		Runs:   runs,
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}, nil
}

func (r *ReconciliationRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string, errorMsg string) error {
	query := `UPDATE reconciliation_runs SET status = $1, error_message = $2 WHERE id = $3`
	_, err := r.db.Exec(ctx, query, status, errorMsg, id)
	return err
}

func (r *ReconciliationRepository) UpdateResults(ctx context.Context, id uuid.UUID, totalFacturas, totalMovimientos, matchesExactos, matchesParciales int, montoTotalFacturado, montoTotalPagado, montoTotalPendiente int64) error {
	query := `
		UPDATE reconciliation_runs
		SET total_facturas = $1, total_movimientos = $2, matches_exactos = $3, matches_parciales = $4,
			monto_total_facturado = $5, monto_total_pagado = $6, monto_total_pendiente = $7,
			status = 'completed'
		WHERE id = $8
	`
	_, err := r.db.Exec(ctx, query,
		totalFacturas, totalMovimientos, matchesExactos, matchesParciales,
		montoTotalFacturado, montoTotalPagado, montoTotalPendiente, id,
	)
	return err
}

func (r *ReconciliationRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM reconciliation_runs WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *ReconciliationRepository) GetStats(ctx context.Context, createdBy *uuid.UUID) (map[string]interface{}, error) {
	whereClause := ""
	args := []interface{}{}
	if createdBy != nil {
		whereClause = "WHERE created_by = $1"
		args = append(args, *createdBy)
	}

	query := fmt.Sprintf(`
		SELECT
			COUNT(*) as total_runs,
			COALESCE(SUM(total_facturas), 0) as total_facturas,
			COALESCE(SUM(total_movimientos), 0) as total_movimientos,
			COALESCE(SUM(matches_exactos), 0) as total_matches_exactos,
			COALESCE(SUM(matches_parciales), 0) as total_matches_parciales,
			COALESCE(SUM(monto_total_facturado), 0) as total_facturado,
			COALESCE(SUM(monto_total_pagado), 0) as total_pagado,
			COALESCE(SUM(monto_total_pendiente), 0) as total_pendiente
		FROM reconciliation_runs %s
	`, whereClause)

	var stats struct {
		TotalRuns         int64 `json:"total_runs"`
		TotalFacturas     int64 `json:"total_facturas"`
		TotalMovimientos  int64 `json:"total_movimientos"`
		TotalMatchesExact int64 `json:"total_matches_exactos"`
		TotalMatchesPartial int64 `json:"total_matches_parciales"`
		TotalFacturado    int64 `json:"total_facturado"`
		TotalPagado       int64 `json:"total_pagado"`
		TotalPendiente    int64 `json:"total_pendiente"`
	}

	err := r.db.QueryRow(ctx, query, args...).Scan(
		&stats.TotalRuns, &stats.TotalFacturas, &stats.TotalMovimientos,
		&stats.TotalMatchesExact, &stats.TotalMatchesPartial,
		&stats.TotalFacturado, &stats.TotalPagado, &stats.TotalPendiente,
	)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_runs":            stats.TotalRuns,
		"total_facturas":        stats.TotalFacturas,
		"total_movimientos":     stats.TotalMovimientos,
		"total_matches_exactos": stats.TotalMatchesExact,
		"total_matches_parciales": stats.TotalMatchesPartial,
		"total_facturado":       stats.TotalFacturado,
		"total_pagado":          stats.TotalPagado,
		"total_pendiente":       stats.TotalPendiente,
	}, nil
}