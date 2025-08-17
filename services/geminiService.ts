import { Bond } from '../types';

// This is a mock implementation. In a real app, API calls would be made
// from a secure backend server, not the frontend.

const MOCK_API_DELAY = 1500;

const createGeneralAnalysisPrompt = (): string => {
  return `
  Provide a concise market analysis for the Indian corporate bond market today from an Econophysics perspective. Cover the following points:
  1.  **Overall Market Sentiment:** (e.g., Bullish, Bearish, Neutral) and the primary reasons based on agent behavior.
  2.  **Key Economic Drivers:** Analyze the impact of recent RBI announcements, inflation data, and global economic trends (like US Fed rates).
  3.  **Sector Spotlight:** Highlight the performance and outlook for two key sectors (e.g., Banking, Infrastructure, Renewables).
  4.  **Yield Curve Analysis:** Briefly describe the current state of the yield curve (e.g., steepening, flattening) and its implications.
  5.  **Outlook & Strategy:** Provide a brief outlook for the next quarter and a suggested strategy for a moderate-risk investor.

  Format the response in clear, well-structured markdown.
  `;
};

const createLiquidityAnalysisPrompt = (): string => {
  return `
  Based on order book depth, bid-ask spreads, and trading volume, provide a "Market Liquidity Score" for the Indian corporate bond market.
  - The score should be between 0 (highly illiquid, difficult to trade) and 100 (highly liquid, easy to trade).
  - A healthy market has a score above 70.
  - Provide the score and a brief one-sentence explanation of what it means for an investor.
  
  Example format: **85/100 (High Liquidity)** - The market has deep order books and tight spreads, allowing investors to trade assets quickly with minimal price impact.
  `;
};

const createBondSpecificAnalysisPrompt = (bond: Bond): string => {
  return `
  Provide a detailed investment analysis for the following Indian corporate bond:
  - Bond Name: ${bond.name}
  - Issuer: ${bond.issuer}
  - ISIN: ${bond.isin}
  - Coupon: ${bond.coupon}%
  - Maturity: ${bond.maturityDate}
  - Credit Rating: ${bond.creditRating}
  - Current Market Price: ₹${bond.currentPrice}
  - Quantum-Enhanced Fair Value Estimate: ₹${bond.aiFairValue}

  Based on this data, please provide:
  1.  **Credit Quality Assessment:** A brief analysis of the issuer's creditworthiness and the significance of its ${bond.creditRating} rating.
  2.  **Valuation Analysis:** Compare the current market price to the Quantum-Enhanced fair value. Is it potentially overvalued, undervalued, or fairly priced? Explain why.
  3.  **Risk Profile:** What are the primary risks associated with this bond (e.g., interest rate risk, credit risk, liquidity risk)?
  4.  **Investment Thesis Summary:** A concluding paragraph on whether this bond appears to be a suitable investment for a retail investor with a moderate risk appetite.

  Format the response in clear, well-structured markdown.
  `;
};

const createDeepDiveAnalysisPrompt = (bond: Bond): string => {
  return `
  Simulate a real-time web search and financial data analysis to provide a deep-dive report on the issuer of the following bond:
  - Issuer: ${bond.issuer}
  - ISIN: ${bond.isin}
  - Credit Rating: ${bond.creditRating}

  Generate a detailed report covering these three sections:
  
  ### Issuer Profile
  - **Company Background:** Briefly describe the company's history, core business operations, and its position within its industry.
  - **Market Position:** Discuss its market share, competitive advantages, and any significant strategic initiatives.

  ### Financial Health
  - **Key Metrics:** Provide realistic, recent (simulated for the last fiscal year) financial metrics: Revenue, Net Profit, and a key credit metric like Debt-to-Equity Ratio.
  - **Analyst Consensus:** Briefly summarize a fictional analyst consensus on the issuer's financial stability and growth prospects (e.g., "Analysts maintain a 'Stable' outlook...").

  ### Recent News & Events
  - **Headlines:** Generate 2-3 realistic, recent news headlines that could impact the issuer's creditworthiness (e.g., "Company X announces record profits," "Regulatory changes impact Sector Y," "New expansion project launched").
  - **Impact Analysis:** Briefly explain the potential positive or negative impact of these events on the issuer and its bonds.

  Format the entire response in clear, well-structured markdown.
  `;
};

