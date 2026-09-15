package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type BankMovement struct {
	ID                   uuid.UUID  `json:"id" db:"id"`
	Fecha                time.Time  `json:"fecha" db:"fecha"`
	RUTContraparte       string     `json:"rut_contraparte" db:"rut_contraparte"`
	RUTContraparteClean  string     `json:"-" db:"rut_contraparte_clean"`
	Monto                int64      `json:"monto" db:"monto"`
	TipoMovimiento       string     `json:"tipo_movimiento" db:"tipo_movimiento"`
	Descripcion          string     `json:"descripcion" db:"descripcion"`
	NumeroDocumento      string     `json:"numero_documento" db:"numero_documento"`
	CodigoConcepto       string     `json:"codigo_concepto" db:"codigo_concepto"`
	BancoOrigen          string     `json:"banco_origen" db:"banco_origen"`
	Conciliado           bool       `json:"conciliado" db:"conciliado"`
	InvoiceID            *uuid.UUID `json:"invoice_id,omitempty" db:"invoice_id"`
	ReconciliationRunID  *uuid.UUID `json:"reconciliation_run_id,omitempty" db:"reconciliation_run_id"`
	CreatedAt            time.Time  `json:"created_at" db:"created_at"`
}

func (b *BankMovement) GetMontoDecimal() decimal.Decimal {
	return decimal.NewFromInt(b.Monto).Div(decimal.NewFromInt(100))
}

func (b *BankMovement) IsAbono() bool {
	return b.TipoMovimiento == "abono"
}

func (b *BankMovement) IsCargo() bool {
	return b.TipoMovimiento == "cargo"
}

func (b *BankMovement) GetMontoAbsDecimal() decimal.Decimal {
	d := b.GetMontoDecimal()
	if d.IsNegative() {
		return d.Neg()
	}
	return d
}

type BankMovementUpload struct {
	File       []byte
	FileName   string
	ContentType string
	BancoOrigen string
}

type BankMovementFilter struct {
	RUTContraparte   string
	FechaDesde       *time.Time
	FechaHasta       *time.Time
	TipoMovimiento   string
	Conciliado       *bool
	BancoOrigen      string
	ReconciliationRunID *uuid.UUID
	Limit            int
	Offset           int
}

type BankMovementListResponse struct {
	Movements []BankMovement `json:"movements"`
	Total     int            `json:"total"`
	Limit     int            `json:"limit"`
	Offset    int            `json:"offset"`
}

type BankMovementPreview struct {
	Headers []string         `json:"headers"`
	Rows    [][]string       `json:"rows"`
	Total   int              `json:"total"`
	Errors  []string         `json:"errors,omitempty"`
}