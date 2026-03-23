cd /d "c:\Users\hacki\OneDrive\Desktop\Wealthsense AI\wealthsense-ai"
npx --yes create-vite@latest frontend --template react
cd frontend
call npm install
call npm install react-router-dom axios recharts lucide-react
call npm install -D tailwindcss@3 postcss autoprefixer
call npx tailwindcss init -p