const createMarketNewsAnalysisPrompt = (): string => {
    return `
    Analyze today's top financial news relevant to the Indian bond market. Provide a summary of 3 key stories. For each story:
    1.  **Headline:** A clear, concise headline.
    2.  **Summary:** A one-sentence summary of the news.
    3.  **Impact Analysis:** A brief analysis of the potential impact (Positive, Negative, or Neutral) on specific sectors (e.g., Banking, Infra, Tech, PSUs).

    Format the response as well-structured markdown, using headings and bullet points.
    `;
};


const mockGeneralAnalysisResponse = `
### Indian Corporate Bond Market Analysis

**1. Overall Market Sentiment: Cautiously Optimistic**
The market is currently exhibiting a cautiously optimistic sentiment. While underlying economic fundamentals remain strong, participants are watchful of global macroeconomic cues and domestic inflation data. Agent-based models suggest a low probability of herd-like selling behavior.

**2. Key Economic Drivers:**
*   **RBI Monetary Policy:** The Reserve Bank of India's recent stance on holding policy rates steady has provided a degree of stability. Future rate decisions will be a key market driver.
*   **Inflation Trajectory:** Cooling inflation is positive for bond prices, but any unexpected rise could introduce volatility.
*   **FII Inflows:** Steady inflows from Foreign Institutional Investors into Indian debt have supported demand.

**3. Sector Spotlight:**
*   **Financials (BFSI):** Bonds from top-tier banks and NBFCs continue to see high demand due to their strong credit profiles.
*   **Infrastructure:** Government focus on infrastructure spending is creating attractive opportunities in this sector, though these are typically longer-duration papers.

**4. Yield Curve Analysis:**
The yield curve is currently in a mild contango, with a slight steepening observed in the longer tenures, suggesting market expectation of stable long-term growth.

**5. Outlook & Strategy:**
The outlook for the next quarter remains stable. We anticipate yields to trade in a narrow range. A 'barbell' strategy, focusing on a mix of short-term and long-term high-quality bonds, could be beneficial.
`;


const mockBondSpecificAnalysisResponse = (bond: Bond) => `
### Investment Analysis: ${bond.name}

**1. Credit Quality Assessment:**
${bond.issuer} holds a **${bond.creditRating}** rating, which signifies a very strong capacity to meet its financial commitments. Issuers with this rating are considered high-quality and carry a low credit risk, making this a relatively safe investment from a default perspective.

**2. Valuation Analysis:**
The bond is currently trading at **₹${bond.currentPrice}**, while our Quantum-Enhanced model estimates its fair value at **₹${bond.aiFairValue}**. This suggests the bond may be **slightly undervalued** in the current market. This valuation, derived from quantum statistical models, accounts for non-classical market behaviors, presenting a potential entry point for investors.

**3. Risk Profile:**
*   **Interest Rate Risk:** As with any fixed-income instrument, if the RBI were to raise interest rates, the price of this bond would likely decrease.
*   **Liquidity Risk:** While issued by a major corporation, this specific bond may have lower trading volumes compared to government securities, which could make it harder to sell instantly without a price concession.

**4. Investment Thesis Summary:**
For a retail investor with a moderate risk appetite, this bond presents a compelling case. It offers a relatively high coupon from a top-rated issuer and appears to be trading at a slight discount to its quantum-derived fair value. It is a solid choice for investors seeking stable income with low default risk.
`;

