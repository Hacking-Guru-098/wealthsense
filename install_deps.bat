cd /d "c:\Users\hacki\OneDrive\Desktop\Wealthsense AI\wealthsense-ai\frontend"
call npm install

cd /d "c:\Users\hacki\OneDrive\Desktop\Wealthsense AI\wealthsense-ai\backend"
python -m venv .venv
call .venv\Scripts\activate.bat
pip install -r requirements.txt
