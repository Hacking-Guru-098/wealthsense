import React from 'react';

const ScoreCard = ({ score, subtitle = "Score" }) => {
  let colorClass = 'text-red-600 bg-red-50 border-red-200';
  if (score >= 80) colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  else if (score >= 60) colorClass = 'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <div className={`p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center ${colorClass}`}>
      <span className="text-6xl font-extrabold tracking-tight">{score}</span>
      <span className="text-sm font-bold mt-2 opacity-80 uppercase tracking-wider">{subtitle}</span>
    </div>
  );
};

export default ScoreCard;
