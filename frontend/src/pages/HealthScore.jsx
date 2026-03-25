import React, { useState } from 'react';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext';
import LoadingAI from '../components/LoadingAI';
import ScoreCard from '../components/ScoreCard';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function HealthScore() {
  const { updateProfile } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    age: '', monthly_income: '', monthly_expenses: '',
    emergency_fund_months: '', has_term_insurance: false, term_cover_amount: 0,
    has_health_insurance: false, health_cover_amount: 0, monthly_sip: '',
    equity_pct: '', debt_pct: '', gold_pct: '',
    has_home_loan: false, emi_total: 0, invests_in_80c: false,
    invests_in_nps: false, has_health_insurance_80d: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? '' : Number(value))
    }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const submitForm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:8000/api/health-score', formData);
      if (res.data.error) {
         setError("AI analysis failed. Our servers might be overloaded.");
         return;
      }
      setResult(res.data);
      updateProfile({
        ...formData,
        health_score: res.data.overall_score,
        health_score_dimensions: res.data.dimensions,
        has_completed_onboarding: true
      });
    } catch (err) {
      console.error(err);
      setError("Network timeout. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <LoadingAI customMessages={[
          "Analyzing your diversification...", 
          "Calculating tax efficiency...", 
          "Reviewing retirement readiness..."
        ]} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center px-4">
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Interrupted</h2>
            <p className="text-gray-500 mb-8">{error}</p>
            <button onClick={submitForm} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 w-full transition">Retry Analysis</button>
         </div>
      </div>
    );
  }

  if (result && !result.error) {
    const radarData = Object.keys(result.dimensions).map(key => ({
      dimension: key.replace(/_/g, ' ').toUpperCase(),
      score: result.dimensions[key].score
    }));

    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{result.headline}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{result.personalized_message}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 flex flex-col gap-6">
            <ScoreCard score={result.overall_score} subtitle={`Grade: ${result.grade}`} />
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-indigo-600" /> Top Priorities
              </h3>
              <ul className="space-y-3">
                {result.top_3_priorities.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="font-bold text-indigo-600">{i+1}.</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="font-bold text-gray-800 mb-4">Dimension Breakdown</h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" tick={{fill: '#4b5563', fontSize: 10}} />
                <Tooltip />
                <Radar dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Multi-step form
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Financial Health Score</h2>
            <span className="text-sm font-medium text-indigo-600">Step {step} of 5</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full">
            <div className="h-2 bg-indigo-600 rounded-full transition-all" style={{width: `${(step/5)*100}%`}}></div>
          </div>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <>
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none" placeholder="e.g. 28" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Income (₹)</label>
                  <input type="number" name="monthly_income" value={formData.monthly_income} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 120000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Expenses (₹)</label>
                  <input type="number" name="monthly_expenses" value={formData.monthly_expenses} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 60000" />
                </div>
            </>
          )}

          {step === 2 && (
            <>
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Fund (Months of Expenses saved)</label>
                  <input type="number" name="emergency_fund_months" value={formData.emergency_fund_months} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 3" />
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <input type="checkbox" name="has_term_insurance" checked={formData.has_term_insurance} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
                  <label className="text-sm font-medium text-gray-800">I have Term Life Insurance</label>
                </div>
                {formData.has_term_insurance && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Term Cover Amount (₹)</label>
                    <input type="number" name="term_cover_amount" value={formData.term_cover_amount} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 10000000" />
                  </div>
                )}
            </>
          )}

          {step === 3 && (
            <>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <input type="checkbox" name="has_health_insurance" checked={formData.has_health_insurance} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
                  <label className="text-sm font-medium text-gray-800">I have Health Insurance</label>
                </div>
                {formData.has_health_insurance && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Health Cover Amount (₹)</label>
                    <input type="number" name="health_cover_amount" value={formData.health_cover_amount} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 500000" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly SIP / Investments (₹)</label>
                  <input type="number" name="monthly_sip" value={formData.monthly_sip} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 20000" />
                </div>
            </>
          )}

          {step === 4 && (
            <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">% of Portfolio in Equity</label>
                  <input type="number" name="equity_pct" value={formData.equity_pct} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 70" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">% of Portfolio in Debt</label>
                  <input type="number" name="debt_pct" value={formData.debt_pct} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">% of Portfolio in Gold / Other</label>
                  <input type="number" name="gold_pct" value={formData.gold_pct} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 10" />
                </div>
            </>
          )}

          {step === 5 && (
            <>
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <input type="checkbox" name="has_home_loan" checked={formData.has_home_loan} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
                  <label className="text-sm font-medium text-gray-800">I have an ongoing Loan (Home, Auto, etc.)</label>
                </div>
                {formData.has_home_loan && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Monthly EMIs (₹)</label>
                    <input type="number" name="emi_total" value={formData.emi_total} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 35000" />
                  </div>
                )}
                
                <h4 className="font-semibold text-gray-800 mt-4">Tax Saving Habits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
                    <input type="checkbox" name="invests_in_80c" checked={formData.invests_in_80c} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
                    <span className="text-sm font-medium">Using full 80C</span>
                  </label>
                  <label className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
                    <input type="checkbox" name="invests_in_nps" checked={formData.invests_in_nps} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
                    <span className="text-sm font-medium">Investing in NPS</span>
                  </label>
                </div>
            </>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between pt-6 border-t border-gray-100">
          <button 
            type="button" 
            onClick={handleBack} 
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${step === 1 ? 'opacity-0' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
          >
            <ChevronLeft size={20} /> Back
          </button>

          {step < 5 ? (
            <button 
              type="button" 
              onClick={handleNext} 
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
            >
              Next <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={submitForm} 
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-md transition-all"
            >
              Finish & Analyze <CheckCircle2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
