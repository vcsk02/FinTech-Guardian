import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Database, Server, Play, Square, Wifi, Lock, ShieldAlert, Zap, Globe, Settings, BrainCircuit
} from 'lucide-react';

// --- CUSTOM MODULE IMPORTS ---
import { db, auth } from './lib/firebase';         
import { mlEngine } from './services/fraudEngine'; 
import { StatCard } from './components/StatCard';  
import { TransactionRow } from './components/TransactionRow'; 
import { Navbar } from './components/Navbar';      

export default function App() {
  const [user, setUser] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total: 0, fraud: 0, blockedAmount: 0 });

  // --- AI SETTINGS STATE ---
  const [showSettings, setShowSettings] = useState(false);
  // Default to .env key if available, otherwise empty
  const [geminiKey, setGeminiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    amount: '',
    merchant: 'Amazon',
    location: 'New York, US',
    isForeignIp: false
  });

  // 1. Authentication
  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error("Auth Failed:", err));
    return onAuthStateChanged(auth, setUser);
  }, []);

  // 2. Data Streaming (Background Generator - Always uses Heuristic for speed)
  useEffect(() => {
    let interval;
    if (isStreaming && user) {
      interval = setInterval(async () => {
        const isAnomaly = Math.random() < 0.1; 
        const baseAmount = isAnomaly ? (Math.random() * 5000) + 1000 : (Math.random() * 200) + 10;
        
        const rawTx = {
          amount: baseAmount,
          merchant: isAnomaly ? "Unknown Vendor" : ["Amazon", "Uber", "Starbucks", "Target", "Shell"][Math.floor(Math.random() * 5)],
          location: isAnomaly ? "Lagos, NG" : "New York, US",
          isForeignIp: isAnomaly,
          velocity: isAnomaly ? 0.9 : 0.1,
          timestamp: new Date().toISOString()
        };

        // Stream always uses fast heuristic engine (Edge AI)
        const analyzedTx = mlEngine.analyze(rawTx);

        try {
          await addDoc(collection(db, 'transactions'), {
            ...analyzedTx,
            timestamp: serverTimestamp() 
          });
        } catch (e) {
          console.error("Error writing to DB:", e);
        }

      }, 1500); 
    }
    return () => clearInterval(interval);
  }, [isStreaming, user]);

  // --- MANUAL SUBMIT HANDLER (Uses Gemini if Key is present) ---
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount) return;

    setIsAnalyzing(true);

    const rawTx = {
      amount: parseFloat(formData.amount),
      merchant: formData.merchant,
      location: formData.location,
      isForeignIp: formData.isForeignIp,
      velocity: 0.1, 
      timestamp: new Date().toISOString()
    };

    let analyzedTx;

    // DECISION: Use Gemini if key exists, else use Heuristic
    if (geminiKey) {
      console.log("Analyzing with Gemini...");
      analyzedTx = await mlEngine.analyzeWithGemini(rawTx, geminiKey);
    } else {
      console.log("Analyzing with Heuristic...");
      analyzedTx = mlEngine.analyze(rawTx);
    }

    // Save to Firestore
    try {
      await addDoc(collection(db, 'transactions'), {
        ...analyzedTx,
        timestamp: serverTimestamp()
      });
      setFormData(prev => ({ ...prev, amount: '' }));
    } catch (e) {
      console.error("Error submitting manual tx:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Real-time Listeners
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return { 
          id: doc.id, 
          ...d, 
          timestamp: d.timestamp ? d.timestamp.toDate() : new Date() 
        };
      });
      
      setTransactions(data);

      const total = data.length;
      const fraud = data.filter(t => t.isFraud).length;
      const blocked = data.filter(t => t.isFraud).reduce((acc, curr) => acc + curr.amount, 0);
      
      setStats({ total, fraud, blockedAmount: blocked });
    }, (error) => {
      console.error("Firestore listener error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const chartData = useMemo(() => {
    return [...transactions].reverse().map(t => ({
      time: t.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}),
      amount: t.amount,
      risk: t.riskScore
    }));
  }, [transactions]);

  const pieData = [
    { name: 'Normal', value: stats.total - stats.fraud, color: '#10B981' }, 
    { name: 'Fraud', value: stats.fraud, color: '#EF4444' } 
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Navbar isStreaming={isStreaming} setIsStreaming={setIsStreaming} />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* SETTINGS TOGGLE */}
        <div className="flex justify-end">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
          >
            <Settings size={16} />
            {showSettings ? "Hide Settings" : "Configure AI Model"}
          </button>
        </div>

        {/* AI CONFIGURATION PANEL */}
        {showSettings && (
          <div className="bg-slate-800 border border-indigo-500/30 p-4 rounded-xl shadow-lg animate-fade-in">
            <h3 className="text-white font-bold flex items-center gap-2 mb-2">
              <BrainCircuit className="text-indigo-400" size={20} />
              Gemini API Integration
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              Enter your Google Gemini API Key to enable <b>GenAI analysis</b> for manual simulations. 
            </p>
            <input 
              type="password" 
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Paste your AIza... Gemini Key here"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
            />
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Transactions Processed" 
            value={stats.total} 
            icon={Activity} 
            color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
          />
          <StatCard 
            title="Threats Blocked" 
            value={stats.fraud} 
            icon={Database} 
            color={{ bg: 'bg-red-500', text: 'text-red-500' }} 
          />
          <StatCard 
            title="Est. Fraud Savings" 
            value={`$${stats.blockedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
            icon={ShieldAlert} 
            color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }} 
          />
        </div>

        {/* TRANSACTION SIMULATOR */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg relative overflow-hidden">
          {/* AI Badge */}
          {geminiKey && (
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold flex items-center gap-1">
              <BrainCircuit size={10} />
              GEMINI ACTIVE
            </div>
          )}

          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Transaction Simulator
          </h2>
          <form onSubmit={handleManualSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount ($)</label>
              <input 
                type="number" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="e.g. 5000"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-400 mb-1">Merchant</label>
              <select 
                value={formData.merchant}
                onChange={(e) => setFormData({...formData, merchant: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Amazon">Amazon</option>
                <option value="Uber">Uber</option>
                <option value="Apple Store">Apple Store</option>
                <option value="Unknown Vendor">Unknown Vendor (High Risk)</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-400 mb-1">Location IP</label>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({...prev, isForeignIp: !prev.isForeignIp}))}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  formData.isForeignIp 
                    ? 'bg-red-500/20 border-red-500 text-red-400' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Globe size={16} />
                {formData.isForeignIp ? 'Foreign / Proxy IP' : 'Local / Trusted IP'}
              </button>
            </div>
            <button 
              type="submit"
              disabled={isAnalyzing}
              className={`w-full md:w-auto px-6 py-2 font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                isAnalyzing 
                  ? 'bg-indigo-800 text-indigo-200 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <BrainCircuit size={18} className="animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Simulate
                </>
              )}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg flex flex-col">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-indigo-400" />
              Live Transaction Volume vs Risk Score
            </h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} tickMargin={10} />
                  <YAxis yAxisId="left" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorAmt)" 
                    name="Amount ($)"
                  />
                  <Area 
                    yAxisId="right"
                    type="step" 
                    dataKey="risk" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                    name="Risk Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Panel: Recent Logs & Distribution */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg h-[240px]">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Traffic Composition</h3>
              <div className="w-full h-full flex items-center justify-center -mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex flex-col h-[236px]">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50 rounded-t-xl backdrop-blur">
                <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Live Feed
                </h3>
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                {transactions.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
                {transactions.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Activity className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Waiting for stream...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}