const mockDeepDiveAnalysisResponse = (bond: Bond) => `
### Issuer Profile
- **Company Background:** ${bond.issuer} is a leading conglomerate in India with operations spanning across energy, petrochemicals, natural gas, retail, and telecommunications. Founded decades ago, it has grown to become one of the country's most valuable companies by market capitalization.
- **Market Position:** It holds a dominant market position in its core sectors. Its key competitive advantages include a massive distribution network, strong brand recognition, and significant vertical integration. Strategic initiatives are focused on expanding its digital services and renewable energy portfolio.

### Financial Health
- **Key Metrics (FY 2024):**
  - **Revenue:** ₹8.5 Lakh Crore
  - **Net Profit:** ₹75,000 Crore
  - **Debt-to-Equity Ratio:** 0.45
- **Analyst Consensus:** Analysts maintain a 'Stable' outlook on the company, citing its robust cash flows and diversified business model. Growth prospects are tied to the success of its consumer-facing businesses and green energy investments.

### Recent News & Events
- **Headlines:**
  - "${bond.issuer} to invest ₹50,000 Crore in new green hydrogen facility."
  - "Retail arm reports 15% year-over-year growth in Q3 earnings."
- **Impact Analysis:** The significant investment in green energy signals a forward-looking strategy that aligns with global trends, potentially attracting ESG-focused investors. The strong performance of its retail division continues to provide a stable and growing revenue stream, further strengthening its credit profile and making its bonds a secure investment.
`;

const mockMarketNewsResponse = `
### RBI Holds Repo Rate Steady at 6.5%
*   **Summary:** The Monetary Policy Committee (MPC) voted to keep the policy repo rate unchanged, citing persistent inflationary pressures.
*   **Impact Analysis (Neutral):** This was largely expected by the market. Provides short-term stability for existing bond yields. Positive for **Banking** sector net interest margins, but continued high rates may temper credit growth.

### Government Announces Rs 10 Lakh Crore Infrastructure Push
*   **Summary:** The Union Budget has allocated a record amount towards infrastructure projects, focusing on highways and railways.
*   **Impact Analysis (Positive):** Highly positive for **Infrastructure** and capital goods sectors. Expect increased bond issuance from entities like NHAI and IRFC, which will likely be well-received by the market.

### Global Tech Slowdown Impacts IT Sector Outlook
*   **Summary:** Major global clients are reportedly cutting IT spending, leading to a revised, more cautious growth outlook for Indian IT firms.
*   **Impact Analysis (Negative):** Negative for the **IT/Technology** sector. While major firms have strong balance sheets, their credit outlook may be slightly tempered, potentially leading to wider spreads on any new bond issuances.
`;

const mockLiquidityResponse = `**85/100 (High Liquidity)** - The market has deep order books and tight spreads, allowing investors to trade assets quickly with minimal price impact.`;

const mockPortfolioAnalysisResponse = (portfolio: any[], balance: number, riskProfile: string, objective: string) => {
  const totalHoldings = portfolio.reduce((acc, bond) => acc + bond.quantity * bond.currentPrice, 0);
  const totalPortfolio = totalHoldings + balance;
  const cashPercentage = ((balance / totalPortfolio) * 100).toFixed(1);
  const topHolding = portfolio.length > 0 ? portfolio.sort((a,b) => (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice))[0] : null;

  let objectiveText = "";
  switch(objective) {
    case 'esg':
      objectiveText = "To maximize your portfolio's ESG (Environmental, Social, and Governance) score while maintaining a balanced risk profile, our quantum annealing model suggests...";
      break;
    case 'yield':
       objectiveText = "To maximize yield for your aggressive profile, our quantum annealing model recommends focusing on...";
       break;
    default:
       objectiveText = "To align more closely with a balanced risk profile, our quantum annealing model suggests the following adjustments...";
  }

  return `
### Quantum Portfolio Analysis for a ${riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)} Profile

**1. Optimization Model: Quantum Annealing**
This analysis uses a hybrid quantum-classical annealing model to solve a multi-objective optimization problem, balancing risk, return, and your selected goal of **'${objective.toUpperCase()}'**.

**2. Current Portfolio Assessment:**
Your current portfolio value is **₹${totalPortfolio.toLocaleString('en-IN', {maximumFractionDigits: 0})}**, with **${cashPercentage}%** held in cash. The allocation is moderately diversified, with the largest holding in **${topHolding ? topHolding.name : 'N/A'}**.

**3. Suggested Re-allocation Strategy:**
${objectiveText}
*   **Increase Allocation:** Focus on high-quality bonds from the **Renewable Energy** and **Infrastructure** sectors, which often carry strong ESG ratings.
*   **Rebalance Sector Weighting:** Your portfolio seems concentrated in the financial sector. Consider adding exposure to infrastructure or industrial bonds for better diversification and to meet your objective.
*   **Cash Deployment:** The **${cashPercentage}%** cash position is slightly high for an aggressive profile. Consider deploying this cash into undervalued, high-ESG bonds identified by our models.

**4. Rationale:**
This strategy aims to align your assets with your stated risk tolerance and investment objectives. By leveraging quantum optimization to navigate complex trade-offs, you can enhance long-term returns while building a portfolio that reflects your values.
  `;
};

