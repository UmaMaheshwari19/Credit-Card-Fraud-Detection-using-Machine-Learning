
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AnalysisView from './components/AnalysisView';
import { Transaction, ViewType, MLPrediction } from './types';
import { generateMockTransactions } from './services/geminiService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const initData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await generateMockTransactions(10);
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewAnalysis = (prediction: MLPrediction, tx: Transaction) => {
    const enrichedTx: Transaction = {
        ...tx,
        status: prediction.isFraud ? 'fraud' : prediction.riskScore > 40 ? 'flagged' : 'approved',
        riskScore: prediction.riskScore,
        analysis: prediction.explanation
    };
    setTransactions(prev => [enrichedTx, ...prev]);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Loading SentinAI Ecosystem...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'transactions':
        return <TransactionList transactions={transactions} onSelect={setSelectedTx} />;
      case 'analysis':
        return <AnalysisView onAnalysisComplete={handleNewAnalysis} />;
      case 'settings':
        return (
            <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-6">System Configuration</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-slate-200">Auto-blocking threshold</p>
                            <p className="text-xs text-slate-500">Transactions above this risk score are blocked automatically.</p>
                        </div>
                        <input type="range" className="accent-indigo-500" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-slate-200">Email Alerts</p>
                            <p className="text-xs text-slate-500">Notify admin when high-confidence fraud is detected.</p>
                        </div>
                        <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center px-1">
                            <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-800">
                        <button 
                            onClick={() => setTransactions([])}
                            className="text-xs text-red-400 hover:text-red-300 font-bold uppercase"
                        >
                            Reset Global Transaction Log
                        </button>
                    </div>
                </div>
            </div>
        );
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {renderContent()}

      {/* Detail Modal Overlay */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Transaction Intelligence</h3>
              <button onClick={() => setSelectedTx(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Amount</p>
                <p className="text-xl font-bold text-white">${selectedTx.amount.toLocaleString()}</p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Fraud Risk</p>
                <p className={`text-xl font-bold ${selectedTx.riskScore > 70 ? 'text-red-500' : 'text-green-500'}`}>{selectedTx.riskScore}%</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-400 leading-relaxed mb-8">
                <p><strong className="text-slate-200">Merchant:</strong> {selectedTx.merchant}</p>
                <p><strong className="text-slate-200">Location:</strong> {selectedTx.location}</p>
                <p><strong className="text-slate-200">Behavioral Markers:</strong> V1:{selectedTx.v1.toFixed(2)} | V2:{selectedTx.v2.toFixed(2)} | V3:{selectedTx.v3.toFixed(2)}</p>
                {selectedTx.analysis && (
                    <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20 mt-4">
                        <p className="text-xs text-indigo-300 italic">" {selectedTx.analysis} "</p>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors">Confirm Legit</button>
              <button className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 transition-colors">Mark as Fraud</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
