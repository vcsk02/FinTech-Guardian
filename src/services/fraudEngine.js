// This simulates a trained Isolation Forest model running in the browser.
// It moves the "Intelligence" to the Edge (Client-side) to reduce latency
// and server costs—a key "Cloud-Native" optimization pattern.

export class FraudInferenceEngine {
  constructor() {
    this.history = []; // Keep a short history for moving average
    this.maxHistory = 50;
  }

  /**
   * Calculates the Z-Score (Standard Score) to detect statistical outliers.
   * Z = (Value - Mean) / Standard Deviation
   */
  calculateZScore(value) {
    if (this.history.length < 5) return 0; // Need enough data points to be statistically significant

    // 1. Calculate Mean
    const mean = this.history.reduce((a, b) => a + b, 0) / this.history.length;
    
    // 2. Calculate Variance
    const variance = this.history
      .map(x => Math.pow(x - mean, 2))
      .reduce((a, b) => a + b, 0) / this.history.length;
      
    // 3. Calculate Standard Deviation
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0; // Prevent division by zero
    
    return (value - mean) / stdDev;
  }

  /**
   * Main inference method.
   * Takes a raw transaction and returns an enriched transaction with fraud scores.
   * @param {Object} transaction - The raw transaction object
   */
  analyze(transaction) {
    // 1. Feature Engineering (Extracting relevant data)
    const amount = transaction.amount;
    
    // 2. Statistical Anomaly Detection (Z-Score)
    const zScore = this.calculateZScore(amount);
    
    // Update history (rolling window)
    this.history.push(amount);
    if (this.history.length > this.maxHistory) {
        this.history.shift();
    }

    // 3. Rule-Based Filters (Heuristics)
    // These simulate "Business Rules" that often accompany ML models in production
    let riskScore = 0;
    let reasons = [];

    // Rule A: Statistical Outlier (Z-Score > 2.5 means 99% probability of anomaly)
    if (Math.abs(zScore) > 2.5) {
      riskScore += 40;
      reasons.push("Statistical Outlier (High Amount)");
    }

    // Rule B: Velocity Check (Simulated high frequency)
    // In a real app, 'velocity' would be calculated by querying the DB for recent txns from this user
    if (transaction.velocity > 0.8) { 
      riskScore += 30;
      reasons.push("High Velocity Burst");
    }

    // Rule C: Location/IP Risk (Simulated)
    if (transaction.isForeignIp) {
      riskScore += 25;
      reasons.push("Foreign IP Block");
    }

    // Rule D: Amount Threshold (Simple heuristic)
    if (amount > 4500) {
        riskScore += 10;
        reasons.push("Exceeds High Value Limit");
    }

    // Final Classification
    // We cap the score at 100
    const finalRiskScore = Math.min(riskScore, 100);
    const isFraud = finalRiskScore > 50;
    
    return {
      ...transaction,
      riskScore: finalRiskScore,
      isFraud,
      reasons,
      analyzedAt: new Date().toISOString()
    };
  }
}

// Export a singleton instance so the history persists across function calls
// This ensures that previous transactions influence the "Average" calculation for future ones
export const mlEngine = new FraudInferenceEngine();