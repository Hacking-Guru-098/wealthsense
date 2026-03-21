import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import FileUpload from '../components/FileUpload';
import LoadingAI from '../components/LoadingAI';
import { formatINR } from '../utils/formatters';
import { Calculator, ChevronLeft, ChevronRight, Scale, CheckCircle2, TrendingDown, PiggyBank } from 'lucide-react';

export default function TaxWizard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState("");

  const handleFileUpload = async (file) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post('http://localhost:8000/api/tax-wizard', formData);
      if (res.data.error) {
         setError("AI analysis failed or Form 16 was unreadable.");
         setShowManual(true);
         return;
      }
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Network timeout. The PDF could not be processed.");
      setShowManual(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("manual_data", manualText);
    try {
      const res = await axios.post('http://localhost:8000/api/tax-wizard', formData);
      if (res.data.error) {
         setError("AI analysis failed to understand the provided text.");
         return;
      }
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Network timeout while analyzing text.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <LoadingAI customMessages={[
          "Reading Income Data...",
          "Comparing Old vs New Regimes...",
          "Hunting for missed deductions under 80C & 80D...",
          "Minimizing tax liability..."
        ]} />
      </div>
    );
  }

  if (error && !showManual) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 flex items-center justify-center px-4">
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Interrupted</h2>
            <p className="text-gray-500 mb-8">{error}</p>
            <button onClick={() => setShowManual(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 w-full transition">Enter Data Manually</button>
         </div>
      </div>
    );
  }

  if (result && !result.error) {
    const chartData = [
      {
        name: 'Tax Liability',
        'Old Regime': result.old_regime_tax,
        'New Regime': result.new_regime_tax,
      }
    ];

    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-10">
           <button onClick={() => setResult(null)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition">
             <ChevronLeft size={24} />
           </button>
           <div>
             <h1 className="text-3xl font-extrabold text-gray-900">Tax Optimization Results</h1>
             <p className="text-sm text-gray-500 mt-1">{result.tax_summary}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="col-span-1 lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Scale className="text-indigo-600"/> Regime Comparison</h3>
                <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100 uppercase tracking-widest">{result.recommended_regime} Wins</span>
             </div>
             
             <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} layout="vertical" barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={(v) => formatINR(v)} />
                  <YAxis dataKey="name" type="category" width={10} tick={false} />
                  <RechartsTooltip formatter={(value) => formatINR(value)} cursor={{fill: '#f3f4f6'}} />
                  <Legend />
                  <Bar dataKey="Old Regime" fill="#9ca3af" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="New Regime" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
             </ResponsiveContainer>
             <div className="flex justify-around mt-4">
               <div className="text-center">
                 <p className="text-sm font-bold text-gray-500 mb-1">Old Regime Tax</p>
                 <p className="text-2xl font-extrabold text-gray-900">{formatINR(result.old_regime_tax)}</p>
               </div>
               <div className="text-center">
                 <p className="text-sm font-bold text-indigo-600 mb-1">New Regime Tax</p>
                 <p className="text-2xl font-extrabold text-indigo-900">{formatINR(result.new_regime_tax)}</p>
               </div>
             </div>
          </div>

          <div className="col-span-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <PiggyBank className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-600 mb-2 uppercase tracking-wide">Total Potential Savings</h3>
            <div className="text-5xl font-extrabold text-emerald-600 mb-2">{formatINR(result.total_extra_savings_possible)}</div>
            <p className="text-sm text-gray-500 font-medium">By optimizing your deductions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><TrendingDown className="text-indigo-600"/> Missed Deductions</h3>
             <ul className="space-y-4">
                {result.missed_deductions?.map((deduction, i) => (
                  <li key={i} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900">{deduction.section}</span>
                      <span className="font-extrabold text-emerald-600">Save {formatINR(deduction.potential_tax_saved)}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Unused limit: {formatINR(deduction.amount_missed)}</p>
                    <p className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded w-max">Action: {deduction.action}</p>
                  </li>
                ))}
                {(!result.missed_deductions || result.missed_deductions.length === 0) && (
                   <p className="text-gray-500 italic">You are fully utilizing all available deductions!</p>
                )}
             </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Calculator className="text-indigo-600"/> Salary Restructuring</h3>
             <ul className="space-y-4">
                {result.salary_restructuring?.map((item, i) => (
                   <li key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" />
                      <div>
                         <p className="font-bold text-gray-900">{item.component}</p>
                         <p className="text-sm font-bold text-indigo-600 mb-1">Suggested prep: {formatINR(item.suggested_amount)}/yr</p>
                         <p className="text-sm text-gray-600">{item.reason}</p>
                      </div>
                   </li>
                ))}
                {(!result.salary_restructuring || result.salary_restructuring.length === 0) && (
                   <p className="text-gray-500 italic">No salary restructuring needed.</p>
                )}
             </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Tax Optimization Wizard</h1>
           <p className="text-lg text-gray-500">Upload your Form 16 to find hidden tax savings and pick the optimal regime.</p>
        </div>
        
        {!showManual ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
            <FileUpload onFileSelect={handleFileUpload} onManualFallback={() => setShowManual(true)} />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100">{error}</div>}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manual Income Entry</h2>
            <p className="text-sm text-gray-500 mb-6">If you don't have Form 16, paste your salary details, current 80C, 80D investments, and rent paid.</p>
            <textarea 
              className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none resize-none font-mono text-sm"
              placeholder='e.g. {"income": 1200000, "80c_investments": 50000, "rent_paid_monthly": 20000}'
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
            />
            <div className="mt-8 flex justify-between">
              <button onClick={() => setShowManual(false)} className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-900 transition flex items-center gap-2"><ChevronLeft size={18}/> Back</button>
              <button 
                onClick={handleManualSubmit}
                disabled={!manualText.trim()}
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-sm ${manualText.trim() ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Analyze Taxes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
