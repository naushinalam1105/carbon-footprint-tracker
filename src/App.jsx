import React, { useState, useEffect } from 'react';
import { 
  Leaf, Car, Lightbulb, Utensils, TrendingUp, AlertCircle, 
  PlusCircle, Trash2, Droplet, Trash, Award, Trees, Zap, 
  Sparkles, CheckCircle2, BarChart3, Sun, Moon, Download, Info, X, CheckSquare, Square
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Enhanced Carbon & Environmental Impact Coefficients
const FACTORS = {
  petrolCar: 0.17,      // kg CO2e per km
  electricCar: 0.05,    // kg CO2e per km
  publicTransit: 0.04,  // kg CO2e per km
  electricity: 0.4,     // kg CO2e per kWh
  meatDiet: 3.0,        // kg CO2e reference day
  veggieDiet: 1.5,      // kg CO2e reference day
  veganDiet: 1.0,       // kg CO2e reference day
  water: 0.0003,        // kg CO2e per liter
  waste: 0.5            // kg CO2e per kg of municipal solid waste
};

export default function App() {
  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('eco_dark_mode');
    return saved ? JSON.parse(saved) : true;
  });

  // Educational Modal State
  const [activeInfoModal, setActiveInfoModal] = useState(null);

  // Application Persistence State
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('carbon_logs_v4');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: 'Mon', transport: 15, transportType: 'petrolCar', energy: 8, food: 'meat', water: 120, waste: 2, offset: 0, total: 8.79 },
      { id: 2, date: 'Tue', transport: 8, transportType: 'publicTransit', energy: 10, food: 'veggie', water: 90, waste: 1, offset: 0, total: 4.88 },
      { id: 3, date: 'Wed', transport: 0, transportType: 'electricCar', energy: 6, food: 'vegan', total: 3.43, water: 100, waste: 0.5, offset: 1.5 }
    ];
  });

  // Offset Simulator State
  const [simulatedOffsets, setSimulatedOffsets] = useState({
    treesPlanted: 0,
    solarHours: 0
  });

  // Community Eco-Challenges State
  const [challenges, setChallenges] = useState([
    { id: 'ch1', text: 'Go completely meat-free today', costSave: 1.5, completed: false },
    { id: 'ch2', text: 'Unplug standby electronics overnight', costSave: 0.8, completed: false },
    { id: 'ch3', text: 'Limit showers down to under 5 minutes', costSave: 0.4, completed: false },
    { id: 'ch4', text: 'Opt to bike or walk short distances instead of driving', costSave: 2.0, completed: false },
  ]);

  // Form Inputs State
  const [date, setDate] = useState('');
  const [transportType, setTransportType] = useState('petrolCar');
  const [distance, setDistance] = useState('');
  const [electricity, setElectricity] = useState('');
  const [diet, setDiet] = useState('veggie');
  const [waterVolume, setWaterVolume] = useState('');
  const [wasteWeight, setWasteWeight] = useState('');

  // Auto-sync persistent states
  useEffect(() => {
    localStorage.setItem('carbon_logs_v4', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('eco_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Handle Log Submission Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !distance || !electricity || !waterVolume || !wasteWeight) {
      alert('Please fill out all standard fields to accurately compute your impact metrics.');
      return;
    }

    const tEmissions = parseFloat(distance) * FACTORS[transportType];
    const eEmissions = parseFloat(electricity) * FACTORS.electricity;
    const wEmissions = parseFloat(waterVolume) * FACTORS.water;
    const wasteEmissions = parseFloat(wasteWeight) * FACTORS.waste;
    
    let fEmissions = FACTORS.veggieDiet;
    if (diet === 'meat') fEmissions = FACTORS.meatDiet;
    if (diet === 'vegan') fEmissions = FACTORS.veganDiet;

    // Deduct savings from completed weekly community challenges
    const challengeSavings = challenges.reduce((sum, ch) => ch.completed ? sum + ch.costSave : sum, 0);

    const baseTotal = (tEmissions + eEmissions + fEmissions + wEmissions + wasteEmissions) - challengeSavings;
    const total = parseFloat(Math.max(0, baseTotal).toFixed(2));

    const newLog = {
      id: Date.now(),
      date,
      transport: parseFloat(distance),
      transportType,
      energy: parseFloat(electricity),
      food: diet,
      water: parseFloat(waterVolume),
      waste: parseFloat(wasteWeight),
      offset: 0,
      total
    };

    setLogs([...logs, newLog]);
    setDistance('');
    setElectricity('');
    setDate('');
    setWaterVolume('');
    setWasteWeight('');
    setActiveTab('dashboard'); 
  };

  const deleteLog = (id) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  // Toggle Community Challenges
  const toggleChallenge = (id) => {
    setChallenges(challenges.map(ch => {
      if (ch.id === id) {
        const nextState = !ch.completed;
        applyInstantOffset(nextState ? ch.costSave : -ch.costSave);
        return { ...ch, completed: nextState };
      }
      return ch;
    }));
  };

  // Data Export Engine Utility
  const exportDataLog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EcoStep_Carbon_Report_${new Date().getFullYear()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Live Offset Appliers
  const addTreeOffset = () => {
    setSimulatedOffsets(prev => ({ ...prev, treesPlanted: prev.treesPlanted + 1 }));
    applyInstantOffset(1.67); 
  };

  const addSolarOffset = () => {
    setSimulatedOffsets(prev => ({ ...prev, solarHours: prev.solarHours + 2 }));
    applyInstantOffset(0.8); 
  };

  const applyInstantOffset = (value) => {
    if (!logs.length) return;
    const updated = [...logs];
    const lastIndex = updated.length - 1;
    updated[lastIndex].offset = parseFloat((updated[lastIndex].offset + value).toFixed(2));
    updated[lastIndex].total = parseFloat(Math.max(0, updated[lastIndex].total - value).toFixed(2));
    setLogs(updated);
  };

  // Gamification & Badges Engine Checking Log Arrays
  const checkBadges = () => {
    const badges = [];
    if (!logs.length) return badges;

    const hasLowFootprint = logs.some(l => l.total <= 4.0);
    if (hasLowFootprint) {
      badges.push({ id: 'hero', name: 'Footprint Hero', desc: 'Maintained a daily log under 4.0 kg CO₂e', color: 'bg-emerald-500', icon: Award });
    }

    const zeroCommute = logs.some(l => l.transport === 0 || l.transportType === 'electricCar');
    if (zeroCommute) {
      badges.push({ id: 'commute', name: 'Green Commuter', desc: 'Logged zero emission transit segments', color: 'bg-blue-500', icon: Car });
    }

    const plantBased = logs.some(l => l.food === 'vegan');
    if (plantBased) {
      badges.push({ id: 'diet', name: 'Plant-Powered', desc: 'Chose a pure vegan profile day', color: 'bg-amber-500', icon: Utensils });
    }

    const activeChallengeCount = challenges.filter(c => c.completed).length;
    if (activeChallengeCount >= 2) {
      badges.push({ id: 'challenge', name: 'Habit Changer', desc: 'Completed 2+ sustainability pledges', color: 'bg-indigo-500', icon: CheckCircle2 });
    }

    return badges;
  };

  const earnedBadges = checkBadges();
  const latestLog = logs[logs.length - 1] || { total: 0, offset: 0 };
  const averageEmissions = logs.length ? (logs.reduce((sum, item) => sum + item.total, 0) / logs.length).toFixed(2) : 0;

  // Real-world equivalency calculations based on EPA carbon models
  const smartphoneCharges = Math.round(latestLog.total * 121.5);
  const plasticBagsBurned = Math.round(latestLog.total * 0.08);

  const getAssessmentColor = (val) => {
    if (val <= 4.0) return 'bg-emerald-500';
    if (val <= 7.5) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // Info Modal Definitions mapping
  const infoData = {
    transit: { title: "Transit Carbon Footprint", desc: "Transportation accounts for roughly 25% of global fuel-based emissions. Internal combustion engines produce dense CO₂ gases, while mass transit divides emissions across hundreds of passengers, radically minimizing your personal footprint." },
    energy: { title: "Grid Energy Burden", desc: "Electricity generated via coal and natural gas emits a silent, continuous environmental tax. Swapping incandescent bulbs for high-efficiency LEDs and shutting down standby draws cuts household operational demand instantly." },
    diet: { title: "Nutritional Footprints", desc: "Livestock agriculture demands heavy land clearing, global supply chains, and releases methane, a gas 28 times more effective at warming the atmosphere than standard carbon dioxide over a 100-year timescale." },
    water: { title: "Volumetric Water Processing", desc: "Water itself doesn't emit carbon, but municipal purification, treatment, delivery plumbing infrastructure, and residential water heating require massive electricity expenditures." },
    waste: { title: "Domestic Solid Refuse", desc: "Decaying waste sealed in commercial municipal landfills shifts structurally into high-density pockets of greenhouse gases. Conscious recycling and organic composting prevent landfill pileups." }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Educational Information Info Overlay Modal */}
      {activeInfoModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4 transform scale-100 transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center border-b pb-2 border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-emerald-500"><Info size={18} /> {infoData[activeInfoModal].title}</h3>
              <button onClick={() => setActiveInfoModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"><X size={16} /></button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">{infoData[activeInfoModal].desc}</p>
          </div>
        </div>
      )}

      {/* Dynamic Header System */}
      <header className={`border-b sticky top-0 z-50 shadow-sm transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-600/20">
              <Leaf size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">EcoStep</h1>
            </div>
          </div>

          {/* Navigation Tab Controllers */}
          <nav className={`hidden md:flex items-center p-1 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'dashboard' ? (darkMode ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}>
              Dashboard Architecture
            </button>
            <button onClick={() => setActiveTab('log')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'log' ? (darkMode ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}>
              Expanded Tracking Engine
            </button>
            <button onClick={() => setActiveTab('offset')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'offset' ? (darkMode ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}>
              Offset Simulator Workspace
            </button>
          </nav>

          {/* Active Actions Toolkit Panel */}
          <div className="flex items-center gap-2">
            <button onClick={exportDataLog} title="Export Logs to JSON" className={`p-2 rounded-xl border transition-all ${darkMode ? 'border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'}`}>
              <Download size={16} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl border transition-all ${darkMode ? 'border-slate-800 bg-slate-800 text-amber-400' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Modern High-End Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white py-12 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto text-center md:text-left md:flex items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
              Empowering Carbon Neutrality
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Measure What Matters. <br />
              <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Reduce What You Can.</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl">
              EcoStep transforms daily habits into environmental data models. Track energy, transport, consumption ecosystems, and neutralize emissions directly inside an automated interactive dashboard framework.
            </p>
          </div>
          <div className="mt-8 md:mt-0 flex gap-3 justify-center">
            <button onClick={() => setActiveTab('log')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-3.5 rounded-xl shadow-lg transition-all transform active:scale-[0.97]">
              Compute Today's Log
            </button>
            <button onClick={() => setActiveTab('offset')} className="bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold uppercase tracking-wider px-5 py-3.5 rounded-xl transition-all">
              Launch Simulator
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Navigation Bar */}
      <div className={`md:hidden flex justify-around border-b p-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 text-xs font-bold rounded-lg ${activeTab === 'dashboard' ? 'bg-emerald-900/20 text-emerald-400' : 'text-slate-500'}`}>Dashboard</button>
        <button onClick={() => setActiveTab('log')} className={`p-2 text-xs font-bold rounded-lg ${activeTab === 'log' ? 'bg-emerald-900/20 text-emerald-400' : 'text-slate-500'}`}>Log Engine</button>
        <button onClick={() => setActiveTab('offset')} className={`p-2 text-xs font-bold rounded-lg ${activeTab === 'offset' ? 'bg-emerald-900/20 text-emerald-400' : 'text-slate-500'}`}>Offset Area</button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* VIEW ONE: CORE ANALYTICAL DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-slide-down grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2 space-y-8">
              
              {/* Strategic Analytics Summary Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-6 rounded-2xl border shadow-sm flex items-start justify-between ${darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200/80'}`}>
                  <div>
                    <p className="text-sm font-bold text-slate-400 tracking-wide">Net Active Footprint</p>
                    <h3 className="text-3xl font-black mt-2">{latestLog.total} <span className="text-xs font-bold text-slate-400">kg CO₂e</span></h3>
                    {latestLog.offset > 0 && <p className="text-xs text-purple-400 font-semibold mt-1">(-{latestLog.offset}kg compensated)</p>}
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl"><Leaf size={18} /></div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm flex items-start justify-between ${darkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200/80'}`}>
                  <div>
                    <p className="text-sm font-bold text-slate-400 tracking-wide">Historical Average</p>
                    <h3 className="text-3xl font-black mt-2">{averageEmissions} <span className="text-xs font-bold text-slate-400">kg CO₂e</span></h3>
                  </div>
                  <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl"><BarChart3 size={18} /></div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm flex items-start justify-between bg-gradient-to-br ${darkMode ? 'from-slate-900 to-emerald-950/20 border-emerald-900/50' : 'from-white to-emerald-50/20 border-emerald-200'}`}>
                  <div>
                    <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Climate Goal Limit</p>
                    <h3 className="text-3xl font-black mt-2 text-emerald-500">4.00 <span className="text-xs font-bold text-emerald-600/70">kg / day</span></h3>
                  </div>
                  <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md"><Zap size={18} /></div>
                </div>
              </div>

              {/* Real-World Visual Equivalencies Module */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div className="text-amber-500 text-2xl font-black">📱</div>
                  <div>
                    <h5 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Smartphone Charge Equivalent</h5>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">{smartphoneCharges} Total Device Cycles</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div className="text-rose-500 text-2xl font-black">🛍️</div>
                  <div>
                    <h5 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Incinerated Plastic Equivalent</h5>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">{plasticBagsBurned} Commercial Refuse Bags</p>
                  </div>
                </div>
              </div>

              {/* Assessment Gauge Bar */}
              <div className={`p-6 rounded-2xl border shadow-sm space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Boundary Gauge Diagnostics</h4>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {latestLog.total <= 4.0 ? 'Sustainable Environment Vector' : latestLog.total <= 7.5 ? 'Warning Threshold Boundary' : 'Critical Carbon Footprint Tier'}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <div className={`h-full transition-all duration-500 ${getAssessmentColor(latestLog.total)}`} style={{ width: `${Math.min(100, (latestLog.total / 12) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>0.0kg (Optimal Target)</span>
                  <span>4.0kg (Boundary)</span>
                  <span>12.0kg+ (Extreme Risk)</span>
                </div>
              </div>

              {/* High-Fidelity Area Vector Chart Component */}
              <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div>
                  <h3 className="text-lg font-bold">Structural Emissions Overview</h3>
                  <p className="text-xs text-slate-400 font-medium">Visual representation of gross active footprint output logs</p>
                </div>
                <div className="h-64 w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#fff', color: darkMode ? '#fff' : '#000', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="total" name="Net Emissions (kg)" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Table Log View */}
              <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold">Logged Tracking Timeline</h3>
                  <span className="text-xs text-slate-400 font-medium">{logs.length} Total Logs</span>
                </div>
                {logs.length === 0 ? (
                  <p className="text-sm text-slate-400 p-8 text-center">Data pipeline empty. Switch tabs to initialize metric logs.</p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map((log) => (
                      <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                            <span>{log.date}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold">{log.total} kg CO₂e</p>
                            <p className="text-xs text-slate-400 font-medium">
                              Transit: {log.transport}km | Energy: {log.energy}kWh | Water: {log.water || 0}L | Waste: {log.waste || 0}kg
                            </p>
                          </div>
                        </div>
                        <button onClick={() => deleteLog(log.id)} className="text-slate-400 hover:text-red-500 p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-8">
              <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="text-indigo-500" size={20} />
                  <h3 className="font-bold text-base">Weekly Eco-Challenges</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 font-medium">Pledge active reductions to immediately lower your operational carbon indices.</p>
                <div className="space-y-2.5">
                  {challenges.map((ch) => (
                    <button key={ch.id} onClick={() => toggleChallenge(ch.id)} className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all ${ch.completed ? (darkMode ? 'bg-indigo-950/20 border-indigo-950 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-800') : (darkMode ? 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100')}`}>
                      <div className="mt-0.5 text-indigo-500">{ch.completed ? <CheckSquare size={16} /> : <Square size={16} />}</div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${ch.completed ? 'line-through opacity-80' : ''}`}>{ch.text}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">-{ch.costSave}kg CO₂e Advantage</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="text-amber-500" size={20} />
                  <h3 className="font-bold text-base">Earned Eco-Achievements</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 font-medium">Dynamic micro-rewards triggered by smart sustainable daily thresholds.</p>
                {earnedBadges.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 font-semibold">No badges unlocked yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {earnedBadges.map((badge) => {
                      const IconComponent = badge.icon;
                      return (
                        <div key={badge.id} className={`flex items-center gap-3.5 p-3 rounded-xl border transform hover:translate-x-1 transition-all ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                          <div className={`p-2.5 rounded-xl text-white ${badge.color} shadow-sm`}><IconComponent size={16} /></div>
                          <div>
                            <h4 className="text-xs font-bold flex items-center gap-1">{badge.name} <CheckCircle2 size={12} className="text-emerald-500 inline" /></h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{badge.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW TWO: EXPANDED TRACKING ENGINE FORM */}
        {activeTab === 'log' && (
          <div className={`animate-slide-down max-w-2xl mx-auto p-8 rounded-3xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <PlusCircle className="text-emerald-500" size={24} />
              <div>
                <h3 className="font-black text-xl">Compile Environmental Logs</h3>
                <p className="text-xs text-slate-400 font-medium">Provision metrics down to compute multi-vector carbon impacts</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Day/Timeline Identifier</label>
                  <input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g., Mon, Day 1" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                    Daily Nutritional Profile
                    <button type="button" onClick={() => setActiveInfoModal('diet')} className="text-slate-400 hover:text-slate-600"><Info size={12} /></button>
                  </label>
                  <select value={diet} onChange={(e) => setDiet(e.target.value)} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <option value="meat">Omnivore (Heavy Meat Content)</option>
                    <option value="veggie">Vegetarian (Dairy / Plant Blend)</option>
                    <option value="vegan">Pure Plant-Based (Low Impact)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  Transit Mode Profile
                  <button type="button" onClick={() => setActiveInfoModal('transit')} className="text-slate-400 hover:text-slate-600"><Info size={12} /></button>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'petrolCar', label: 'Combustion Engine', icon: Car },
                    { id: 'electricCar', label: 'Electric Vehicle', icon: Zap },
                    { id: 'publicTransit', label: 'Mass Transit Network', icon: Lightbulb }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.id} type="button" onClick={() => setTransportType(item.id)} className={`p-3.5 rounded-xl border flex flex-col items-center text-center gap-2 font-semibold transition-all ${transportType === item.id ? 'border-emerald-600 bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/25' : (darkMode ? 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50')}`}>
                        <Icon size={16} />
                        <span className="text-[10px] tracking-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Transit Distance (kilometers)</label>
                  <div className="relative">
                    <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="0" className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                    <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400">KM</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                    Grid Electricity Consumed (kilowatt hours)
                    <button type="button" onClick={() => setActiveInfoModal('energy')} className="text-slate-400 hover:text-slate-600"><Info size={12} /></button>
                  </label>
                  <div className="relative">
                    <input type="number" value={electricity} onChange={(e) => setElectricity(e.target.value)} placeholder="0" className={`w-full pl-4 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                    <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400">kWh</span>
                  </div>
                </div>
              </div>

              <div className={`border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Droplet size={12} className="text-blue-500" /> Direct Water Volumetric (Liters)</span>
                    <button type="button" onClick={() => setActiveInfoModal('water')} className="text-slate-400 hover:text-slate-600"><Info size={12} /></button>
                  </label>
                  <input type="number" value={waterVolume} onChange={(e) => setWaterVolume(e.target.value)} placeholder="e.g., 150" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                    <span className="flex items-center gap-1"><Trash size={12} className="text-slate-400" /> Solid Domestic Waste Weight (kg)</span>
                    <button type="button" onClick={() => setActiveInfoModal('waste')} className="text-slate-400 hover:text-slate-600"><Info size={12} /></button>
                  </label>
                  <input type="number" value={wasteWeight} onChange={(e) => setWasteWeight(e.target.value)} placeholder="e.g., 2" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs font-semibold transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`} />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs py-4 px-4 rounded-xl shadow-md transition-all mt-4 transform active:scale-[0.98]">
                Compile And Commit Metrics
              </button>
            </form>
          </div>
        )}

        {/* VIEW THREE: OFFSET SIMULATOR */}
        {activeTab === 'offset' && (
          <div className="animate-slide-down max-w-4xl mx-auto space-y-8">
            <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <h3 className="font-black text-xl">Interactive Impact Neutralization Deck</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Simulate mitigation offsets. Watch your scores adapt dynamically.</p>
              </div>
              <div className={`border p-4 rounded-2xl text-center md:text-right min-w-[200px] ${darkMode ? 'bg-purple-950/20 border-purple-900' : 'bg-purple-50 border-purple-200'}`}>
                <p className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">Active Day Carbon Pool</p>
                <p className="text-2xl font-black text-purple-500 mt-1">{latestLog.total || 0} <span className="text-xs font-bold text-purple-400">kg CO₂e</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner"><Trees size={22} /></div>
                  <h4 className="font-extrabold text-base">Afforestation / Canopy Sequestration</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Each active tree vector pulls 1.67kg CO₂ clean monthly.</p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">Simulated Multipliers: <span className="text-emerald-500 font-black">{simulatedOffsets.treesPlanted} Units</span></span>
                  <button onClick={addTreeOffset} disabled={!logs.length || latestLog.total === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-800 disabled:text-slate-600 text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all shadow-sm">Deploy Tree Vector</button>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner"><Zap size={22} /></div>
                  <h4 className="font-extrabold text-base">Clean Renewable Grid Integration</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Each solar hour unit offsets approximately 0.8kg of emissions.</p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">Simulated Hours: <span className="text-amber-500 font-black">{simulatedOffsets.solarHours} Hours</span></span>
                  <button onClick={addSolarOffset} disabled={!logs.length || latestLog.total === 0} className="bg-amber-600 hover:bg-amber-700 text-white disabled:bg-slate-800 disabled:text-slate-600 text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all shadow-sm">Inject Grid Solar</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}