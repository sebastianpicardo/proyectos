package service

import (
	"bufio"
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/shopspring/decimal"
	"github.com/xuri/excelize/v2"
	"golang.org/x/text/encoding/charmap"
	"golang.org/x/text/transform"
)

type CSVParser struct{}

func NewCSVParser() *CSVParser {
	return &CSVParser{}
}

type ParsedRow struct {
	Fecha             time.Time
	RUT               string
	RUTClean          string
	Monto             int64
	TipoMovimiento    string
	Descripcion       string
	NumeroDocumento   string
	CodigoConcepto    string
	OriginalRow       map[string]string
	Errors            []string
}

type ParseResult struct {
	Headers []string
	Rows    []ParsedRow
	Errors  []string
	Total   int
}

func (p *CSVParser) DetectFormat(headers []string, bancoHint string) (string, models.CSVColumnMap) {
	headersLower := make([]string, len(headers))
	for i, h := range headers {
		headersLower[i] = strings.ToLower(strings.TrimSpace(h))
	}

	if bancoHint != "" {
		if fmt, ok := models.BankFormatMap[strings.ToLower(bancoHint)]; ok {
			return strings.ToLower(bancoHint), fmt
		}
	}

	for bankKey, fmt := range models.BankFormatMap {
		score := 0
		for _, h := range headersLower {
			if strings.Contains(h, strings.ToLower(fmt.Fecha)) {
				score++
			}
			if fmt.Cargo != "" && strings.Contains(h, strings.ToLower(fmt.Cargo)) {
				score++
			}
			if fmt.Abono != "" && strings.Contains(h, strings.ToLower(fmt.Abono)) {
				score++
			}
			if fmt.Monto != "" && strings.Contains(h, strings.ToLower(fmt.Monto)) {
				score++
			}
			if fmt.TipoMovimiento != "" && strings.Contains(h, strings.ToLower(fmt.TipoMovimiento)) {
				score++
			}
			if fmt.Descripcion != "" && strings.Contains(h, strings.ToLower(fmt.Descripcion)) {
				score++
			}
		}
		if score >= 3 {
			return bankKey, fmt
		}
	}

	return "generico", models.BankFormatMap["generico"]
}

func (p *CSVParser) ParseCartola(data []byte, bancoHint string) (*ParseResult, error) {
	reader, format, err := p.createReader(data, bancoHint)
	if err != nil {
		return nil, err
	}

	return p.parseWithFormat(reader, format, true)
}

func (p *CSVParser) ParseSII(data []byte) (*ParseResult, error) {
	format := models.SIIFormat
	reader, err := p.createReaderFromFormat(data, format)
	if err != nil {
		return nil, err
	}

	return p.parseSIIWithFormat(reader, format)
}

func (p *CSVParser) createReader(data []byte, bancoHint string) (*csv.Reader, models.CSVColumnMap, error) {
	var format models.CSVColumnMap
	var detectedBank string

	if strings.HasSuffix(strings.ToLower(bancoHint), ".xlsx") || strings.HasSuffix(strings.ToLower(bancoHint), ".xls") {
		return p.parseExcel(data, bancoHint)
	}

	decodedData, encodingUsed := p.detectAndDecode(data)
	
	sampleReader := csv.NewReader(bytes.NewReader(decodedData))
	sampleReader.Comma = ','
	sampleReader.LazyQuotes = true
	headers, err := sampleReader.Read()
	if err != nil {
		return nil, format, err
	}

	detectedBank, format = p.DetectFormat(headers, bancoHint)

	reader := csv.NewReader(bytes.NewReader(decodedData))
	reader.Comma = format.Separator
	reader.LazyQuotes = true
	reader.FieldsPerRecord = -1

	for i := 0; i < format.SkipRows; i++ {
		reader.Read()
	}

	return reader, format, nil
}

func (p *CSVParser) parseExcel(data []byte, bancoHint string) (*csv.Reader, models.CSVColumnMap, error) {
	f, err := excelize.OpenReader(bytes.NewReader(data))
	if err != nil {
		return nil, models.CSVColumnMap{}, err
	}
	defer f.Close()

	sheetName := f.GetSheetList()[0]
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, models.CSVColumnMap{}, err
	}

	if len(rows) == 0 {
		return nil, models.CSVColumnMap{}, fmt.Errorf("empty excel file")
	}

	format := models.BankFormatMap["generico"]
	if bancoHint != "" {
		if fmt, ok := models.BankFormatMap[strings.ToLower(bancoHint)]; ok {
			format = fmt
		}
	}

	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)
	writer.Comma = format.Separator
	for _, row := range rows {
		writer.Write(row)
	}
	writer.Flush()

	reader := csv.NewReader(&buf)
	reader.Comma = format.Separator
	reader.LazyQuotes = true
	reader.FieldsPerRecord = -1

	for i := 0; i < format.SkipRows; i++ {
		reader.Read()
	}

	return reader, format, nil
}