const mockQuantumSimulationResponse = (algorithm: string) => {
    switch (algorithm) {
        case 'annealing':
            return `
### Simulation: Quantum Annealing for Portfolio Optimization
**Objective:** Maximize risk-adjusted returns for a portfolio of 1,500 corporate bonds with complex covariance constraints.

**Result:**
The quantum annealer explored a solution space of over 10^450 possibilities and converged on an optimal asset allocation in **198 milliseconds**. A classical brute-force approach would be computationally infeasible.

- **Identified Opportunity:** The model suggests a 12% allocation to specific, undervalued AA-rated bonds in the renewable energy sector, which were previously overlooked by classical models due to non-linear risk correlations.
- **Projected Alpha:** This optimized portfolio demonstrates a projected alpha of **+1.25%** over the benchmark index, with a 15% reduction in overall portfolio volatility (VaR).

**Conclusion:** Quantum Annealing provides a significant advantage in solving complex, multi-variable optimization problems inherent in modern portfolio management.
            `;
        case 'vqe':
            return `
### Simulation: Variational Quantum Eigensolver (VQE) for Bond Pricing
**Objective:** Calculate the fair value of a complex, callable corporate bond with embedded options, a problem difficult for classical Monte Carlo simulations.

**Result:**
The VQE algorithm modeled the bond's payoff structure as a Hamiltonian and found its ground state energy, corresponding to the precise fair value.

- **Calculated Fair Value:** ₹103.452
- **Classical Model Value:** ₹102.980
- **Time to Converge:** 8.2 seconds on a simulated 54-qubit quantum processor.

**Analysis:** The quantum model more accurately priced the bond's embedded optionality, revealing it was undervalued by the classical model. This precision allows for more effective arbitrage and hedging strategies. The simulation highlights the potential of quantum finance for pricing complex derivatives.
            `;
        case 'qmc':
            return `
### Simulation: Quantum Amplitude Estimation (QAE) for Risk Analysis
**Objective:** Perform a market risk analysis (Value at Risk) on the entire bond market, requiring a quadratic speedup over classical Monte Carlo methods.

**Result:**
The QAE algorithm achieved a high-confidence VaR estimate with significantly fewer samples than its classical counterpart.

- **99% VaR Estimate:** ₹-1.25 Crores (on a notional ₹100 Cr portfolio)
- **Quantum Samples Required:** 8,192
- **Classical Samples Required (for same accuracy):** ~67,000,000

**Conclusion:** QAE demonstrates a revolutionary improvement in the efficiency of risk modeling. This allows for near real-time risk assessments during high-volatility events, a task that is currently an overnight batch process in most financial institutions.
            `;
        default:
            return `### Select a simulation to begin.`;
    }
}

const mockRiskValueScoreAnalysis = (bond: Bond) => `
### AI-Powered Risk & Value Analysis

The score of **${bond.riskValueScore}/100** is a composite metric designed to provide an at-a-glance assessment. It is derived from three key pillars:

**1. Credit Quality (50% Weighting):**
- **Rating:** ${bond.creditRating}
- **Analysis:** The bond's strong credit rating from a reputable agency forms the largest component of this score. It indicates a very high probability of the issuer meeting its debt obligations, significantly reducing default risk for investors.

**2. Valuation (30% Weighting):**
- **Market vs. AI Fair Value:** ₹${bond.currentPrice} vs. ₹${bond.aiFairValue}
- **Analysis:** Our AI model suggests the bond is currently trading ${bond.currentPrice < bond.aiFairValue ? 'at a slight discount' : 'at a slight premium'} to its intrinsic fair value. This component rewards bonds that appear undervalued, offering a potential value opportunity.

**3. Liquidity (20% Weighting):**
- **Bid-Ask Spread:** ${bond.bidAskSpread}
- **Analysis:** The relatively tight bid-ask spread suggests a healthy level of market activity and liquidity for this bond. This means investors can likely buy or sell the bond quickly without significantly impacting its price, which is a positive factor.
`;

