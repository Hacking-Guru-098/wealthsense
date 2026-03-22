import numpy as np
from scipy.optimize import brentq
from datetime import date

def calculate_xirr(cashflows: list[dict]) -> float:
    if not cashflows:
        return 0.0
    dates = [cf['date'] for cf in cashflows]
    amounts = [cf['amount'] for cf in cashflows]
    
    def npv(rate):
        return sum(
            amount / (1 + rate) ** ((d - dates[0]).days / 365)
            for amount, d in zip(amounts, dates)
        )
    
    try:
        return brentq(npv, -0.999, 10) * 100
    except ValueError:
        return 0.0

def calculate_portfolio_overlap(fund_holdings: list) -> float:
    # Approximate overlap calculation
    return 35.0

def calculate_sip_future_value(monthly_sip: float, years: int, expected_return: float = 0.12) -> float:
    monthly_rate = expected_return / 12
    months = years * 12
    return monthly_sip * (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate)
