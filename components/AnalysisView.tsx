
import React, { useState } from 'react';
import { Transaction, MLPrediction } from '../types';
import { analyzeTransaction } from '../services/geminiService';

interface AnalysisViewProps {
    onAnalysisComplete: (prediction: MLPrediction, tx: Transaction) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ onAnalysisComplete }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: 250,
        merchant: 'Global Luxury Store',
        location: 'Paris, France',
        v1: 0.5,
        v2: -1.2,
        v3: 0.8
    });

    const [prediction, setPrediction] = useState<MLPrediction | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        const tx: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            amount: formData.amount,
            merchant: formData.merchant,
            location: formData.location,
            v1: formData.v1,
            v2: formData.v2,
            v3: formData.v3,
            status: 'pending',
            riskScore: 0
        };

        try {
            const result = await analyzeTransaction(tx);
            setPrediction(result);
            onAnalysisComplete(result, tx);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6">Simulation Sandbox</h3>
                <p className="text-sm text-slate-400 mb-8">Manually input transaction features to test the SentinAI classification engine.</p>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Transaction Amount ($)</label>
                            <input 
                                type="number" 
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Merchant Entity</label>
                            <input 
                                type="text" 
                                value={formData.merchant}
                                onChange={(e) => setFormData({...formData, merchant: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Geographical Context</label>
                        <input 
                            type="text" 
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'v1', label: 'V1: Geo-Distance' },
                            { id: 'v2', label: 'V2: Freq-Score' },
                            { id: 'v3', label: 'V3: Device-Trust' }
                        ].map((v) => (
                            <div key={v.id} className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">{v.label}</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={formData[v.id as keyof typeof formData]}
                                    onChange={(e) => setFormData({...formData, [v.id]: Number(e.target.value)})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all ${
                            loading 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        }`}
                    >
                        {loading ? 'Running AI Inference...' : 'Analyze Risk Profile'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col">
                {!prediction ? (
                    <div className="flex-1 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-50">
                        <div className="text-4xl mb-4">🤖</div>
                        <h4 className="text-lg font-semibold text-slate-400">Waiting for Input</h4>
                        <p className="text-xs text-slate-500 max-w-xs mt-2">Complete the form and run inference to see a detailed machine learning analysis.</p>
                    </div>
                ) : (
                    <div className={`flex-1 p-8 rounded-3xl border animate-in fade-in duration-500 ${
                        prediction.isFraud ? 'bg-red-950/20 border-red-500/30' : 'bg-green-950/20 border-green-500/30'
                    }`}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Inference Result</h4>
                                <h3 className={`text-2xl font-black italic tracking-tighter ${prediction.isFraud ? 'text-red-500' : 'text-green-500'}`}>
                                    {prediction.isFraud ? 'DETECTED: FRAUD' : 'SYSTEM: APPROVED'}
                                </h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Risk Confidence</p>
                                <p className="text-2xl font-mono font-bold text-white">{(prediction.confidence * 100).toFixed(1)}%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Internal Risk Score</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-white">{prediction.riskScore}</span>
                                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${prediction.riskScore > 70 ? 'bg-red-500' : 'bg-green-500'}`} 
                                            style={{ width: `${prediction.riskScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Merchant Grade</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🏬</span>
                                    <span className="text-sm font-semibold text-slate-300">Analysis complete</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-slate-500 uppercase">Detection Reasons</h5>
                            <div className="space-y-2">
                                {prediction.reasons.map((reason, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
                                        <span className="text-indigo-400 mt-0.5">•</span>
                                        <p className="text-xs text-slate-300 leading-relaxed">{reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800">
                             <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2">AI Summary</h5>
                             <p className="text-xs text-slate-400 italic leading-relaxed">{prediction.explanation}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisView;
