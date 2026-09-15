package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type ReconciliationRun struct {
	ID                    uuid.UUID  `json:"id" db:"id"`
	Fecha                 time.Time  `json:"fecha" db:"fecha"`
	ArchivoCartola        string     `json:"archivo_cartola" db:"archivo_cartola"`
	ArchivoSII            string     `json:"archivo_sii" db:"archivo_sii"`
	TotalFacturas         int        `json:"total_facturas" db:"total_facturas"`
	TotalMovimientos      int        `json:"total_movimientos" db:"total_movimientos"`
	MatchesExactos        int        `json:"matches_exactos" db:"matches_exactos"`
	MatchesParciales      int        `json:"matches_parciales" db:"matches_parciales"`
	MontoTotalFacturado   int64      `json:"monto_total_facturado" db:"monto_total_facturado"`
	MontoTotalPagado      int64      `json:"monto_total_pagado" db:"monto_total_pagado"`
	MontoTotalPendiente   int64      `json:"monto_total_pendiente" db:"monto_total_pendiente"`
	Status                string     `json:"status" db:"status"`
	ErrorMessage          string     `json:"error_message,omitempty" db:"error_message"`
	CreatedBy             *uuid.UUID `json:"created_by,omitempty" db:"created_by"`
}

func (r *ReconciliationRun) GetMontoTotalFacturadoDecimal() decimal.Decimal {
	return decimal.NewFromInt(r.MontoTotalFacturado).Div(decimal.NewFromInt(100))
}

func (r *ReconciliationRun) GetMontoTotalPagadoDecimal() decimal.Decimal {
	return decimal.NewFromInt(r.MontoTotalPagado).Div(decimal.NewFromInt(100))
}

func (r *ReconciliationRun) GetMontoTotalPendienteDecimal() decimal.Decimal {
	return decimal.NewFromInt(r.MontoTotalPendiente).Div(decimal.NewFromInt(100))
}

func (r *ReconciliationRun) GetPorcentajePagado() float64 {
	if r.MontoTotalFacturado == 0 {
		return 0
	}
	return float64(r.MontoTotalPagado) / float64(r.MontoTotalFacturado) * 100
}

type MatchDetail struct {
	InvoiceID         uuid.UUID  `json:"invoice_id"`
	Folio             string     `json:"folio"`
	RUTEmisor         string     `json:"rut_emisor"`
	RazonSocial       string     `json:"razon_social,omitempty"`
	FechaEmision      time.Time  `json:"fecha_emision"`
	MontoFactura      int64      `json:"monto_factura"`
	MontoNeto         int64      `json:"monto_neto"`
	MontoIVA          int64      `json:"monto_iva"`
	Estado            string     `json:"estado"`
	MovimientoID      *uuid.UUID `json:"movimiento_id,omitempty"`
	FechaMovimiento   *time.Time `json:"fecha_movimiento,omitempty"`
	MontoMovimiento   *int64     `json:"monto_movimiento,omitempty"`
	TipoMovimiento    *string    `json:"tipo_movimiento,omitempty"`
	DescripcionMov    *string    `json:"descripcion_mov,omitempty"`
	NumeroDocumento   *string    `json:"numero_documento,omitempty"`
	TipoMatch         string     `json:"tipo_match"`
	DiferenciaMonto   *int64     `json:"diferencia_monto,omitempty"`
}

func (m *MatchDetail) GetMontoFacturaDecimal() decimal.Decimal {
	return decimal.NewFromInt(m.MontoFactura).Div(decimal.NewFromInt(100))
}

func (m *MatchDetail) GetMontoMovimientoDecimal() decimal.Decimal {
	if m.MontoMovimiento == nil {
		return decimal.Zero
	}
	return decimal.NewFromInt(*m.MontoMovimiento).Div(decimal.NewFromInt(100))
}

func (m *MatchDetail) GetDiferenciaDecimal() decimal.Decimal {
	if m.DiferenciaMonto == nil {
		return decimal.Zero
	}
	return decimal.NewFromInt(*m.DiferenciaMonto).Div(decimal.NewFromInt(100))
}

type ReconciliationResult struct {
	RunID             uuid.UUID      `json:"run_id"`
	TotalFacturas     int            `json:"total_facturas"`
	TotalMovimientos  int            `json:"total_movimientos"`
	MatchesExactos    int            `json:"matches_exactos"`
	MatchesParciales  int            `json:"matches_parciales"`
	MontoTotalFacturado int64        `json:"monto_total_facturado"`
	MontoTotalPagado  int64          `json:"monto_total_pagado"`
	MontoTotalPendiente int64        `json:"monto_total_pendiente"`
	Detalles          []MatchDetail  `json:"detalles"`
}

func (r *ReconciliationResult) GetMontoTotalFacturadoDecimal() decimal.Decimal {
	return decimal.NewFromInt(r.MontoTotalFacturado).Div(decimal.NewFromInt(100))
}

func (r *ReconciliationResult) GetMontoTotalPagadoDecimal() decimal.Decimal {
	return decimal.NewFromInt(r.MontoTotalPagado).Div(decimal.NewFromInt(100))
}

func (r *ReconciliationResult) GetMontoTotalPendienteDecimal() decimal.Decimal {
	return decimal.NewFromInt(r.MontoTotalPendiente).Div(decimal.NewFromInt(100))
}

func (r *ReconciliationResult) GetPorcentajePagado() float64 {
	if r.MontoTotalFacturado == 0 {
		return 0
	}
	return float64(r.MontoTotalPagado) / float64(r.MontoTotalFacturado) * 100
}

type ReconciliationFilter struct {
	FechaDesde  *time.Time
	FechaHasta  *time.Time
	Status      string
	CreatedBy   *uuid.UUID
	Limit       int
	Offset      int
}

type ReconciliationListResponse struct {
	Runs   []ReconciliationRun `json:"runs"`
	Total  int                 `json:"total"`
	Limit  int                 `json:"limit"`
	Offset int                 `json:"offset"`
}

type RunRequest struct {
	CartolaRunID *uuid.UUID `json:"cartola_run_id,omitempty"`
	SIIRunID     *uuid.UUID `json:"sii_run_id,omitempty"`
}

type ReconciliationSummary struct {
	RunID                 uuid.UUID     `json:"run_id"`
	Fecha                 time.Time     `json:"fecha"`
	ArchivoCartola        string        `json:"archivo_cartola"`
	ArchivoSII            string        `json:"archivo_sii"`
	TotalFacturas         int           `json:"total_facturas"`
	TotalMovimientos      int           `json:"total_movimientos"`
	MatchesExactos        int           `json:"matches_exactos"`
	MatchesParciales      int           `json:"matches_parciales"`
	MontoTotalFacturado   decimal.Decimal `json:"monto_total_facturado"`
	MontoTotalPagado      decimal.Decimal `json:"monto_total_pagado"`
	MontoTotalPendiente   decimal.Decimal `json:"monto_total_pendiente"`
	PorcentajePagado      float64       `json:"porcentaje_pagado"`
	Status                string        `json:"status"`
	Detalles              []MatchDetail `json:"detalles"`
}