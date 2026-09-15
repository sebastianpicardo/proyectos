package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Invoice struct {
	ID              uuid.UUID       `json:"id" db:"id"`
	RUTEmisor       string          `json:"rut_emisor" db:"rut_emisor"`
	RUTEmisorClean  string          `json:"-" db:"rut_emisor_clean"`
	Folio           string          `json:"folio" db:"folio"`
	FechaEmision    time.Time       `json:"fecha_emision" db:"fecha_emision"`
	MontoNeto       int64           `json:"monto_neto" db:"monto_neto"`
	MontoIVA        int64           `json:"monto_iva" db:"monto_iva"`
	MontoTotal      int64           `json:"monto_total" db:"monto_total"`
	TipoDoc         string          `json:"tipo_doc" db:"tipo_doc"`
	Estado          string          `json:"estado" db:"estado"`
	MontoPagado     int64           `json:"monto_pagado" db:"monto_pagado"`
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at" db:"updated_at"`
}

func (i *Invoice) GetMontoTotalDecimal() decimal.Decimal {
	return decimal.NewFromInt(i.MontoTotal).Div(decimal.NewFromInt(100))
}

func (i *Invoice) GetMontoNetoDecimal() decimal.Decimal {
	return decimal.NewFromInt(i.MontoNeto).Div(decimal.NewFromInt(100))
}

func (i *Invoice) GetMontoIVADecimal() decimal.Decimal {
	return decimal.NewFromInt(i.MontoIVA).Div(decimal.NewFromInt(100))
}

func (i *Invoice) GetMontoPagadoDecimal() decimal.Decimal {
	return decimal.NewFromInt(i.MontoPagado).Div(decimal.NewFromInt(100))
}

func (i *Invoice) GetMontoPendienteDecimal() decimal.Decimal {
	return i.GetMontoTotalDecimal().Sub(i.GetMontoPagadoDecimal())
}

func (i *Invoice) IsFullyPaid() bool {
	return i.MontoPagado >= i.MontoTotal
}

func (i *Invoice) IsPartiallyPaid() bool {
	return i.MontoPagado > 0 && i.MontoPagado < i.MontoTotal
}

type InvoiceUpload struct {
	File       []byte
	FileName   string
	ContentType string
}

type InvoiceFilter struct {
	RUTEmisor   string
	FechaDesde  *time.Time
	FechaHasta  *time.Time
	Estado      string
	TipoDoc     string
	Limit       int
	Offset      int
}

type InvoiceListResponse struct {
	Invoices []Invoice `json:"invoices"`
	Total    int       `json:"total"`
	Limit    int       `json:"limit"`
	Offset   int       `json:"offset"`
}