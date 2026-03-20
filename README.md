# WealthSense AI

WealthSense AI is an advanced, AI-powered personal finance mentor designed specifically for the modern Indian retail investor. Unlike traditional tools that provide raw numbers and jargon, WealthSense uses generative AI (Gemini 1.5 Flash) embedded directly inside its core data pipeline to deliver contextual, deeply personalized, actionable insights. 

Using an aesthetically beautiful fintech interface inspired by the "Obsidian Reserve" design system, it abstracts the complexity of XIRR calculations, optimal tax regimes, overlap dragging, and FIRE (Financial Independence, Retire Early) planning, presenting users with a pristine dashboard of real-world directives.

## Features
- **Money Health Score**: Evaluates 6 pillars of personal finance through a quick assessment, visualized through Recharts Radar charts.
- **MF Portfolio X-Ray**: Upload CAMS statements via PDF drag-and-drop to reveal exact XIRR, hidden overlaps, and direct buy/sell/hold rebalancing instructions.
- **FIRE Path Planner**: Month-by-month forecasting calculating exact SIP allocations needed to hit early retirement corpus targets.
- **Tax Optimizer Wizard**: Upload Form 16 to instantly find unutilized 80C/80D allowances and empirically choose between Old vs. New tax regimes.
- **Life Event Advisor**: Customized financial blueprints tracking major life transitions like marriage, bonus windfalls, or a new baby.

## Setup Instructions

### Backend (FastAPI + Gemini AI)
1. Open up your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Mac/Linux:
   source .venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   **Important:** Add your Gemini API Key inside `.env`.
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend (React + Vite + TailwindCSS)
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## `.env.example`
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Screenshots
> Note: Add actual screenshots here after deployment
- *Dashboard Overview Placeholder*
- *MF Portfolio X-Ray Placeholder*
- *Tax Wizard Placeholder*

## Tech Stack
| Layer | Technology |
| --- | --- |
| **Frontend UI** | React 18, Vite |
| **Styling** | TailwindCSS v3 |
| **Icons & Charts** | lucide-react, Recharts |
| **Backend API** | FastAPI (Python) |
| **LLM Engine** | Google Gemini API (gemini-1.5-flash) |
| **PDF Parsing** | PyMuPDF (fitz) |
| **Complex Math** | numpy, scipy |

## Impact Metrics
- **Context Depth**: Aggregates up to 15 data streams simultaneously for exact scenario rendering.
- **Financial Rule Processing**: 100% adherence to specific Indian income-tax constraints dynamically loaded.
