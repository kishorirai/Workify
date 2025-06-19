import React, { useState } from 'react';
import { Sparkles, RefreshCcw, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const AIPortfolioButtons = () => {
  // Sidebar open state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop & mobile */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sectionLabel="CAMPUS SERVICES"
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white shadow flex items-center">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold">Rojgar Setu</span>
        </div>
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white p-6">
          <div className="bg-white bg-opacity-80 backdrop-blur-md shadow-xl rounded-2xl max-w-xl w-full px-8 py-10 text-center border border-slate-200">
            <h2 className="text-4xl font-bold text-indigo-600 mb-4">AI Portfolio Generator</h2>
            <p className="text-gray-600 text-base mb-8">
              Click the button below to generate your personalized portfolio based on your profile data.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700 transition"
                onClick={() => alert('Generate button clicked!')}
              >
                <Sparkles className="w-5 h-5" />
                Generate Portfolio
              </button>

              <button
                className="flex items-center justify-center gap-2 bg-slate-200 text-slate-800 px-6 py-3 rounded-xl shadow hover:bg-slate-300 transition"
                onClick={() => alert('Refresh button clicked!')}
              >
                <RefreshCcw className="w-5 h-5" />
                Refresh Section
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPortfolioButtons;