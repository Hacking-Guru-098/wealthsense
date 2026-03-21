import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Health Score', path: '/health-score' },
    { name: 'X-Ray', path: '/portfolio-xray' },
    { name: 'FIRE', path: '/fire-plan' },
    { name: 'Taxes', path: '/tax-wizard' },
    { name: 'Life Events', path: '/life-event' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <ShieldCheck className="w-8 h-8 text-indigo-600 transition-transform group-hover:scale-110 duration-300" />
              <span className="text-xl font-extrabold text-gray-900 tracking-tight hidden sm:block">WealthSense <span className="text-indigo-600 font-black">AI</span></span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-1 ml-6">
            {navItems.map(item => (
              <NavLink 
                key={item.path} 
                to={item.path}
                className={({ isActive }) => 
                  `px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                    isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden overflow-x-auto border-t border-gray-50 scrollbar-hide">
         <div className="flex py-2 px-2 gap-2 min-w-max">
            {navItems.map(item => (
              <NavLink 
                key={item.path} 
                to={item.path}
                className={({ isActive }) => 
                  `px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
         </div>
      </div>
    </nav>
  );
}
