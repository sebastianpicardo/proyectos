package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/sebastianpicardo/proyectos/backend/internal/models"
	"github.com/sebastianpicardo/proyectos/backend/internal/repository"
)

type ReconciliationService struct {
	parser        *CSVParser
	engine        *ReconciliationEngine
	invoiceRepo   *repository.InvoiceRepository
	movementRepo  *repository.MovementRepository
	reconRepo     *repository.ReconciliationRepository
}

func NewReconciliationService(
	parser *CSVParser,
	engine *ReconciliationEngine,
	invoiceRepo *repository.InvoiceRepository,
	movementRepo *repository.MovementRepository,
	reconRepo *repository.ReconciliationRepository,
) *ReconciliationService {
	return &ReconciliationService{
		parser:        parser,
		engine:        engine,
		invoiceRepo:   invoiceRepo,
		movementRepo:  movementRepo,
		reconRepo:     reconRepo,
	}
}

func (s *ReconciliationService) UploadCartola(ctx context.Context, data []byte, filename, bancoOrigen string, userID *uuid.UUID) (*models.BankMovementPreview, uuid.UUID, error) {
	result, err := s.parser.ParseCartola(data, bancoOrigen)
	if err != nil {
		return nil, uuid.Nil, fmt.Errorf("failed to parse cartola: %w", err)
	}

	movements := make([]*models.BankMovement, 0, len(result.Rows))
	for _, row := range result.Rows {
		if len(row.Errors) > 0 {
			continue
		}
		mov := &models.BankMovement{
			Fecha:                row.Fecha,
			RUTContraparte:       row.RUT,
			RUTContraparteClean:  row.RUTClean,
			Monto:                row.Monto,
			TipoMovimiento:       row.TipoMovimiento,
			Descripcion:          row.Descripcion,
			NumeroDocumento:      row.NumeroDocumento,
			CodigoConcepto:       row.CodigoConcepto,
			BancoOrigen:          bancoOrigen,
			Conciliado:           false,
		}
		movements = append(movements, mov)
	}

	run := &models.ReconciliationRun{
		ArchivoCartola: filename,
		Status:         "uploaded",
		CreatedBy:      userID,
	}

	err = s.reconRepo.Create(ctx, run)
	if err != nil {
		return nil, uuid.Nil, fmt.Errorf("failed to create run: %w", err)
	}

	for _, mov := range movements {
		mov.ReconciliationRunID = &run.ID
	}

	err = s.movementRepo.CreateBatch(ctx, movements)
	if err != nil {
		s.reconRepo.UpdateStatus(ctx, run.ID, "failed", err.Error())
		return nil, uuid.Nil, fmt.Errorf("failed to save movements: %w", err)
	}

	run.TotalMovimientos = len(movements)
	s.reconRepo.UpdateResults(ctx, run.ID, 0, len(movements), 0, 0, 0, 0, 0)

	preview := &models.BankMovementPreview{
		Headers: result.Headers,
		Rows:    make([][]string, min(len(result.Rows), 10)),
		Total:   result.Total,
		Errors:  result.Errors,
	}

	for i, row := range result.Rows {
		if i >= 10 {
			break
		}
		preview.Rows[i] = []string{
			row.Fecha.Format("02-01-2006"),
			row.RUT,
			fmt.Sprintf("%d", row.Monto),
			row.TipoMovimiento,
			row.Descripcion,
			row.NumeroDocumento,
			row.CodigoConcepto,
		}
	}

	return preview, run.ID, nil
}

func (s *ReconciliationService) UploadSII(ctx context.Context, data []byte, filename string, userID *uuid.UUID) (*models.BankMovementPreview, uuid.UUID, error) {
	result, err := s.parser.ParseSII(data)
	if err != nil {
		return nil, uuid.Nil, fmt.Errorf("failed to parse SII: %w", err)
	}

	invoices := make([]*models.Invoice, 0, len(result.Rows))
	for _, row := range result.Rows {
		if len(row.Errors) > 0 || row.Monto == 0 {
			continue
		}
		inv := &models.Invoice{
			RUTEmisor:      row.RUT,
			RUTEmisorClean: row.RUTClean,
			Folio:          row.NumeroDocumento,
			FechaEmision:   row.Fecha,
			MontoTotal:     row.Monto,
			MontoNeto:      int64(float64(row.Monto) / 1.19),
			MontoIVA:       row.Monto - int64(float64(row.Monto)/1.19),
			TipoDoc:        "33",
			Estado:         "pendiente",
			MontoPagado:    0,
		}
		invoices = append(invoices, inv)
	}

	run := &models.ReconciliationRun{
		ArchivoSII: filename,
		Status:     "uploaded",
		CreatedBy:  userID,
	}

	err = s.reconRepo.Create(ctx, run)
	if err != nil {
		return nil, uuid.Nil, fmt.Errorf("failed to create run: %w", err)
	}

	for _, inv := range invoices {
		inv.CreatedAt = time.Now()
		inv.UpdatedAt = time.Now()
	}

	err = s.invoiceRepo.CreateBatch(ctx, invoices)
	if err != nil {
		s.reconRepo.UpdateStatus(ctx, run.ID, "failed", err.Error())
		return nil, uuid.Nil, fmt.Errorf("failed to save invoices: %w", err)
	}

	run.TotalFacturas = len(invoices)
	s.reconRepo.UpdateResults(ctx, run.ID, len(invoices), 0, 0, 0, 0, 0, 0)

	preview := &models.BankMovementPreview{
		Headers: result.Headers,
		Rows:    make([][]string, min(len(result.Rows), 10)),
		Total:   result.Total,
		Errors:  result.Errors,
	}

	for i, row := range result.Rows {
		if i >= 10 {
			break
		}
		preview.Rows[i] = []string{
			row.Fecha.Format("02-01-2006"),
			row.RUT,
			row.NumeroDocumento,
			fmt.Sprintf("%d", row.Monto),
			row.Descripcion,
		}
	}

	return preview, run.ID, nil
}

