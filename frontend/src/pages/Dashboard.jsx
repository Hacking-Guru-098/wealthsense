import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Target, PieChart, ShieldAlert, HeartPulse, Scale, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useUser();
  const hasScore = profile.has_completed_onboarding;

  const tools = [
    {
      id: "health",
      path: "/health-score",
      title: "Money Health Score",
      desc: "Take a 2-minute assessment to reveal your financial standing.",
      icon: <HeartPulse className="w-8 h-8" />,
      bgClass: "bg-indigo-50",
      textClass: "text-indigo-600",
      hoverClass: "group-hover:text-indigo-600",
      status: hasScore ? "Completed" : "Start Here →",
      summary: hasScore ? `Score: ${profile.health_score}/100` : null
    },
    {
      id: "portfolio",
      path: "/portfolio-xray",
      title: "MF Portfolio X-Ray",
      desc: "Upload CAMS PDF to find overlapping funds and get rebalancing plans.",
      icon: <PieChart className="w-8 h-8" />,
      bgClass: "bg-emerald-50",
      textClass: "text-emerald-600",
      hoverClass: "group-hover:text-emerald-600",
      status: "Available",
      summary: null
    },
    {
      id: "fire",
      path: "/fire-plan",
      title: "FIRE Path Planner",
      desc: "Calculate your corpus gap and get a month-by-month roadmap.",
      icon: <Target className="w-8 h-8" />,
      bgClass: "bg-amber-50",
      textClass: "text-amber-600",
      hoverClass: "group-hover:text-amber-600",
      status: "Available",
      summary: null
    },
    {
      id: "tax",
      path: "/tax-wizard",
      title: "Tax Optimizer Wizard",
      desc: "Upload Form 16 to find hidden tax deductions instantly.",
      icon: <Scale className="w-8 h-8" />,
      bgClass: "bg-sky-50",
      textClass: "text-sky-600",
      hoverClass: "group-hover:text-sky-600",
      status: "Available",
      summary: null
    },
    {
      id: "life",
      path: "/life-event",
      title: "Life Event Advisor",
      desc: "Get a strict financial checklist for large sudden transitions.",
      icon: <ShieldAlert className="w-8 h-8" />,
      bgClass: "bg-pink-50",
      textClass: "text-pink-600",
      hoverClass: "group-hover:text-pink-600",
      status: "Available",
      summary: null
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:justify-between md:items-end">
        <div>
           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Your Financial Control Center</h1>
           <p className="text-lg md:text-xl text-gray-500 max-w-2xl">India's unbiased AI-powered personal finance mentor. No jargon. No advisor fees.</p>
        </div>
        {hasScore && (
           <div className="hidden md:flex flex-col items-end">
             <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Overall Profile</span>
             <span className="text-2xl font-black text-indigo-600 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">{profile.health_score}/100</span>
           </div>
        )}
      </div>
      
      {/* 3 + 2 layout mapping perfectly using lg:mx-auto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {tools.slice(0, 3).map(tool => <ToolCard key={tool.id} tool={tool} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:w-2/3 lg:mx-auto">
        {tools.slice(3, 5).map(tool => <ToolCard key={tool.id} tool={tool} />)}
      </div>
    </div>
  );
}

function ToolCard({ tool }) {
  const isCompleted = tool.status === "Completed";
  const isStartHere = tool.status.includes("Start Here");

  return (
    <Link to={tool.path} className="group flex flex-col justify-between bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 relative overflow-hidden h-full">
      {/* Background decoration */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-[0.15] transition-transform duration-500 group-hover:scale-[2] ${tool.bgClass}`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tool.bgClass} ${tool.textClass}`}>
            {tool.icon}
          </div>
          {isCompleted ? (
            <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-600"/> Done</span>
          ) : isStartHere ? (
            <span className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg animate-pulse shadow-md shadow-indigo-200">{tool.status}</span>
          ) : (
             <span className="px-3 py-1 bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-gray-100">{tool.status}</span>
          )}
        </div>
        <h2 className={`text-xl font-bold text-gray-900 mb-2 transition-colors duration-300 ${tool.hoverClass}`}>{tool.title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed font-medium">{tool.desc}</p>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
         {tool.summary ? (
             <span className="font-extrabold text-gray-900 tracking-wide">{tool.summary}</span>
         ) : (
             <span className={`text-sm font-bold flex items-center gap-1 uppercase tracking-wide transition-colors ${tool.textClass}`}>
                Open Tool <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </span>
         )}
      </div>
    </Link>
  );
}
