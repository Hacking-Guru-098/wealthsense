import React, { useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext';
import LoadingAI from '../components/LoadingAI';
import { formatINR } from '../utils/formatters';
import { Gift, Home, Briefcase, Heart, Baby, Landmark, AlertOctagon, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const EVENT_TYPES = [
  { id: 'bonus', label: 'Bonus / Windfall', icon: <Gift className="w-10 h-10"/> },
  { id: 'job_change', label: 'Job Change / Hike', icon: <Briefcase className="w-10 h-10"/> },
  { id: 'marriage', label: 'Marriage', icon: <Heart className="w-10 h-10"/> },
  { id: 'new_baby', label: 'New Baby', icon: <Baby className="w-10 h-10"/> },
  { id: 'home_purchase', label: 'Buying a Home', icon: <Home className="w-10 h-10"/> },
  { id: 'inheritance', label: 'Inheritance', icon: <Landmark className="w-10 h-10"/> },
];
const COLORS = ['#10b981', '#4f46e5', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function LifeEvent() {
  const { profile } = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    additional_context: ''
  });

  const submitForm = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    setError(null);
    const payload = {
      event_type: selectedEvent,
      amount: Number(formData.amount),
      current_age: profile.age || 30,
      net_worth: profile.current_savings || 0,
      monthly_income: profile.monthly_income || 0,
      risk_appetite: 'moderate',
      additional_context: formData.additional_context
    };

    try {
      const res = await axios.post('http://localhost:8000/api/life-event', payload);
      if (res.data.error) {
         setError("AI processing failed. Please try again.");
         return;
      }
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Network timeout. The plan could not be computed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <LoadingAI customMessages={[
          "Modeling financial impact...",
          "Calculating optimal allocation...",
          "Building priority timeline...",
          "Projecting 10-year wealth impact..."
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
            <button onClick={submitForm} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 w-full transition">Retry Plan Generation</button>
         </div>
      </div>
    );
  }

  if (result && !result.error) {
    const pieData = result.allocation?.map(a => ({ name: a.category, value: a.amount })) || [];

    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-10">
           <button onClick={() => setResult(null)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition">
             <ChevronLeft size={24} />
           </button>
           <div>
             <h1 className="text-3xl font-extrabold text-gray-900 capitalize px-2 inline-block rounded border-indigo-200 border bg-indigo-50 text-indigo-700 tracking-wider mb-2">{result.event_type.replace('_', ' ')} Plan</h1>
             <p className="text-sm font-semibold text-gray-500 mt-1">{result.event_summary}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
           <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Calendar className="text-indigo-600"/> Recommended Timeline</h3>
             <ul className="space-y-4">
                {result.timeline?.map((item, i) => (
                   <li key={i} className="flex gap-6 p-4 rounded-xl border border-gray-100 hover:shadow-md transition">
                      <div className="flex flex-col items-center shrink-0 w-16">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Week</span>
                         <span className="text-3xl font-extrabold text-indigo-600 leading-none">{item.week}</span>
                      </div>
                      <div className="flex-1">
                         <p className="font-bold text-gray-900 text-lg mb-1">{item.step}</p>
                         <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${item.priority === 'high' ? 'bg-red-100 text-red-700' : item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                           {item.priority} Priority
                         </span>
                      </div>
                   </li>
                ))}
             </ul>
           </div>

           <div className="col-span-1 flex flex-col gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[350px]">
                 <h3 className="font-bold text-gray-900 mb-4 items-center gap-2">Fund Allocation</h3>
                 <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatINR(value)} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="mt-4 space-y-2">
                    {result.allocation?.map((a, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2 font-semibold text-gray-700">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: COLORS[i % COLORS.length]}}></span> {a.category}
                        </span>
                        <span className="font-bold text-gray-900">{formatINR(a.amount)} ({a.percentage}%)</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
                <TrendingUp className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-4 -mt-4" />
                <h3 className="font-bold text-indigo-100 mb-2 uppercase tracking-wide text-sm flex items-center gap-2">Long Term Impact (10 Yrs)</h3>
                <div className="text-4xl font-extrabold mb-3">{formatINR(result.long_term_impact.corpus_added_in_10_years)}</div>
                <p className="text-sm font-medium text-indigo-100">{result.long_term_impact.description}</p>
              </div>
           </div>
        </div>

        {result.what_not_to_do?.length > 0 && (
          <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
             <h3 className="text-xl font-bold text-red-900 mb-6 flex items-center gap-2"><AlertOctagon className="text-red-600"/> What NOT to do</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.what_not_to_do.map((mistake, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                    <p className="font-bold text-gray-900 mb-2">{mistake.mistake}</p>
                    <p className="text-sm text-gray-600 font-medium">{mistake.reason}</p>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Life Event Advisor</h1>
           <p className="text-lg text-gray-500">Major financial transitions require a solid gameplan. Select an event below.</p>
        </div>
        
        {!selectedEvent ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {EVENT_TYPES.map(event => (
              <button 
                key={event.id}
                onClick={() => setSelectedEvent(event.id)}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-4 group"
              >
                <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors group-hover:scale-110 duration-300">{event.icon}</div>
                <span className="font-bold text-gray-900">{event.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center capitalize">{selectedEvent.replace('_', ' ')} Planner</h2>
            <p className="text-center text-gray-500 mb-8">Enter details about this specific event to get a structured blueprint.</p>
            
            <div className="space-y-6">
              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Event Amount involved (₹)(e.g., Bonus amt, Home value)</label>
                 <input type="number" value={formData.amount} onChange={e => setFormData(prev => ({...prev, amount: e.target.value}))} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="e.g. 500000" />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Additional context (Optional)</label>
                 <textarea value={formData.additional_context} onChange={e => setFormData(prev => ({...prev, additional_context: e.target.value}))} className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none resize-none" placeholder="e.g. I want to save a portion for kid's college, and use the rest for debt..." />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button onClick={() => setSelectedEvent(null)} className="px-6 py-4 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition flex-1">Back</button>
              <button onClick={submitForm} disabled={!formData.amount} className="px-6 py-4 font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-xl transition flex-[2] disabled:opacity-50 disabled:cursor-not-allowed">Generate Blueprint</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
