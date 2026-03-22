from pydantic import BaseModel
from typing import List, Optional

class HealthScoreInput(BaseModel):
    age: int
    monthly_income: float
    monthly_expenses: float
    emergency_fund_months: float
    has_term_insurance: bool
    term_cover_amount: float
    has_health_insurance: bool
    health_cover_amount: float
    monthly_sip: float
    equity_pct: float
    debt_pct: float
    gold_pct: float
    has_home_loan: bool
    emi_total: float
    invests_in_80c: bool
    invests_in_nps: bool
    has_health_insurance_80d: bool

class FirePlanInput(BaseModel):
    age: int
    monthly_income: float
    monthly_expenses: float
    current_savings: float
    monthly_sip: float
    existing_investments: Optional[str] = None
    target_retirement_age: int
    risk_appetite: str
    has_dependents: bool
    home_loan_emi: float = 0
    goals: list = []

class LifeEventInput(BaseModel):
    event_type: str
    amount: float = 0
    current_age: int
    net_worth: float = 0
    monthly_income: float = 0
    risk_appetite: str = "moderate"
    additional_context: Optional[str] = None