func (p *CSVParser) detectAndDecode(data []byte) ([]byte, string) {
	if len(data) == 0 {
		return data, "utf-8"
	}

	isLatin1 := false
	for i := 0; i < min(len(data), 1000); i++ {
		if data[i] >= 0x80 && data[i] <= 0xFF {
			isLatin1 = true
			break
		}
	}

	if isLatin1 {
		reader := charmap.ISO8859_1.NewDecoder()
		decoded, _ := io.ReadAll(transform.NewReader(bytes.NewReader(data), reader))
		return decoded, "latin1"
	}

	return data, "utf-8"
}

func (p *CSVParser) createReaderFromFormat(data []byte, format models.SIIColumnMap) (*csv.Reader, error) {
	decodedData, _ := p.detectAndDecode(data)
	
	reader := csv.NewReader(bytes.NewReader(decodedData))
	reader.Comma = format.Separator
	reader.LazyQuotes = true
	reader.FieldsPerRecord = -1

	for i := 0; i < format.SkipRows; i++ {
		reader.Read()
	}

	return reader, nil
}

func (p *CSVParser) parseWithFormat(reader *csv.Reader, format models.CSVColumnMap, isCartola bool) (*ParseResult, error) {
	headers, err := reader.Read()
	if err != nil {
		return nil, err
	}

	headerMap := make(map[string]int)
	for i, h := range headers {
		headerMap[strings.ToLower(strings.TrimSpace(h))] = i
	}

	getCol := func(names ...string) (int, bool) {
		for _, n := range names {
			if idx, ok := headerMap[strings.ToLower(strings.TrimSpace(n))]; ok {
				return idx, true
			}
		}
		return -1, false
	}

	fechaIdx, _ := getCol(format.Fecha)
	rutIdx, _ := getCol(format.RUT)
	montoIdx, _ := getCol(format.Monto)
	tipoIdx, _ := getCol(format.TipoMovimiento)
	cargoIdx, _ := getCol(format.Cargo)
	abonoIdx, _ := getCol(format.Abono)
	descIdx, _ := getCol(format.Descripcion)
	docIdx, _ := getCol(format.NumeroDocumento)
	conceptoIdx, _ := getCol(format.CodigoConcepto)

	var rows []ParsedRow
	var errors []string
	rowNum := 1

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: %v", rowNum, err))
			rowNum++
			continue
		}

		parsed := ParsedRow{OriginalRow: make(map[string]string)}
		for i, h := range headers {
			if i < len(record) {
				parsed.OriginalRow[h] = record[i]
			}
		}

		if fechaIdx >= 0 && fechaIdx < len(record) {
			parsed.Fecha, _ = p.parseDate(record[fechaIdx], format.DateFormat)
		}

		if rutIdx >= 0 && rutIdx < len(record) {
			parsed.RUT = strings.TrimSpace(record[rutIdx])
			parsed.RUTClean = cleanRUT(parsed.RUT)
		}

		if isCartola {
			if cargoIdx >= 0 && cargoIdx < len(record) && strings.TrimSpace(record[cargoIdx]) != "" {
				parsed.Monto, _ = p.parseMonto(record[cargoIdx])
				parsed.Monto = -parsed.Monto
				parsed.TipoMovimiento = "cargo"
			} else if abonoIdx >= 0 && abonoIdx < len(record) && strings.TrimSpace(record[abonoIdx]) != "" {
				parsed.Monto, _ = p.parseMonto(record[abonoIdx])
				parsed.TipoMovimiento = "abono"
			} else if montoIdx >= 0 && montoIdx < len(record) {
				parsed.Monto, _ = p.parseMonto(record[montoIdx])
				if tipoIdx >= 0 && tipoIdx < len(record) {
					tipo := strings.ToLower(strings.TrimSpace(record[tipoIdx]))
					if strings.Contains(tipo, "cargo") || strings.Contains(tipo, "debito") || strings.Contains(tipo, "débito") {
						parsed.Monto = -parsed.Monto
						parsed.TipoMovimiento = "cargo"
					} else {
						parsed.TipoMovimiento = "abono"
					}
				} else if parsed.Monto < 0 {
					parsed.TipoMovimiento = "cargo"
				} else {
					parsed.TipoMovimiento = "abono"
				}
			}
		}

		if descIdx >= 0 && descIdx < len(record) {
			parsed.Descripcion = strings.TrimSpace(record[descIdx])
		}

		if docIdx >= 0 && docIdx < len(record) {
			parsed.NumeroDocumento = strings.TrimSpace(record[docIdx])
		}

		if conceptoIdx >= 0 && conceptoIdx < len(record) {
			parsed.CodigoConcepto = strings.TrimSpace(record[conceptoIdx])
		}

		if parsed.Fecha.IsZero() {
			parsed.Errors = append(parsed.Errors, "invalid date")
		}
		if parsed.Monto == 0 {
			parsed.Errors = append(parsed.Errors, "invalid amount")
		}

		rows = append(rows, parsed)
		rowNum++
	}

	return &ParseResult{
		Headers: headers,
		Rows:    rows,
		Errors:  errors,
		Total:   len(rows),
	}, nil
}

