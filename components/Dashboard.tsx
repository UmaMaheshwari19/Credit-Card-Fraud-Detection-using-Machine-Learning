
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { Transaction } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const stats = useMemo(() => {
    const total = transactions.length;
    const fraudCount = transactions.filter(t => t.status === 'fraud').length;
    const flaggedCount = transactions.filter(t => t.status === 'flagged').length;
    const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
    const avgRisk = transactions.reduce((acc, t) => acc + t.riskScore, 0) / (total || 1);

    return { total, fraudCount, flaggedCount, totalVolume, avgRisk };
  }, [transactions]);

  const chartData = useMemo(() => {
    // Group transactions by hour
    const last24h = Array.from({ length: 12 }, (_, i) => ({
      hour: `${(i * 2)}h`,
      amount: 0,
      risk: 0
    }));

    transactions.forEach(t => {
      const idx = Math.floor((Math.random() * 11)); // Simplified for demo
      last24h[idx].amount += t.amount;
      last24h[idx].risk = Math.max(last24h[idx].risk, t.riskScore);
    });

    return last24h;
  }, [transactions]);

  const pieData = [
    { name: 'Legitimate', value: transactions.filter(t => t.status === 'approved').length, color: '#10b981' },
    { name: 'Fraudulent', value: transactions.filter(t => t.status === 'fraud').length, color: '#ef4444' },
    { name: 'Flagged', value: transactions.filter(t => t.status === 'flagged').length, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: `$${stats.totalVolume.toLocaleString()}`, sub: 'Last 24 hours', color: 'indigo' },
          { label: 'Fraud Detection Rate', value: `${((stats.fraudCount / stats.total) * 100 || 0).toFixed(1)}%`, sub: `${stats.fraudCount} threats blocked`, color: 'red' },
          { label: 'Average Risk Score', value: stats.avgRisk.toFixed(1), sub: 'AI evaluation avg', color: 'amber' },
          { label: 'Total Transactions', value: stats.total, sub: 'Processed by engine', color: 'slate' }
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-white">{s.value}</h3>
              <span className={`text-[10px] font-bold pb-1 text-${s.color}-500`}>+2.4%</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Activity Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-semibold text-slate-200">Transaction Volume & Risk Trend</h3>
            <select className="bg-slate-800 border-none text-xs text-slate-300 rounded-lg px-2 py-1 outline-none">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-200 mb-8">Status Distribution</h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{transactions.length}</span>
                <span className="text-[10px] text-slate-500 uppercase">Total</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </div>
                <span className="font-semibold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
