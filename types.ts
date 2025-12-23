
export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  location: string;
  merchant: string;
  v1: number; // Anonymized feature 1 (e.g. distance from home)
  v2: number; // Anonymized feature 2 (e.g. transaction frequency)
  v3: number; // Anonymized feature 3 (e.g. device fingerprint)
  status: 'pending' | 'approved' | 'fraud' | 'flagged';
  riskScore: number;
  analysis?: string;
}

export interface MLPrediction {
  isFraud: boolean;
  confidence: number;
  riskScore: number;
  reasons: string[];
  explanation: string;
}

export type ViewType = 'dashboard' | 'transactions' | 'analysis' | 'settings';
