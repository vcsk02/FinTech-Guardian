import React from 'react';
import { Lock, Play, Square } from 'lucide-react';

export const Navbar = ({ isStreaming, setIsStreaming }) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-opacity-80">
      {/* Branding */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
          <Lock className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">FinTech Guardian</h1>
          <p className="text-xs text-slate-400 font-mono">CLOUD-NATIVE • REAL-TIME • SECURE</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
          <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-xs font-mono text-slate-400">
            {isStreaming ? 'INGESTING LIVE DATA' : 'SYSTEM IDLE'}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            isStreaming 
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
          }`}
        >
          {isStreaming ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          {isStreaming ? 'Stop Stream' : 'Start Stream'}
        </button>
      </div>
    </nav>
  );
};