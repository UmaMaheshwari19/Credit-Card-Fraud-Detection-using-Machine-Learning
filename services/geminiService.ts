
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, MLPrediction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const PROMPT_INSTRUCTION = `You are a world-class Financial Fraud Detection Machine Learning Model. 
Your task is to analyze credit card transaction data and predict whether it is fraudulent.
Input features include transaction amount, anonymized behavioral scores (V1, V2, V3), merchant info, and location.

Evaluate the following:
1. Amount anomalies (unusually high).
2. Behavioral anomalies based on V-features.
3. Merchant risk profiles.

Return a JSON object containing the classification results.`;

export const analyzeTransaction = async (transaction: Transaction): Promise<MLPrediction> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this transaction: ${JSON.stringify(transaction)}`,
    config: {
      systemInstruction: PROMPT_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isFraud: { type: Type.BOOLEAN },
          confidence: { type: Type.NUMBER, description: "0 to 1 confidence level" },
          riskScore: { type: Type.NUMBER, description: "0 to 100 risk score" },
          reasons: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          explanation: { type: Type.STRING }
        },
        required: ["isFraud", "confidence", "riskScore", "reasons", "explanation"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}");
  return result as MLPrediction;
};

export const generateMockTransactions = async (count: number): Promise<Transaction[]> => {
    // We use Gemini to generate a realistic looking mix of fraud and non-fraud data for the dashboard
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate ${count} diverse and realistic credit card transactions as an array of objects. 
        Include some obvious fraud (high amount, weird location), some subtle fraud, and many legitimate ones.
        Fields: id (uuid), timestamp (last 24h), amount (0.99 to 5000), location (City, Country), merchant (Brand), v1-v3 (-2 to 2).`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        timestamp: { type: Type.NUMBER },
                        amount: { type: Type.NUMBER },
                        location: { type: Type.STRING },
                        merchant: { type: Type.STRING },
                        v1: { type: Type.NUMBER },
                        v2: { type: Type.NUMBER },
                        v3: { type: Type.NUMBER },
                        status: { type: Type.STRING, enum: ['approved', 'fraud', 'flagged'] },
                        riskScore: { type: Type.NUMBER }
                    },
                    required: ["id", "timestamp", "amount", "location", "merchant", "v1", "v2", "v3", "status", "riskScore"]
                }
            }
        }
    });

    return JSON.parse(response.text || "[]");
};
