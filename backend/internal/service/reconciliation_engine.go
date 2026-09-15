package service

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"github.com/google/uuid"
	"github.com/sebastianpicardo/proyectos/backend/internal/models"
	"github.com/sebastianpicardo/proyectos/backend/internal/repository"
)

type ReconciliationEngine struct {
	invoiceRepo   *repository.InvoiceRepository
	movementRepo  *repository.MovementRepository
}

func NewReconciliationEngine(invoiceRepo *repository.InvoiceRepository, movementRepo *repository.MovementRepository) *ReconciliationEngine {
	return &ReconciliationEngine{
		invoiceRepo:  invoiceRepo,
		movementRepo: movementRepo,
	}
}

type MatchCandidate struct {
	Invoice   *models.Invoice
	Movements []*models.BankMovement
	MatchType string
	Amount    int64
}

func (e *ReconciliationEngine) Execute(ctx context.Context, runID uuid.UUID) (*models.ReconciliationResult, error) {
	invoices, err := e.invoiceRepo.List(ctx, models.InvoiceFilter{
		Estado: "pendiente",
		Limit:  10000,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get invoices: %w", err)
	}

	movements, err := e.movementRepo.List(ctx, models.BankMovementFilter{
		Conciliado: boolPtr(false),
		Limit:      10000,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get movements: %w", err)
	}

	invoiceMap := make(map[string][]*models.Invoice)
	for i := range invoices.Invoices {
		inv := &invoices.Invoices[i]
		key := fmt.Sprintf("%s_%d", inv.RUTEmisorClean, inv.MontoTotal)
		invoiceMap[key] = append(invoiceMap[key], inv)
	}

	movementMap := make(map[string][]*models.BankMovement)
	for i := range movements.Movements {
		mov := &movements.Movements[i]
		if mov.TipoMovimiento != "abono" {
			continue
		}
		key := fmt.Sprintf("%s_%d", mov.RUTContraparteClean, mov.Monto)
		movementMap[key] = append(movementMap[key], mov)
	}

	var matches []models.MatchDetail
	matchesExactos := 0
	matchesParciales := 0
	montoTotalFacturado := int64(0)
	montoTotalPagado := int64(0)
	
	updates := []struct {
		MovementID uuid.UUID
		InvoiceID  *uuid.UUID
		RunID      uuid.UUID
	}{}

	invoicePagado := make(map[uuid.UUID]int64)

	for _, inv := range invoices.Invoices {
		montoTotalFacturado += inv.MontoTotal
	}

	matchedInvoices := make(map[uuid.UUID]bool)
	matchedMovements := make(map[uuid.UUID]bool)

	for rutMonto, movs := range movementMap {
		invs := invoiceMap[rutMonto]
		
		for _, mov := range movs {
			if matchedMovements[mov.ID] {
				continue
			}
			
			for _, inv := range invs {
				if matchedInvoices[inv.ID] {
					continue
				}

				if inv.MontoTotal == mov.Monto && inv.RUTEmisorClean == mov.RUTContraparteClean {
					matchedInvoices[inv.ID] = true
					matchedMovements[mov.ID] = true
					matchesExactos++
					montoTotalPagado += inv.MontoTotal
					invoicePagado[inv.ID] = inv.MontoTotal

					matches = append(matches, models.MatchDetail{
						InvoiceID:       inv.ID,
						Folio:           inv.Folio,
						RUTEmisor:       inv.RUTEmisor,
						MontoFactura:    inv.MontoTotal,
						MontoNeto:       inv.MontoNeto,
						MontoIVA:        inv.MontoIVA,
						Estado:          "conciliada",
						MovimientoID:    &mov.ID,
						FechaMovimiento: &mov.Fecha,
						MontoMovimiento: &mov.Monto,
						TipoMovimiento:  &mov.TipoMovimiento,
						DescripcionMov:  &mov.Descripcion,
						NumeroDocumento: &mov.NumeroDocumento,
						TipoMatch:       "exacto",
					})

					updates = append(updates, struct {
						MovementID uuid.UUID
						InvoiceID  *uuid.UUID
						RunID      uuid.UUID
					}{
						MovementID: mov.ID,
						InvoiceID:  &inv.ID,
						RunID:      runID,
					})
					break
				}
			}
		}
	}

	for rutMonto, movs := range movementMap {
		for _, mov := range movs {
			if matchedMovements[mov.ID] {
				continue
			}

			parts := strings.Split(rutMonto, "_")
			if len(parts) != 2 {
				continue
			}
			rut := parts[0]

			for _, inv := range invoiceMap[rut+"_"] {
				if matchedInvoices[inv.ID] {
					continue
				}

				if inv.RUTEmisorClean == rut && inv.MontoTotal > mov.Monto && mov.Monto > 0 {
					remaining := inv.MontoTotal - invoicePagado[inv.ID]
					if mov.Monto <= remaining {
						matchedMovements[mov.ID] = true
						matchesParciales++
						montoTotalPagado += mov.Monto
						invoicePagado[inv.ID] += mov.Monto

						newEstado := "parcial"
						if invoicePagado[inv.ID] >= inv.MontoTotal {
							newEstado = "conciliada"
							matchedInvoices[inv.ID] = true
						}

						matches = append(matches, models.MatchDetail{
							InvoiceID:       inv.ID,
							Folio:           inv.Folio,
							RUTEmisor:       inv.RUTEmisor,
							MontoFactura:    inv.MontoTotal,
							MontoNeto:       inv.MontoNeto,
							MontoIVA:        inv.MontoIVA,
							Estado:          newEstado,
							MovimientoID:    &mov.ID,
							FechaMovimiento: &mov.Fecha,
							MontoMovimiento: &mov.Monto,
							TipoMovimiento:  &mov.TipoMovimiento,
							DescripcionMov:  &mov.Descripcion,
							NumeroDocumento: &mov.NumeroDocumento,
							TipoMatch:       "parcial",
							DiferenciaMonto: int64Ptr(inv.MontoTotal - invoicePagado[inv.ID]),
						})

						updates = append(updates, struct {
							MovementID uuid.UUID
							InvoiceID  *uuid.UUID
							RunID      uuid.UUID
						}{
							MovementID: mov.ID,
							InvoiceID:  &inv.ID,
							RunID:      runID,
						})
					}
				}
			}
		}
	}

	for _, inv := range invoices.Invoices {
		if !matchedInvoices[inv.ID] {
			estado := "pendiente"
			if invoicePagado[inv.ID] > 0 {
				estado = "parcial"
			}
			matches = append(matches, models.MatchDetail{
				InvoiceID:    inv.ID,
				Folio:        inv.Folio,
				RUTEmisor:    inv.RUTEmisor,
				MontoFactura: inv.MontoTotal,
				MontoNeto:    inv.MontoNeto,
				MontoIVA:     inv.MontoIVA,
				Estado:       estado,
				TipoMatch:    "sin_match",
			})
		}
	}

	for _, mov := range movements.Movements {
		if !matchedMovements[mov.ID] && mov.TipoMovimiento == "abono" {
			matches = append(matches, models.MatchDetail{
				MovimientoID:    &mov.ID,
				FechaMovimiento: &mov.Fecha,
				MontoMovimiento: &mov.Monto,
				TipoMovimiento:  &mov.TipoMovimiento,
				DescripcionMov:  &mov.Descripcion,
				NumeroDocumento: &mov.NumeroDocumento,
				TipoMatch:       "sin_factura",
				RUTEmisor:       mov.RUTContraparte,
			})
		}
	}

	sort.Slice(matches, func(i, j int) bool {
		if matches[i].FechaEmision.IsZero() && matches[j].FechaEmision.IsZero() {
			return false
		}
		if matches[i].FechaEmision.IsZero() {
			return false
		}
		if matches[j].FechaEmision.IsZero() {
			return true
		}
		return matches[i].FechaEmision.Before(matches[j].FechaEmision)
	})

	montoTotalPendiente := montoTotalFacturado - montoTotalPagado

	err := e.movementRepo.UpdateBatchConciliado(ctx, updates)
	if err != nil {
		return nil, fmt.Errorf("failed to update movements: %w", err)
	}

	for invID, monto := range invoicePagado {
		var estado string
		inv, _ := e.invoiceRepo.GetByID(ctx, invID)
		if inv != nil {
			if monto >= inv.MontoTotal {
				estado = "conciliada"
			} else if monto > 0 {
				estado = "parcial"
			} else {
				estado = "pendiente"
			}
			e.invoiceRepo.UpdateEstado(ctx, invID, estado, monto)
		}
	}

	return &models.ReconciliationResult{
		RunID:              runID,
		TotalFacturas:      len(invoices.Invoices),
		TotalMovimientos:   len(movements.Movements),
		MatchesExactos:     matchesExactos,
		MatchesParciales:   matchesParciales,
		MontoTotalFacturado: montoTotalFacturado,
		MontoTotalPagado:   montoTotalPagado,
		MontoTotalPendiente: montoTotalPendiente,
		Detalles:           matches,
	}, nil
}

func (e *ReconciliationEngine) PreviewMatch(ctx context.Context, rutClean string, monto int64) ([]*models.Invoice, []*models.BankMovement, error) {
	invoices, err := e.invoiceRepo.GetByRUTAndMonto(ctx, rutClean, monto)
	if err != nil {
		return nil, nil, err
	}

	movements, err := e.movementRepo.GetByRUTAndMonto(ctx, rutClean, monto, "abono")
	if err != nil {
		return nil, nil, err
	}

	return invoices, movements, nil
}

func boolPtr(b bool) *bool {
	return &b
}

func int64Ptr(i int64) *int64 {
	return &i
}