func (s *ReconciliationService) RunReconciliation(ctx context.Context, req models.RunRequest, userID *uuid.UUID) (*models.ReconciliationResult, error) {
	var cartolaRunID, siiRunID uuid.UUID
	
	if req.CartolaRunID != nil {
		cartolaRunID = *req.CartolaRunID
	}
	if req.SIIRunID != nil {
		siiRunID = *req.SIIRunID
	}

	if cartolaRunID == uuid.Nil && siiRunID == uuid.Nil {
		return nil, fmt.Errorf("at least one run ID (cartola or sii) is required")
	}

	run := &models.ReconciliationRun{
		Status:    "processing",
		CreatedBy: userID,
	}

	if cartolaRunID != uuid.Nil {
		cRun, err := s.reconRepo.GetByID(ctx, cartolaRunID)
		if err != nil || cRun == nil {
			return nil, fmt.Errorf("cartola run not found")
		}
		run.ArchivoCartola = cRun.ArchivoCartola
	}

	if siiRunID != uuid.Nil {
		sRun, err := s.reconRepo.GetByID(ctx, siiRunID)
		if err != nil || sRun == nil {
			return nil, fmt.Errorf("sii run not found")
		}
		run.ArchivoSII = sRun.ArchivoSII
	}

	err := s.reconRepo.Create(ctx, run)
	if err != nil {
		return nil, fmt.Errorf("failed to create reconciliation run: %w", err)
	}

	result, err := s.engine.Execute(ctx, run.ID)
	if err != nil {
		s.reconRepo.UpdateStatus(ctx, run.ID, "failed", err.Error())
		return nil, fmt.Errorf("reconciliation failed: %w", err)
	}

	s.reconRepo.UpdateResults(ctx, run.ID,
		result.TotalFacturas,
		result.TotalMovimientos,
		result.MatchesExactos,
		result.MatchesParciales,
		result.MontoTotalFacturado,
		result.MontoTotalPagado,
		result.MontoTotalPendiente,
	)

	result.RunID = run.ID
	return result, nil
}

func (s *ReconciliationService) GetSummary(ctx context.Context, runID uuid.UUID) (*models.ReconciliationSummary, error) {
	run, err := s.reconRepo.GetWithDetails(ctx, runID)
	if err != nil {
		return nil, err
	}
	if run == nil {
		return nil, fmt.Errorf("run not found")
	}

	summary := &models.ReconciliationSummary{
		RunID:                 run.RunID,
		Fecha:                 run.Fecha,
		ArchivoCartola:        run.ArchivoCartola,
		ArchivoSII:            run.ArchivoSII,
		TotalFacturas:         run.TotalFacturas,
		TotalMovimientos:      run.TotalMovimientos,
		MatchesExactos:        run.MatchesExactos,
		MatchesParciales:      run.MatchesParciales,
		MontoTotalFacturado:   run.GetMontoTotalFacturadoDecimal(),
		MontoTotalPagado:      run.GetMontoTotalPagadoDecimal(),
		MontoTotalPendiente:   run.GetMontoTotalPendienteDecimal(),
		PorcentajePagado:      run.GetPorcentajePagado(),
		Status:                run.Status,
		Detalles:              run.Detalles,
	}

	return summary, nil
}

func (s *ReconciliationService) GetHistory(ctx context.Context, filter models.ReconciliationFilter) (*models.ReconciliationListResponse, error) {
	return s.reconRepo.List(ctx, filter)
}

func (s *ReconciliationService) GetDetail(ctx context.Context, runID uuid.UUID) (*models.ReconciliationResult, error) {
	summary, err := s.GetSummary(ctx, runID)
	if err != nil {
		return nil, err
	}

	return &models.ReconciliationResult{
		RunID:              summary.RunID,
		TotalFacturas:      summary.TotalFacturas,
		TotalMovimientos:   summary.TotalMovimientos,
		MatchesExactos:     summary.MatchesExactos,
		MatchesParciales:   summary.MatchesParciales,
		MontoTotalFacturado: summary.MontoTotalFacturado.IntPart(),
		MontoTotalPagado:   summary.MontoTotalPagado.IntPart(),
		MontoTotalPendiente: summary.MontoTotalPendiente.IntPart(),
		Detalles:           summary.Detalles,
	}, nil
}

func (s *ReconciliationService) DeleteRun(ctx context.Context, runID uuid.UUID) error {
	err := s.invoiceRepo.DeleteByReconciliationRun(ctx, runID)
	if err != nil {
		return fmt.Errorf("failed to delete invoices: %w", err)
	}

	err = s.movementRepo.DeleteByReconciliationRun(ctx, runID)
	if err != nil {
		return fmt.Errorf("failed to delete movements: %w", err)
	}

	err = s.reconRepo.Delete(ctx, runID)
	if err != nil {
		return fmt.Errorf("failed to delete run: %w", err)
	}

	return nil
}

func (s *ReconciliationService) GetStats(ctx context.Context, userID *uuid.UUID) (map[string]interface{}, error) {
	return s.reconRepo.GetStats(ctx, userID)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}