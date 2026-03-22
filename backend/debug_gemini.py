import json
import requests
import sys

base_url = "http://127.0.0.1:8000/api"

try:
    print("Testing health-score...")
    r = requests.post(f"{base_url}/health-score", json={"age": 30, "monthly_income": 100000, "monthly_expenses": 50000, "emergency_fund_months": 3, "has_term_insurance": True, "term_cover_amount": 10000000, "has_health_insurance": True, "health_cover_amount": 500000, "monthly_sip": 20000, "equity_pct": 70, "debt_pct": 30, "gold_pct": 0, "has_home_loan": False, "emi_total": 0, "invests_in_80c": True, "invests_in_nps": False, "has_health_insurance_80d": True}, timeout=10)
    print("Status:", r.status_code)
    try:
        resp_json = r.json()
        print(json.dumps(resp_json, indent=2))
    except Exception as e:
        print("Response not JSON:", r.text[:200])
except Exception as e:
    print("Request failed:", e)

print("Done")
