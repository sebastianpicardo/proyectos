package models

import (
	"encoding/json"
	"time"
)

type User struct {
	ID            string     `json:"id"`
	Email         string     `json:"email"`
	PasswordHash  string     `json:"-"`
	Name          string     `json:"name"`
	Avatar        string     `json:"avatar,omitempty"`
	Provider      string     `json:"provider"`
	GoogleID      string     `json:"google_id,omitempty"`
	IsSuperAdmin  bool       `json:"is_super_admin"`
	IsActive      bool       `json:"is_active"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type Profile struct {
	ID                 string     `json:"id"`
	UserID             string     `json:"user_id"`
	CompanyName        string     `json:"company_name,omitempty"`
	RUT                string     `json:"rut,omitempty"`
	Address            string     `json:"address,omitempty"`
	Phone              string     `json:"phone,omitempty"`
	PlanID             string     `json:"plan_id,omitempty"`
	PlanStatus         string     `json:"plan_status"`
	OnboardingCompleted bool      `json:"onboarding_completed"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

type Plan struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description,omitempty"`
	PriceMonthly int       `json:"price_monthly"` // in cents
	PriceYearly  int       `json:"price_yearly"`  // in cents
	Features    []string   `json:"features"`
	Limits      PlanLimits `json:"limits"`
	IsActive    bool       `json:"is_active"`
	SortOrder   int        `json:"sort_order"`
	CreatedAt   time.Time  `json:"created_at"`
}

type PlanLimits struct {
	MaxConciliationsPerMonth int `json:"max_conciliations_per_month"`
	MaxInvoicesPerMonth      int `json:"max_invoices_per_month"`
	MaxClients               int `json:"max_clients"`
	APIAccess                bool `json:"api_access"`
	PrioritySupport          bool `json:"priority_support"`
}

type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	TokenHash string    `json:"-"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

type CaptchaAttempt struct {
	ID        string    `json:"id"`
	IPAddress string    `json:"ip_address"`
	Success   bool      `json:"success"`
	CreatedAt time.Time `json:"created_at"`
}

// Dummy plans for the plans page
func GetDummyPlans() []Plan {
	return []Plan{
		{
			ID:           "plan-starter",
			Name:         "Starter",
			Description:  "Ideal para emprendedores y pequeñas empresas",
			PriceMonthly: 29900,  // $29.900 CLP
			PriceYearly:  299000, // $299.000 CLP (2 meses gratis)
			Features: []string{
				"Hasta 50 conciliaciones/mes",
				"Hasta 200 facturas/mes",
				"Hasta 50 clientes",
				"Subida manual CSV/Excel",
				"Reporte básico PDF",
				"Soporte por email (48h)",
			},
			Limits: PlanLimits{
				MaxConciliationsPerMonth: 50,
				MaxInvoicesPerMonth:      200,
				MaxClients:               50,
				APIAccess:                false,
				PrioritySupport:          false,
			},
			IsActive:  true,
			SortOrder: 1,
		},
		{
			ID:           "plan-professional",
			Name:         "Professional",
			Description:  "Para empresas en crecimiento con mayor volumen",
			PriceMonthly: 79900,  // $79.900 CLP
			PriceYearly:  799000, // $799.000 CLP
			Features: []string{
				"Hasta 200 conciliaciones/mes",
				"Hasta 1.000 facturas/mes",
				"Hasta 200 clientes",
				"Subida automática bancaria",
				"Conciliación automática IA",
				"Reportes avanzados + Excel",
				"Soporte prioritario email (24h)",
				"Alertas de morosidad automáticas",
			},
			Limits: PlanLimits{
				MaxConciliationsPerMonth: 200,
				MaxInvoicesPerMonth:      1000,
				MaxClients:               200,
				APIAccess:                false,
				PrioritySupport:          true,
			},
			IsActive:  true,
			SortOrder: 2,
		},
		{
			ID:           "plan-enterprise",
			Name:         "Enterprise",
			Description:  "Para grandes organizaciones con necesidades críticas",
			PriceMonthly: 199900,  // $199.900 CLP
			PriceYearly:  1999000, // $1.999.000 CLP
			Features: []string{
				"Conciliaciones ilimitadas",
				"Facturas ilimitadas",
				"Clientes ilimitados",
				"API REST completa + Webhooks",
				"Integración ERP/Contable",
				"SSO / SAML / LDAP",
				"Auditoría completa",
				"Soporte 24/7 dedicado",
				"SLA 99.9%",
				"Infraestructura dedicada",
			},
			Limits: PlanLimits{
				MaxConciliationsPerMonth: -1, // unlimited
				MaxInvoicesPerMonth:      -1,
				MaxClients:               -1,
				APIAccess:                true,
				PrioritySupport:          true,
			},
			IsActive:  true,
			SortOrder: 3,
		},
	}
}

// MarshalFeatures converts features slice to JSON string for DB
func (p *Plan) MarshalFeatures() string {
	data, _ := json.Marshal(p.Features)
	return string(data)
}

// UnmarshalFeatures converts JSON string to features slice
func (p *Plan) UnmarshalFeatures(data string) error {
	return json.Unmarshal([]byte(data), &p.Features)
}

// MarshalLimits converts limits to JSON string for DB
func (p *Plan) MarshalLimits() string {
	data, _ := json.Marshal(p.Limits)
	return string(data)
}

// UnmarshalLimits converts JSON string to limits struct
func (p *Plan) UnmarshalLimits(data string) error {
	return json.Unmarshal([]byte(data), &p.Limits)
}