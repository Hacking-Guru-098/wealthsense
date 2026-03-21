import React, { useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import FileUpload from '../components/FileUpload';
import LoadingAI from '../components/LoadingAI';
import ScoreCard from '../components/ScoreCard';
import { formatINR, formatPct } from '../utils/formatters';
import { AlertCircle, TrendingUp, RefreshCw, ChevronLeft } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function PortfolioXray() {
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
      const res = await axios.post('http://localhost:8000/api/portfolio-xray', formData);
      if (res.data.error) {
         setError("AI analysis failed or document was unreadable.");
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
      const res = await axios.post('http://localhost:8000/api/portfolio-xray', formData);
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
          "Reading your portfolio statements...",
          "Calculating precise XIRR...",
          "Checking for dangerous fund overlaps...",
          "Building your custom rebalancing plan...",
          "Finalizing insights..."
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
    const pieData = result.funds?.map((f) => ({ name: f.name, value: f.current_value })) || [];

    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => setResult(null)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition">
             <ChevronLeft size={24} />
           </button>
           <h1 className="text-3xl font-extrabold text-gray-900">Portfolio X-Ray Results</h1>
        </div>

        {result.partial_warning && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-xl flex items-start gap-4">
            <AlertCircle className="text-amber-500 w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-amber-800">Partial Data Warning</p>
              <p className="text-sm text-amber-700 mt-1">{result.partial_warning}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <ScoreCard score={result.portfolio_health_score} subtitle="Health Score" />
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
            <span className="text-4xl font-extrabold text-indigo-600 tracking-tight">{formatPct(result.xirr)}</span>
            <span className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">Total XIRR</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
            <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">{formatINR(result.current_value)}</span>
            <span className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">Current Value</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
            <span className="text-4xl font-extrabold text-amber-600 tracking-tight">{formatPct(result.absolute_return_pct)}</span>
            <span className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">Absolute Return</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><TrendingUp className="text-indigo-600"/> Fund Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    <th className="pb-4">Fund Name</th>
                    <th className="pb-4">Invested</th>
                    <th className="pb-4">Current</th>
                    <th className="pb-4">XIRR</th>
                    <th className="pb-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {result.funds?.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition whitespace-nowrap">
                      <td className="py-4 font-semibold text-gray-900"><div className="w-48 xl:w-64 truncate" title={f.name}>{f.name}</div></td>
                      <td className="py-4 text-gray-600 font-medium">{formatINR(f.invested)}</td>
                      <td className="py-4 text-gray-900 font-bold">{formatINR(f.current_value)}</td>
                      <td className="py-4 text-indigo-600 font-bold">{formatPct(f.xirr)}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${f.recommendation?.toLowerCase() === 'sell' ? 'bg-red-100 text-red-700' : f.recommendation?.toLowerCase() === 'hold' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {f.recommendation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
             <h3 className="text-xl font-bold text-gray-900 w-full text-left mb-4">Asset Allocation</h3>
             <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatINR(value)} />
                </PieChart>
             </ResponsiveContainer>
             <div className="w-full mt-4 flex flex-col gap-2">
                {pieData.map((entry, i) => (
                   <div key={i} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: COLORS[i % COLORS.length]}}></span> <span className="truncate">{entry.name}</span></div>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
           <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><RefreshCw className="text-indigo-600"/> Rebalancing Plan</h3>
           {result.rebalancing_plan?.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.rebalancing_plan.map((action, i) => (
                   <div key={i} className={`p-6 rounded-2xl border-l-4 shadow-sm bg-gray-50 ${action.action.includes('sell') ? 'border-red-500 bg-red-50/30' : 'border-emerald-500 bg-emerald-50/30'}`}>
                      <h4 className="font-extrabold text-gray-900 uppercase tracking-widest text-xs mb-2">{action.action.replace('_', ' ')}</h4>
                      <p className="font-bold text-lg text-gray-900 mb-2 truncate" title={action.fund}>{action.fund}</p>
                      <p className="text-sm font-medium text-gray-600 mb-4">{action.reason}</p>
                      {action.amount != null && <div className="text-sm font-bold text-indigo-600 flex justify-between"><span>Amount involved:</span> <span>{formatINR(action.amount)}</span></div>}
                      {action.move_to && <div className="text-sm font-bold text-emerald-600 mt-2 bg-emerald-100/50 p-3 rounded-lg border border-emerald-100">→ Reinvest in: {action.move_to}</div>}
                   </div>
                ))}
             </div>
           ) : (
             <p className="text-gray-500 italic font-medium bg-gray-50 p-6 rounded-xl border border-gray-100">No rebalancing needed at this time. Your portfolio is optimal and aligned with your goals.</p>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-extrabold text-gray-900 mb-4">MF Portfolio X-Ray</h1>
           <p className="text-lg text-gray-500">Upload your CAMS statement to uncover overlaps, expense leaks, and true XIRR.</p>
        </div>
        
        {!showManual ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
            <FileUpload onFileSelect={handleFileUpload} onManualFallback={() => setShowManual(true)} />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100">{error}</div>}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manual Data Entry</h2>
            <p className="text-sm text-gray-500 mb-6">If your PDF cannot be read, please paste the contents of your statement below (e.g. Fund names, Invested, Current value).</p>
            <textarea 
              className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none resize-none font-mono text-sm"
              placeholder="e.g. Axis Bluechip Fund, Invested: 1,00,000, Current: 1,50,000..."
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
                Analyze Portfolio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
