import pprint
import requests
import json
import time
from threading import Thread
import uvicorn
from main import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="warning")

server_thread = Thread(target=run_server, daemon=True)
server_thread.start()

time.sleep(3) # Wait for server to boot

base_url = "http://127.0.0.1:8001/api"

endpoints = [
  ("GET", f"{base_url}/health", None, None),
  ("POST", f"{base_url}/health-score", {"age": 30, "monthly_income": 100000, "monthly_expenses": 50000, "emergency_fund_months": 3, "has_term_insurance": True, "term_cover_amount": 10000000, "has_health_insurance": True, "health_cover_amount": 500000, "monthly_sip": 20000, "equity_pct": 70, "debt_pct": 30, "gold_pct": 0, "has_home_loan": False, "emi_total": 0, "invests_in_80c": True, "invests_in_nps": False, "has_health_insurance_80d": True}, None),
  ("POST", f"{base_url}/portfolio-xray", None, {"manual_data": "Axis Bluechip Fund - Direct Plan - Growth, Total Invested Amount: 50,000.00, SBI Small Cap Fund"}),
  ("POST", f"{base_url}/fire-plan", {"age": 30, "monthly_income": 100000, "monthly_expenses": 50000, "current_savings": 500000, "monthly_sip": 20000, "target_retirement_age": 45, "risk_appetite": "moderate", "has_dependents": False, "home_loan_emi": 0, "goals": []}, None),
  ("POST", f"{base_url}/tax-wizard", None, {"manual_data": "{\"gross_salary\": 1800000, \"section_80c\": 150000}"}),
  ("POST", f"{base_url}/life-event", {"event_type": "bonus", "amount": 100000, "current_age": 30, "net_worth": 500000, "monthly_income": 100000, "risk_appetite": "moderate"}, None),
]

with open("test_results_local.txt", "w", encoding="utf-8") as file:
    for method, url, json_data, form_data in endpoints:
        file.write(f"\n--- Testing {url} ---\n")
        try:
            if method == "GET": 
                r = requests.get(url, timeout=10)
            else: 
                r = requests.post(url, json=json_data, data=form_data, timeout=15)
            
            file.write(f"Status: {r.status_code}\n")
            try:
                resp_json = r.json()
                file.write(json.dumps(resp_json, indent=2))
                file.write("\n")
            except Exception as json_e:
                file.write(f"Response (Not JSON): {r.text[:500]}\n")
        except Exception as e:
            file.write(f"Request failed: {e}\n")
        file.flush()

print("Testing complete on 8001. Check test_results_local.txt.")
