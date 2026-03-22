import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.pdf_parser import extract_fund_holdings, extract_total_invested

def test_extract_fund_holdings():
    sample_text = """
    Folio No: 12345/67
    Axis Bluechip Fund - Direct Plan - Growth
    Units: 100.500
    SBI Small Cap Fund
    Total Invested Amount: 50,000.00
    """
    funds = extract_fund_holdings(sample_text)
    assert "Axis Bluechip Fund - Direct Plan - Growth" in funds
    assert "SBI Small Cap Fund" in funds

def test_extract_total_invested():
    sample_text = "Total Invested Amount 50,000.00 \nCurrent Value 65,000.00"
    invested = extract_total_invested(sample_text)
    assert invested == 50000.0

if __name__ == "__main__":
    try:
        test_extract_fund_holdings()
        test_extract_total_invested()
        print("CAMS Parser tests passed.")
    except Exception as e:
        print(f"CAMS Parser Test Failed: {e}")
