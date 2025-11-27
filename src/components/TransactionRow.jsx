import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const TransactionRow = ({ tx }) => (
  <div className={`flex items-center justify-between p-4 border-b border-slate-700 hover:bg-slate-750 transition-colors animate-fade-in ${tx.isFraud ? 'bg-red-900/10' : ''}`}>
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-full ${tx.isFraud ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
        {tx.isFraud ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
      </div>
      <div>
        <p className="font-semibold text-white">${tx.amount.toFixed(2)}</p>
        <p className="text-xs text-slate-400">{tx.merchant} • {tx.location}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center justify-end gap-2">
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          tx.riskScore > 75 ? 'bg-red-500 text-white' : 
          tx.riskScore > 25 ? 'bg-yellow-500 text-black' : 
          'bg-slate-600 text-slate-300'
        }`}>
          Risk: {Math.floor(tx.riskScore)}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-1">{new Date(tx.timestamp).toLocaleTimeString()}</p>
    </div>
  </div>
);