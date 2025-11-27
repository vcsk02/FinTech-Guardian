import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg transition-transform hover:scale-105 duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-20 ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  </div>
);