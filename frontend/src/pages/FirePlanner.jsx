import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useUser } from '../context/UserContext';
import LoadingAI from '../components/LoadingAI';
import ScoreCard from '../components/ScoreCard';
import { formatINR } from '../utils/formatters';
import { ChevronLeft, ChevronRight, CheckCircle2, ShieldAlert, Target, CalendarDays, TrendingUp } from 'lucide-react';

export default function FirePlanner() {
  const { profile } = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    age: '', monthly_income: '', monthly_expenses: '',
    current_savings: '', monthly_sip: '', existing_investments: '',
    target_retirement_age: '', risk_appetite: 'moderate',
    has_dependents: false, home_loan_emi: 0,
    goals: []
  });

  useEffect(() => {
    if (profile && profile.has_completed_onboarding) {
      setFormData(prev => ({
        ...prev,
        age: profile.age || '',
        monthly_income: profile.monthly_income || '',
        monthly_expenses: profile.monthly_expenses || '',
        monthly_sip: profile.monthly_sip || '',
        home_loan_emi: profile.emi_total || 0,
      }));
    }
  }, [profile]);

  const handleGoalToggle = (goal) => {
    setFormData(prev => {
      const g = prev.goals.includes(goal) ? prev.goals.filter(x => x !== goal) : [...prev.goals, goal];
      return { ...prev, goals: g };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'risk_appetite' ? value : (value === '' ? '' : Number(value)))
    }));
  };

  const submitForm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:8000/api/fire-plan', formData);
      if (res.data.error) {
         setError("AI engine encountered an error. Please try again.");
         return;
      }
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Network timeout. The FIRE path could not be computed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <LoadingAI customMessages={[
          "Modeling your financial trajectory...",
          "Simulating inflation impacts at 6%...",
          "Calculating FIRE corpus...",
          "Drafting your month-by-month strategy...",
          "Finalizing milestones..."
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
            <button onClick={submitForm} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 w-full transition">Retry Calculation</button>
         </div>
      </div>
    );
  }

  if (result && !result.error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-10">
           <button onClick={() => setResult(null)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition">
             <ChevronLeft size={24} />
           </button>
           <div>
             <h1 className="text-3xl font-extrabold text-gray-900">Your FIRE Roadmap</h1>
             <p className="text-sm text-gray-500 mt-1">{result.fire_summary}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <h3 className="text-lg font-bold text-gray-600 mb-2 uppercase tracking-wide">Target Corpus Needed</h3>
            <div className="text-5xl font-extrabold text-gray-900 mb-2">{result.retirement_corpus_needed} {result.corpus_unit}</div>
            <p className="text-sm text-emerald-600 font-bold bg-emerald-50 w-max px-3 py-1 rounded-lg">Retire at age {result.retirement_age} ({result.years_to_fire} years left)</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <h3 className="text-lg font-bold text-gray-600 mb-2 uppercase tracking-wide">Current Trajectory</h3>
            <div className="text-5xl font-extrabold text-gray-900 mb-2">{result.current_trajectory_corpus} {result.corpus_unit}</div>
            <p className="text-sm text-amber-600 font-bold bg-amber-50 w-max px-3 py-1 rounded-lg">Gap: {result.gap} {result.corpus_unit}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px]">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><TrendingUp className="text-indigo-600"/> Projected Corpus Growth</h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={result.yearly_milestones}>
                <defs>
                  <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="year" tickFormatter={(v) => `Year ${v}`} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis tickFormatter={(v) => formatINR(v)} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <RechartsTooltip formatter={(value) => formatINR(value)} labelFormatter={(v) => `Year ${v}`} />
                <Area type="monotone" dataKey="corpus_target" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCorpus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-1">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Target className="text-indigo-600"/> SIP Allocation</h3>
              <div className="bg-indigo-50 p-4 rounded-xl mb-4 border border-indigo-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-widest">Recommended SIP</span>
                  <span className="font-extrabold text-indigo-900">{formatINR(result.monthly_sip_needed)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-600/70 uppercase tracking-widest">Current SIP</span>
                  <span className="font-bold text-indigo-600">{formatINR(result.current_sip)}</span>
                </div>
              </div>
              <ul className="space-y-4">
                {result.sip_allocation?.map((sip, i) => (
                  <li key={i} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900">{sip.instrument}</span>
                      <span className="font-bold text-emerald-600">{formatINR(sip.monthly_amount)}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{sip.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            {result.insurance_gaps?.length > 0 && result.insurance_gaps.map((gap, i) => (
              <div key={i} className="bg-amber-50 p-6 rounded-3xl border border-amber-200 shadow-sm">
                <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><ShieldAlert className="text-amber-600"/> Insurance Gap</h3>
                <p className="text-sm font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded w-max mb-3 uppercase tracking-widest">{gap.type}</p>
                <p className="text-sm text-amber-700">{gap.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
           <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><CalendarDays className="text-indigo-600"/> 12-Month Action Plan</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.immediate_actions?.map((action, i) => (
                <div key={i} className="p-5 border border-gray-100 bg-gray-50 rounded-2xl flex flex-col hover:shadow-md transition">
                  <span className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mb-4 text-sm">M {action.month}</span>
                  <p className="font-semibold text-gray-900 mb-2">{action.action}</p>
                  {action.amount > 0 && <span className="text-sm font-bold text-emerald-600 mt-auto">{formatINR(action.amount)}</span>}
                </div>
              ))}
           </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Build Your FIRE Plan</h2>
        <p className="text-gray-500 mb-8">Financial Independence, Retire Early. Let's see what it takes.</p>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Retire Age Goal</label>
              <input type="number" name="target_retirement_age" value={formData.target_retirement_age} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 45" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Income (₹)</label>
              <input type="number" name="monthly_income" value={formData.monthly_income} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Expenses (₹)</label>
              <input type="number" name="monthly_expenses" value={formData.monthly_expenses} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Savings / Mutual Funds (₹)</label>
              <input type="number" name="current_savings" value={formData.current_savings} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 500000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current SIP (₹/mo)</label>
              <input type="number" name="monthly_sip" value={formData.monthly_sip} onChange={handleChange} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 15000" />
            </div>
          </div>

          <div className="pt-4">
             <label className="block text-sm font-semibold text-gray-700 mb-3">Risk Appetite</label>
             <div className="flex gap-4">
               {['conservative', 'moderate', 'aggressive'].map(risk => (
                 <label key={risk} className={`flex-1 text-center py-3 rounded-xl border cursor-pointer capitalize font-semibold text-sm transition-colors ${formData.risk_appetite === risk ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                   <input type="radio" name="risk_appetite" value={risk} checked={formData.risk_appetite === risk} onChange={handleChange} className="hidden" />
                   {risk}
                 </label>
               ))}
             </div>
          </div>
          
          <div className="pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Other Big Goals (Next 10 Years)</label>
            <div className="flex flex-wrap gap-3">
              {[
                {id: 'buy_home', label: 'Buy a Home'}, 
                {id: 'child_education', label: 'Child Education'}, 
                {id: 'travel', label: 'World Travel'},
                {id: 'start_business', label: 'Start Business'}
              ].map(goal => (
                <label key={goal.id} className={`px-4 py-2 rounded-full border cursor-pointer font-medium text-sm transition-colors ${formData.goals.includes(goal.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <input type="checkbox" className="hidden" onChange={() => handleGoalToggle(goal.id)} checked={formData.goals.includes(goal.id)} />
                  {goal.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button onClick={submitForm} className="w-full mt-10 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2">
          Calculate My Journey <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
