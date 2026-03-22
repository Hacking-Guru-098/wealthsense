import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", "dummy"))
model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})

HEALTH_SCORE_PROMPT = """
You are an expert Indian financial advisor. Analyze the following answers and generate a financial health score.

User answers: {answers}

Calculate a score from 0-100 across exactly these 6 dimensions:
1. emergency_fund: Does the user have 6 months of expenses saved?
2. insurance: Adequate life + health insurance coverage?
3. investment_diversification: Are investments spread across equity, debt, gold?
4. debt_health: Is debt manageable (EMIs < 40% of income)?
5. tax_efficiency: Using 80C, 80D, HRA, NPS benefits?
6. retirement_readiness: On track for retirement corpus?

Rules:
- Each dimension score: 0-100
- Overall score: weighted average
- Weights: emergency_fund:20, insurance:20, investment_diversification:15, debt_health:15, tax_efficiency:15, retirement_readiness:15
- For each dimension give: score, status (critical/poor/fair/good/excellent), one_line_insight (specific, not generic), top_action (concrete next step with INR amounts where possible)

Respond ONLY with a valid JSON object. No explanation, no markdown, no code blocks. Raw JSON only.

Return this exact structure:
{
  "overall_score": 72,
  "grade": "B",
  "headline": "Your finances are stable but retirement planning needs urgent attention",
  "dimensions": {
    "emergency_fund": {"score": 80, "status": "good", "one_line_insight": "...", "top_action": "..."},
    "insurance": {"score": 40, "status": "poor", "one_line_insight": "...", "top_action": "..."},
    "investment_diversification": {"score": 65, "status": "fair", "one_line_insight": "...", "top_action": "..."},
    "debt_health": {"score": 90, "status": "excellent", "one_line_insight": "...", "top_action": "..."},
    "tax_efficiency": {"score": 70, "status": "fair", "one_line_insight": "...", "top_action": "..."},
    "retirement_readiness": {"score": 50, "status": "poor", "one_line_insight": "...", "top_action": "..."}
  },
  "top_3_priorities": ["...", "...", "..."],
  "personalized_message": "2-3 sentence warm, encouraging message addressing their specific situation"
}
"""

PORTFOLIO_XRAY_PROMPT = """
You are an expert Indian mutual fund analyst. Analyze this parsed CAMS statement data.

Portfolio data: {portfolio_data}
Calculated XIRR: {xirr}%
Calculated overlap score: {overlap}%

Provide a complete portfolio health analysis for an Indian retail investor.

Rules:
- Be specific with fund names from the data
- Calculate expense ratio drag vs category average
- Identify funds with >40% overlap (likely duplication)
- Rebalancing plan must have specific actions with INR amounts
- Benchmark comparison: use Nifty 50 TRI as equity benchmark

Respond ONLY with a valid JSON object. No explanation, no markdown, no code blocks. Raw JSON only.

Return this exact structure:
{
  "xirr": 14.2,
  "benchmark_xirr": 12.1,
  "alpha": 2.1,
  "total_invested": 450000,
  "current_value": 612000,
  "absolute_return_pct": 36,
  "portfolio_health_score": 72,
  "funds": [
    {
      "name": "...",
      "category": "Large Cap",
      "invested": 100000,
      "current_value": 138000,
      "xirr": 16.2,
      "expense_ratio": 1.2,
      "overlap_with": ["Fund B", "Fund C"],
      "recommendation": "hold/sell/reduce"
    }
  ],
  "issues": [
    {"type": "overlap", "severity": "high", "description": "...", "action": "..."},
    {"type": "expense_drag", "severity": "medium", "description": "...", "action": "..."}
  ],
  "rebalancing_plan": [
    {"action": "sell", "fund": "...", "amount": 50000, "reason": "...", "move_to": "..."},
    {"action": "increase_sip", "fund": "...", "from": 5000, "to": 8000, "reason": "..."}
  ],
  "summary": "2-3 sentence plain English summary of portfolio health"
}
"""

FIRE_PLANNER_PROMPT = """
You are an expert Indian financial planner specializing in FIRE (Financial Independence, Retire Early).
User profile: {profile}
Create a detailed month-by-month financial roadmap for the next 12 months, then yearly milestones to retirement.
Rules:
- All amounts in INR
- Use Indian investment instruments: PPF, NPS, ELSS, index funds, term insurance
- Account for Indian tax rules (80C limit ₹1.5L, NPS 80CCD ₹50K extra, etc.)
- SIP recommendations must be specific funds/categories
- Emergency fund target: 6x monthly expenses
- Retirement corpus formula: 25x annual expenses (4% withdrawal rule)
- Factor in inflation at 6% for India

Respond ONLY with a valid JSON object. No explanation.
Return this exact structure:
{
  "retirement_age": 45, "years_to_fire": 18, "monthly_surplus": 35000, "retirement_corpus_needed": 4, "corpus_unit": "crores",
  "current_trajectory_corpus": 1.8, "gap": 2.2, "monthly_sip_needed": 42000, "current_sip": 15000, "sip_gap": 27000,
  "immediate_actions": [ {"month": 1, "action": "...", "amount": 0, "category": "insurance/investment/debt/emergency"} ],
  "sip_allocation": [ {"instrument": "Nifty 50 Index Fund", "monthly_amount": 15000, "goal": "retirement", "reason": "..."} ],
  "yearly_milestones": [ {"year": 1, "corpus_target": 600000, "key_milestone": "Emergency fund complete"} ],
  "insurance_gaps": [ {"type": "term life", "recommended_cover": 10000000, "current_cover": 0, "action": "Buy ₹1 crore term plan immediately"} ],
  "fire_summary": "3-4 sentence encouraging summary of their FIRE journey"
}
"""

