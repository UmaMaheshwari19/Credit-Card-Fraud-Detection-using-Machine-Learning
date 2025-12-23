
import React from 'react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onSelect: (t: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onSelect }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Real-time Transaction Stream</h3>
        <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="Search merchant or location..." 
                className="bg-slate-800 border-none text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
            />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Merchant</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Score</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {transactions.map((t) => (
              <tr 
                key={t.id} 
                className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                onClick={() => onSelect(t)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      {t.merchant[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{t.merchant}</p>
                      <p className="text-[10px] text-slate-500">ID: {t.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-slate-400 font-medium">{t.location}</p>
                  <p className="text-[10px] text-slate-500">{new Date(t.timestamp).toLocaleTimeString()}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-200">${t.amount.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          t.riskScore > 75 ? 'bg-red-500' : t.riskScore > 40 ? 'bg-amber-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${t.riskScore}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{t.riskScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    t.status === 'fraud' 
                      ? 'bg-red-500/10 text-red-500' 
                      : t.status === 'flagged' 
                        ? 'bg-amber-500/10 text-amber-500' 
                        : 'bg-green-500/10 text-green-500'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
