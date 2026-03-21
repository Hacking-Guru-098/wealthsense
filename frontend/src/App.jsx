import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import HealthScore from './pages/HealthScore';
import PortfolioXray from './pages/PortfolioXray';
import FirePlanner from './pages/FirePlanner';
import TaxWizard from './pages/TaxWizard';
import LifeEvent from './pages/LifeEvent';
import { ErrorBoundary } from './components/ErrorBoundary';

function PageTransition({ children }) {
  // We use keyframes applied dynamically in tailwind via `animate-in fade-in slide-in-from-bottom-2` 
  // However since we don't have tailwindcss-animate plugin installed explicitly, 
  // we'll rely on global pure css animations for simplicity or standard css classes if tailwind is not configured for it.
  // Actually, standard tailwind v3 supports transition but not intrinsic "animate-in" without plugin.
  // I will just use basic transition on mount approach.
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`transition-all duration-500 ease-out fill-available ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
       {children}
    </div>
  );
}

function PageWrapper({ children }) {
  const location = useLocation();
  React.useEffect(() => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, [location.pathname]);

  return <PageTransition key={location.pathname}>{children}</PageTransition>;
}

function App() {
  return (
    <UserProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 w-full relative">
              <Routes>
                <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="/health-score" element={<PageWrapper><HealthScore /></PageWrapper>} />
                <Route path="/portfolio-xray" element={<PageWrapper><PortfolioXray /></PageWrapper>} />
                <Route path="/fire-plan" element={<PageWrapper><FirePlanner /></PageWrapper>} />
                <Route path="/tax-wizard" element={<PageWrapper><TaxWizard /></PageWrapper>} />
                <Route path="/life-event" element={<PageWrapper><LifeEvent /></PageWrapper>} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </UserProvider>
  );
}

export default App;
