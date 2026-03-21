import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
             <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Something went wrong.</h1>
          <p className="text-gray-500 mb-8 max-w-md font-medium">An unexpected software error occurred while processing your data. Please try again or return to the main dashboard.</p>
          <button onClick={() => window.location.href = '/'} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">Return to Dashboard</button>
        </div>
      );
    }

    return this.props.children; 
  }
}