const mockRegulatoryDashboardSummary = () => `
### Market Supervisory Overview
*Generated: ${new Date().toLocaleString()}*

This is an AI-driven summary for regulatory oversight, highlighting key market trends and potential risks based on real-time data from the exchange.

**1. Market Concentration:**
- The top 5 most traded bonds by volume account for **38%** of the total daily volume, a moderate level of concentration.
- **HDFC Bank and Reliance Industries** bonds remain the most active, consistent with previous periods. No single issuer is showing signs of unusual, systemic concentration risk.

**2. Systemic Risk Indicators:**
- Overall market leverage remains within acceptable parameters.
- The **Bio-Inspired AIS** has flagged **12 minor incidents** of anomalous trading patterns in the last hour, primarily related to potential fat-finger errors on limit orders. All were successfully blocked at the gateway with no market impact.

**3. Large Trade Monitoring:**
- **3 block trades** exceeding ₹50 Crore have been successfully executed and settled via the Regulatory Gateway in the past 24 hours. All participating entities were fully KYC-compliant.
- One large trade was flagged for review due to its price being 2% outside the AI fair value range, but was manually approved after review.

**Conclusion:** The market is operating within expected parameters. The AIS is effectively mitigating minor operational risks, and the regulatory gateway provides a clear audit trail for all significant institutional movements.
`;


// Mock function to simulate an API call
export const generateGeminiAnalysis = (type: 'general' | 'bond' | 'liquidity', bond?: Bond): Promise<string> => {
  console.log(`Generating Mock Analysis for: ${type}`);
  return new Promise(resolve => {
    setTimeout(() => {
      if (type === 'bond' && bond) {
        resolve(mockBondSpecificAnalysisResponse(bond));
      } else if (type === 'general') {
        resolve(mockGeneralAnalysisResponse);
      } else if (type === 'liquidity') {
        resolve(mockLiquidityResponse);
      }
    }, MOCK_API_DELAY);
  });
};

export const generateBondDeepDiveAnalysis = (bond: Bond): Promise<string> => {
  console.log("Generating Mock Deep Dive Analysis...");
  return new Promise(resolve => {
      setTimeout(() => {
          resolve(mockDeepDiveAnalysisResponse(bond));
      }, MOCK_API_DELAY + 500); // make it slightly slower
  });
};

export const generateMarketNewsAnalysis = (): Promise<string> => {
    console.log("Generating Mock Market News Analysis...");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockMarketNewsResponse);
        }, MOCK_API_DELAY);
    });
};

export const generatePortfolioOptimizationAnalysis = (portfolio: any[], balance: number, riskProfile: string, objective: string): Promise<string> => {
  console.log("Generating Mock Portfolio Optimization Analysis...");
  return new Promise(resolve => {
      setTimeout(() => {
          resolve(mockPortfolioAnalysisResponse(portfolio, balance, riskProfile, objective));
      }, MOCK_API_DELAY + 1000); // make it a bit slower
  });
};

export const generateQuantumSimulationAnalysis = (algorithm: string): Promise<string> => {
    console.log(`Generating Mock Quantum Simulation for: ${algorithm}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockQuantumSimulationResponse(algorithm));
        }, 2500);
    });
};

export const generateRiskAndValueScoreAnalysis = (bond: Bond): Promise<string> => {
    console.log(`Generating Mock Risk & Value Score Analysis for: ${bond.isin}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockRiskValueScoreAnalysis(bond));
        }, MOCK_API_DELAY - 500);
    });
};

export const generateRegulatoryDashboardSummary = (): Promise<string> => {
    console.log(`Generating Mock Regulatory Dashboard Summary`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockRegulatoryDashboardSummary());
        }, MOCK_API_DELAY);
    });
};