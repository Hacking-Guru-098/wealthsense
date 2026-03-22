import fitz
import re

def extract_fund_holdings(text: str) -> list:
    funds = []
    lines = text.split('\n')
    for line in lines:
        if "Fund" in line or "Scheme" in line:
            if len(line) > 10 and not line.startswith("Note"):
                funds.append(line.strip())
    # Remove obvious headers
    funds = [f for f in set(funds) if "Mutual Fund" not in f and "Total" not in f]
    return funds

def extract_total_invested(text: str) -> float:
    match = re.search(r'(Invested Amount|Total Cost).*?([\d,]+\.?\d*)', text, re.IGNORECASE)
    if match:
        val = match.group(2).replace(',', '')
        try: return float(val)
        except: return 0.0
    return 0.0

def extract_statement_date(text: str) -> str:
    match = re.search(r'Date:\s*(\d{2}-[a-zA-Z]{3}-\d{4})', text)
    if match: return match.group(1)
    return "Unknown"

def parse_cams_statement(pdf_bytes: bytes) -> dict:
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text()
            
        funds = extract_fund_holdings(full_text)
        invested = extract_total_invested(full_text)
        date_str = extract_statement_date(full_text)
        
        return {
            "success": True,
            "raw_text": full_text[:4000], 
            "funds": funds,
            "total_invested": invested,
            "statement_date": date_str,
            "is_partial": len(funds) < 3
        }
    except Exception as e:
        return {
            "success": False,
            "is_partial": True,
            "error": str(e)
        }

def parse_form16(pdf_bytes: bytes) -> dict:
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = ""
        for page in doc: full_text += page.get_text()
        return {"success": True, "raw_text": full_text[:4000]}
    except Exception as e:
        return {"success": False, "error": str(e)}