TAX_WIZARD_PROMPT = """
You are an elite Indian tax optimizer. 
User Income Data: {tax_data}
Calculate their tax liability under both the Old Regime and New Regime (latest laws). 
Identify missing Section 80C, 80D, 80CCD, 24(b), and HRA exemptions they could exploit.

Return this exact structure ONLY as JSON:
{
  "gross_salary": 1800000, "old_regime_tax": 240000, "new_regime_tax": 190000, "recommended_regime": "New Regime",
  "total_extra_savings_possible": 50000,
  "missed_deductions": [ {"section": "80D Health Insurance", "amount_missed": 25000, "potential_tax_saved": 7500, "action": "Buy medical insurance"} ],
  "salary_restructuring": [ {"component": "Food Coupons", "suggested_amount": 26400, "reason": "Tax free up to 50/meal/day"} ],
  "tax_summary": "Your structural tax analysis..."
}
"""

LIFE_EVENT_PROMPT = """
You are an elite financial advisor handling a client's major life transition.
Event Data: {event_data}
Provide an actionable financial blueprint for this event.

Return this exact structure ONLY as JSON:
{
  "event_type": "bonus", "event_summary": "Congrats on the bonus! Here is how to deploy it wisely...",
  "timeline": [ {"week": 1, "step": "Clear standing credit card debt", "priority": "high"} ],
  "allocation": [ {"category": "Debt Payoff", "amount": 50000, "percentage": 20}, {"category": "Investments", "amount": 200000, "percentage": 80} ],
  "what_not_to_do": [ {"mistake": "Don't upgrade your car just yet", "reason": "Lifestyle creep will kill this windfall."} ],
  "long_term_impact": { "corpus_added_in_10_years": 800000, "description": "If invested at 12%, this will grow massively." }
}
"""

def generate_health_score(answers: dict) -> dict:
    try:
        response = model.generate_content(HEALTH_SCORE_PROMPT.replace("{answers}", json.dumps(answers, indent=2)))
        content = response.text.strip()
        if content.startswith("```json"): content = content[7:-3].strip()
        elif content.startswith("```"): content = content[3:-3].strip()
        return json.loads(content)
    except Exception as e:
        return {"error": True, "message": str(e), "fallback": True}

def analyze_portfolio(portfolio_data: dict, xirr: float, overlap: float) -> dict:
    try:
        response = model.generate_content(PORTFOLIO_XRAY_PROMPT.replace(
            "{portfolio_data}", json.dumps(portfolio_data, indent=2)
        ).replace("{xirr}", str(xirr)).replace("{overlap}", str(overlap)))
        content = response.text.strip()
        if content.startswith("```json"): content = content[7:-3].strip()
        elif content.startswith("```"): content = content[3:-3].strip()
        return json.loads(content)
    except Exception as e:
        return {"error": True, "message": str(e), "fallback": True}

def generate_fire_plan(profile: dict) -> dict:
    try:
        response = model.generate_content(FIRE_PLANNER_PROMPT.replace("{profile}", json.dumps(profile, indent=2)))
        content = response.text.strip()
        if content.startswith("```json"): content = content[7:-3].strip()
        elif content.startswith("```"): content = content[3:-3].strip()
        return json.loads(content)
    except Exception as e:
        return {"error": True, "message": str(e), "fallback": True}

def analyze_tax(tax_data: dict) -> dict:
    try:
        response = model.generate_content(TAX_WIZARD_PROMPT.replace("{tax_data}", json.dumps(tax_data, indent=2)))
        content = response.text.strip()
        if content.startswith("```json"): content = content[7:-3].strip()
        elif content.startswith("```"): content = content[3:-3].strip()
        return json.loads(content)
    except Exception as e:
        return {"error": True, "message": str(e), "fallback": True}

def generate_life_event_plan(event_data: dict) -> dict:
    try:
        response = model.generate_content(LIFE_EVENT_PROMPT.replace("{event_data}", json.dumps(event_data, indent=2)))
        content = response.text.strip()
        if content.startswith("```json"): content = content[7:-3].strip()
        elif content.startswith("```"): content = content[3:-3].strip()
        return json.loads(content)
    except Exception as e:
        return {"error": True, "message": str(e), "fallback": True}