func (p *CSVParser) parseSIIWithFormat(reader *csv.Reader, format models.SIIColumnMap) (*ParseResult, error) {
	headers, err := reader.Read()
	if err != nil {
		return nil, err
	}

	headerMap := make(map[string]int)
	for i, h := range headers {
		headerMap[strings.ToLower(strings.TrimSpace(h))] = i
	}

	getCol := func(name string) (int, bool) {
		idx, ok := headerMap[strings.ToLower(strings.TrimSpace(name))]
		return idx, ok
	}

	cols := struct {
		tipoDoc, folio, rut, fecha, montoNeto, montoIVA, montoTotal, anulado, tipoImpuesto, tasaImpuesto, razonSocial int
	}{
		tipoDoc: getColOr(format.TipoDoc, headerMap),
		folio:   getColOr(format.Folio, headerMap),
		rut:     getColOr(format.RUTContraparte, headerMap),
		fecha:   getColOr(format.FechaEmision, headerMap),
		montoNeto: getColOr(format.MontoNeto, headerMap),
		montoIVA: getColOr(format.MontoIVA, headerMap),
		montoTotal: getColOr(format.MontoTotal, headerMap),
		anulado: getColOr(format.Anulado, headerMap),
		tipoImpuesto: getColOr(format.TipoImpuesto, headerMap),
		tasaImpuesto: getColOr(format.TasaImpuesto, headerMap),
		razonSocial: getColOr(format.RazonSocial, headerMap),
	}

	var rows []ParsedRow
	var errors []string
	rowNum := 1

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			errors = append(errors, fmt.Sprintf("Row %d: %v", rowNum, err))
			rowNum++
			continue
		}

		if cols.anulado >= 0 && cols.anulado < len(record) && strings.TrimSpace(strings.ToUpper(record[cols.anulado])) == "A" {
			rowNum++
			continue
		}

		parsed := ParsedRow{OriginalRow: make(map[string]string)}
		for i, h := range headers {
			if i < len(record) {
				parsed.OriginalRow[h] = record[i]
			}
		}

		if cols.fecha >= 0 && cols.fecha < len(record) {
			parsed.Fecha, _ = p.parseDate(record[cols.fecha], "02-01-2006")
		}

		if cols.rut >= 0 && cols.rut < len(record) {
			parsed.RUT = strings.TrimSpace(record[cols.rut])
			parsed.RUTClean = cleanRUT(parsed.RUT)
		}

		if cols.montoTotal >= 0 && cols.montoTotal < len(record) {
			parsed.Monto, _ = p.parseMonto(record[cols.montoTotal])
		}

		if cols.razonSocial >= 0 && cols.razonSocial < len(record) {
			parsed.Descripcion = strings.TrimSpace(record[cols.razonSocial])
		}

		if cols.folio >= 0 && cols.folio < len(record) {
			parsed.NumeroDocumento = strings.TrimSpace(record[cols.folio])
		}

		rows = append(rows, parsed)
		rowNum++
	}

	return &ParseResult{
		Headers: headers,
		Rows:    rows,
		Errors:  errors,
		Total:   len(rows),
	}, nil
}

func getColOr(name string, headerMap map[string]int) int {
	if idx, ok := headerMap[strings.ToLower(strings.TrimSpace(name))]; ok {
		return idx
	}
	return -1
}

func (p *CSVParser) parseDate(dateStr, format string) (time.Time, error) {
	dateStr = strings.TrimSpace(dateStr)
	if dateStr == "" {
		return time.Time{}, fmt.Errorf("empty date")
	}

	formats := []string{format, "02-01-2006", "2006-01-02", "02/01/2006", "2006/01/02", "02.01.2006", "20060102"}
	for _, f := range formats {
		if t, err := time.Parse(f, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}

func (p *CSVParser) parseMonto(montoStr string) (int64, error) {
	montoStr = strings.TrimSpace(montoStr)
	montoStr = strings.ReplaceAll(montoStr, ".", "")
	montoStr = strings.ReplaceAll(montoStr, ",", ".")
	montoStr = regexp.MustCompile(`[^\d.\-]`).ReplaceAllString(montoStr, "")

	d, err := decimal.NewFromString(montoStr)
	if err != nil {
		return 0, err
	}

	return d.Mul(decimal.NewFromInt(100)).IntPart(), nil
}

func cleanRUT(rut string) string {
	rut = strings.ToUpper(strings.TrimSpace(rut))
	rut = regexp.MustCompile(`[^0-9K]`).ReplaceAllString(rut, "")
	if len(rut) > 1 {
		rut = rut[:len(rut)-1]
	}
	return rut
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}