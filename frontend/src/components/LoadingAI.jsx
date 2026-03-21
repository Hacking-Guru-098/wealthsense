import React, { useState, useEffect } from 'react';

const LoadingAI = ({ customMessages }) => {
  const defaultMessages = [
    "Reading your profile...",
    "Calculating key metrics...",
    "Analyzing financial health...",
    "Preparing recommendations...",
    "Almost ready..."
  ];
  
  const messages = customMessages || defaultMessages;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const intv = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(intv);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-lg font-medium text-indigo-700 animate-pulse">
        {messages[msgIndex]}
      </p>
    </div>
  );
};

export default LoadingAI;
