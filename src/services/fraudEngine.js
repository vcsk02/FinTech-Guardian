export class FraudInferenceEngine {
  constructor() {
    this.history = []; 
    this.maxHistory = 50;
  }

  /**
   * EXISTING: Heuristic/Math-based analysis (Fast, for the stream)
   */
  analyze(transaction) {
    const amount = transaction.amount;
    
    // Z-Score Math
    let mean = 0, stdDev = 1;
    if (this.history.length > 5) {
      mean = this.history.reduce((a, b) => a + b, 0) / this.history.length;
      const variance = this.history.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / this.history.length;
      stdDev = Math.sqrt(variance) || 1;
    }
    const zScore = (amount - mean) / stdDev;
    
    // Update history
    this.history.push(amount);
    if (this.history.length > this.maxHistory) this.history.shift();

    // Heuristic Rules
    let riskScore = 0;
    let reasons = [];

    if (Math.abs(zScore) > 2.5) {
      riskScore += 40;
      reasons.push("Statistical Outlier");
    }
    if (transaction.velocity > 0.8) { 
      riskScore += 30;
      reasons.push("High Velocity");
    }
    if (transaction.isForeignIp) {
      riskScore += 25;
      reasons.push("Foreign IP");
    }
    if (amount > 4500) {
        riskScore += 10;
        reasons.push("High Value");
    }

    const finalRiskScore = Math.min(riskScore, 100);
    
    return {
      ...transaction,
      riskScore: finalRiskScore,
      isFraud: finalRiskScore > 50,
      reasons,
      analysisType: 'Heuristic (Edge)',
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * NEW: Gemini AI Analysis (Accurate, for Manual Review)
   */
  async analyzeWithGemini(transaction, apiKey) {
    const prompt = `
      Act as a financial security expert. Analyze this transaction for fraud.
      
      Transaction Details:
      - Amount: $${transaction.amount}
      - Merchant: ${transaction.merchant}
      - Location: ${transaction.location}
      - Foreign IP: ${transaction.isForeignIp}
      - Velocity Score: ${transaction.velocity}
      
      Context: Typical user spends $20-$200 in New York/US.
      
      Return valid JSON only:
      {
        "riskScore": (integer 0-100),
        "isFraud": (boolean),
        "reasons": (array of short strings explaining why)
      }
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      // Clean up markdown code blocks if Gemini adds them
      const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanJson);

      return {
        ...transaction,
        riskScore: result.riskScore,
        isFraud: result.isFraud,
        reasons: result.reasons,
        analysisType: 'Gemini AI (Cloud)',
        analyzedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error("Gemini API Error:", error);
      // Fallback to heuristic if AI fails
      return this.analyze(transaction);
    }
  }
}

export const mlEngine = new FraudInferenceEngine();