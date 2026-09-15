package models

import (
	"regexp"
	"strings"
)

type CSVColumnMap struct {
	Fecha            string
	RUT              string
	Monto            string
	TipoMovimiento   string
	Cargo            string
	Abono            string
	Descripcion      string
	NumeroDocumento  string
	CodigoConcepto   string
	Saldo            string
	SkipRows         int
	Separator        rune
	Encoding         string
	DateFormat       string
	HasHeader        bool
}

var BankFormatMap = map[string]CSVColumnMap{
	"bancoestado": {
		Fecha:           "Fecha",
		Cargo:           "D\u00e9bito",
		Abono:           "Cr\u00e9dito",
		Descripcion:     "Descripci\u00f3n",
		NumeroDocumento: "N\u00b0 Documento",
		CodigoConcepto:  "C\u00f3digo Concepto",
		SkipRows:        0,
		Separator:       ';',
		Encoding:        "latin1",
		DateFormat:      "02-01-2006",
		HasHeader:       true,
	},
	"banco_chile": {
		Fecha:            "Fecha",
		TipoMovimiento:   "Tipo Movimiento",
		Monto:            "Monto",
		Descripcion:      "Descripci\u00f3n",
		NumeroDocumento:  "N\u00b0 Documento",
		SkipRows:         0,
		Separator:        ';',
		Encoding:        "utf-8",
		DateFormat:       "02-01-2006",
		HasHeader:        true,
	},
	"santander": {
		Fecha:           "Fecha",
		Cargo:           "Cargo",
		Abono:           "Abono",
		Descripcion:     "Concepto",
		NumeroDocumento: "Referencia",
		SkipRows:        2,
		Separator:       ',',
		Encoding:        "utf-8",
		DateFormat:      "02-01-2006",
		HasHeader:       true,
	},
	"scotiabank": {
		Fecha:       "Fecha",
		Cargo:       "Cargo",
		Abono:       "Abono",
		Descripcion: "Descripci\u00f3n",
		SkipRows:    0,
		Separator:   ',',
		Encoding:    "utf-8",
		DateFormat:  "02-01-2006",
		HasHeader:   true,
	},
	"bci": {
		Fecha:            "Fecha",
		Monto:            "Importe",
		Descripcion:      "Descripci\u00f3n",
		NumeroDocumento:  "Referencia",
		SkipRows:         0,
		Separator:        ',',
		Encoding:        "utf-8",
		DateFormat:       "02-01-2006",
		HasHeader:        true,
	},
	"generico": {
		Fecha:            "Fecha",
		Monto:            "Monto",
		TipoMovimiento:   "Tipo",
		Descripcion:      "Descripci\u00f3n",
		NumeroDocumento:  "Documento",
		SkipRows:         0,
		Separator:        ',',
		Encoding:        "utf-8",
		DateFormat:       "02-01-2006",
		HasHeader:        true,
	},
}

type SIIColumnMap struct {
	TipoDoc        string
	Folio          string
	RUTContraparte string
	TasaImpuesto   string
	RazonSocial    string
	TipoImpuesto   string
	FechaEmision   string
	Anulado        string
	MontoExento    string
	MontoNeto      string
	MontoIVA       string
	CodIVANoRec    string
	MontoIVANoRec  string
	IVAUsoComun    string
	CodOtroImp     string
	TasaOtroImp    string
	MontoOtroImp   string
	MontoTotal     string
	MontoOtroImpNC string
	MontoActivoFijo string
	MontoIVAActivoFijo string
	IVANoRetenido  string
	TabacosPurosc   string
	TabacosCigarrillos string
	TabacosElaborados string
	ImpuestoVehiculos string
	CodigoSucursal string
	NumeroInterno  string
	EmisorReceptor string
	Separator      rune
	Encoding       string
	SkipRows       int
}

var SIIFormat = SIIColumnMap{
	TipoDoc:        "Tipo Doc",
	Folio:          "Folio",
	RUTContraparte: "Rut Contraparte",
	TasaImpuesto:   "Tasa Impuesto",
	RazonSocial:    "Raz\u00f3n Social Contraparte",
	TipoImpuesto:   "Tipo Impuesto[1=IVA:2=LEY 18211]",
	FechaEmision:   "Fecha Emisi\u00f3n",
	Anulado:        "Anulado[A]",
	MontoExento:    "Monto Exento",
	MontoNeto:      "Monto Neto",
	MontoIVA:       "Monto IVA (Recuperable)",
	CodIVANoRec:    "Cod IVA no Rec",
	MontoIVANoRec:  "Monto IVA no Rec",
	IVAUsoComun:    "IVA Uso Com\u00fan",
	CodOtroImp:     "Cod Otro Imp (Con Cr\u00e9dito)",
	TasaOtroImp:    "Tasa Otro Imp (Con Cr\u00e9dito)",
	MontoOtroImp:   "Monto Otro Imp (Con Cr\u00e9dito)",
	MontoTotal:     "Monto Total",
	MontoOtroImpNC: "Monto Otro Imp Sin Cr\u00e9dito",
	MontoActivoFijo: "Monto Activo Fijo",
	MontoIVAActivoFijo: "Monto IVA Activo Fijo",
	IVANoRetenido:  "IVA No Retenido",
	TabacosPurosc:  "Tabacos - Puros",
	TabacosCigarrillos: "Tabacos - Cigarrillos",
	TabacosElaborados: "Tabacos - Elaborados",
	ImpuestoVehiculos: "Impuesto a Veh\u00edculos Autom\u00f3viles",
	CodigoSucursal: "C\u00f3digo sucursal SII",
	NumeroInterno:  "Numero Interno",
	EmisorReceptor: "Emisor/Receptor",
	Separator:      ';',
	Encoding:       "utf-8",
	SkipRows:       0,
}

func CleanRUT(rut string) string {
	rut = strings.ToUpper(strings.TrimSpace(rut))
	rut = regexp.MustCompile(`[^0-9K]`).ReplaceAllString(rut, "")
	if len(rut) > 1 {
		rut = rut[:len(rut)-1]
	}
	return rut
}

func RUTClean(rut string) string {
	result := ""
	for _, c := range rut {
		if c >= '0' && c <= '9' {
			result += string(c)
		}
	}
	if len(result) > 1 {
		result = result[:len(result)-1]
	}
	return result
}

func IsValidRUT(rut string) bool {
	rut = CleanRUT(rut)
	if len(rut) < 2 {
		return false
	}
	dv := rut[len(rut)-1]
	num := rut[:len(rut)-1]
	suma := 0
	multiplo := 2
	for i := len(num) - 1; i >= 0; i-- {
		n := int(num[i] - '0')
		suma += n * multiplo
		multiplo++
		if multiplo > 7 {
			multiplo = 2
		}
	}
	resto := suma % 11
	dvEsperado := 11 - resto
	if dvEsperado == 11 {
		return dv == '0'
	} else if dvEsperado == 10 {
		return dv == 'K'
	} else {
		return string(dv) == string(rune(dvEsperado+48))
	}
}

func (m *CSVColumnMap) ValidateRUT(rut string) bool {
	return IsValidRUT(rut)
}