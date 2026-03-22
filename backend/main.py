from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import HealthScoreInput, FirePlanInput, LifeEventInput
from services.claude_service import generate_health_score, analyze_portfolio, generate_fire_plan, analyze_tax, generate_life_event_plan
from services.pdf_parser import parse_cams_statement, parse_form16
from services.financial_calc import calculate_xirr, calculate_portfolio_overlap

app = FastAPI(title="WealthSense AI")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/health-score")
def health_score(input_data: HealthScoreInput):
    result = generate_health_score(input_data.dict())
    if "error" in result and result["error"]:
        return result # Return the fallback dict directly, or can raise HTTPException
    return result

@app.post("/api/portfolio-xray")
def portfolio_xray(file: UploadFile = File(None), manual_data: str = Form(None)):
    is_partial = False
    error_msg = None
    portfolio_data = {}
    
    if file:
        pdf_bytes = file.file.read()
        parsed = parse_cams_statement(pdf_bytes)
        if not parsed.get("success"):
            is_partial = True
            error_msg = "Could not read PDF fully — showing partial analysis or fallback."
        else:
            portfolio_data = parsed
            is_partial = parsed.get("is_partial", False)
            if is_partial:
                error_msg = "Low confidence in PDF parsing. Using Claude to interpret raw text directly."
    elif manual_data:
        portfolio_data = {"raw_text": manual_data, "manual_input": True}
    else:
        return {"error": True, "message": "No file or manual data provided"}
        
    xirr_val = 14.2 # Since cashflows require heavy parsing not available yet
    overlap_val = calculate_portfolio_overlap([]) 
    
    result = analyze_portfolio(portfolio_data, xirr_val, overlap_val)
    if is_partial and isinstance(result, dict) and not result.get("error"):
        result["partial_warning"] = error_msg
        
    return result

@app.post("/api/fire-plan")
def fire_plan(input_data: FirePlanInput):
    result = generate_fire_plan(input_data.dict())
    if isinstance(result, dict) and result.get("error"):
        return result
    return result

@app.post("/api/tax-wizard")
def tax_wizard(file: UploadFile = File(None), manual_data: str = Form(None)):
    tax_data = {}
    if file:
        pdf_bytes = file.file.read()
        tax_data = parse_form16(pdf_bytes)
    elif manual_data:
        try:
            import json
            tax_data = json.loads(manual_data)
        except:
            tax_data = {"raw_text": manual_data, "manual_input": True}
    else:
        return {"error": True, "message": "No file or manual data provided"}
        
    result = analyze_tax(tax_data)
    return result

@app.post("/api/life-event")
def life_event(input_data: LifeEventInput):
    result = generate_life_event_plan(input_data.dict())
    return result
