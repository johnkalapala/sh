import { Bond, CreditRating } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// In a real app, the API key is stored securely on a backend server.
// For this prototype, we assume process.env.API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';


const simpleMarkdownToHtml = (text: string): string => {
  if (!text) return '<p>No analysis available.</p>';
  let html = '';
  let in_ul = false;
  // Bolding needs to be done after other tags are in place.
  const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  for (const line of boldedText.split('\n')) {
    let trimmedLine = line.trim();
    if (trimmedLine.startsWith('### ')) {
      if (in_ul) { html += '</ul>\n'; in_ul = false; }
      html += `<h3>${trimmedLine.substring(4)}</h3>\n`;
    } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      if (!in_ul) { html += '<ul>\n'; in_ul = true; }
      html += `  <li>${trimmedLine.substring(2)}</li>\n`;
    } else if (trimmedLine.length > 0) {
      if (in_ul) { html += '</ul>\n'; in_ul = false; }
      html += `<p>${trimmedLine}</p>\n`;
    } else {
      if (in_ul) { html += '</ul>\n'; in_ul = false; }
    }
  }
  if (in_ul) { html += '</ul>\n'; }
  return html;
};

// Centralized helper function for making API calls to Gemini
async function callGemini(prompt: string, config?: any): Promise<string> {
  if (!prompt) return '';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      ...(config && { config }),
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if(config?.responseMimeType === 'application/json') {
      return JSON.stringify({ error: "AI analysis could not be generated at this time." });
    }
    return `<p class="text-brand-red"><strong>Error:</strong> AI analysis could not be generated at this time. The API endpoint might be unreachable or the request was blocked.</p>`;
  }
}

const bondSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier using the ISIN." },
        isin: { type: Type.STRING, description: "The ISIN of the bond." },
        name: { type: Type.STRING, description: "The full name of the bond, including issuer, coupon, and maturity year." },
        issuer: { type: Type.STRING, description: "The name of the bond issuer." },
        coupon: { type: Type.NUMBER, description: "The bond's coupon rate." },
        maturityDate: { type: Type.STRING, description: "The bond's maturity date in YYYY-MM-DD format." },
        creditRating: { type: Type.STRING, description: "The bond's credit rating (e.g., AAA, AA+)." , enum: Object.values(CreditRating) },
        currentPrice: { type: Type.NUMBER, description: "The current market price of the bond." },
        aiFairValue: { type: Type.NUMBER, description: "An AI-estimated fair value for the bond." },
        standardFairValue: { type: Type.NUMBER, description: "A standard model fair value for the bond." },
        volume: { type: Type.NUMBER, description: "The average daily trading volume in INR." },
        bidAskSpread: { type: Type.NUMBER, description: "The bid-ask spread for the bond." },
        dayChange: { type: Type.NUMBER, description: "The percentage change in price for the day." },
        riskValueScore: { type: Type.INTEGER, description: "A composite risk/value score from 1-100." },
        prePlatformVolume: { type: Type.NUMBER, description: "Simulated historical daily volume before this platform." },
        prePlatformInvestors: { type: Type.INTEGER, description: "Simulated historical number of investors." },
    }
};

const marketUpdateSchema = {
    type: Type.OBJECT,
    properties: {
        isin: { type: Type.STRING },
        newPrice: { type: Type.NUMBER },
        newVolume: { type: Type.NUMBER },
        newBidAskSpread: { type: Type.NUMBER },
    }
};


// --- Backend Powering Functions ---

export const generateInitialBondMarket = async (): Promise<Bond[]> => {
    console.log("Generating initial bond market via Gemini...");
    const prompt = `
    Generate a diverse and realistic list of 40 Indian corporate bonds for a financial platform. Include a mix of issuers (banks, PSUs, large corporations), credit ratings, coupons, and maturities. The data must strictly adhere to the provided JSON schema. Ensure the 'id' and 'isin' fields are identical.
    `;
    const config = {
      responseMimeType: "application/json",
      responseSchema: {
          type: Type.ARRAY,
          items: bondSchema,
      },
   };
   const result = await callGemini(prompt, config);
   try {
     const data = JSON.parse(result);
     if (data.error) {
       console.error("Error from Gemini:", data.error);
       return [];
     }
     return data as Bond[];
   } catch(e) {
     console.error("Failed to parse bond market data from Gemini:", e);
     return [];
   }
};

export const getMarketPriceUpdates = async (currentBonds: Bond[]): Promise<any[]> => {
    console.log("Fetching market price updates from Gemini...");
    const bondSummaries = currentBonds.slice(0, 50).map(b => ({ isin: b.isin, price: b.currentPrice, rating: b.creditRating }));
    const prompt = `
    Simulate the next 5 seconds of market activity for the Indian corporate bond market, given the following subset of bonds and their current prices: ${JSON.stringify(bondSummaries)}.
    
    Factors to consider:
    - High-rated bonds (AAA, AA+) should be stable with small price changes.
    - Lower-rated bonds can have slightly more volatility.
    - Simulate random news or sector trends by picking a few bonds and giving them more significant price changes (between -0.5% and +0.5%).
    
    Return a small array of JSON objects (between 5 and 15 updates) for the bonds that experienced a price change. The objects must strictly adhere to the provided schema.
    `;
     const config = {
      responseMimeType: "application/json",
      responseSchema: {
          type: Type.ARRAY,
          items: marketUpdateSchema,
      },
   };
    const result = await callGemini(prompt, config);
    try {
        const data = JSON.parse(result);
        if (data.error) return [];
        return data;
    } catch(e) {
        console.error("Failed to parse price updates from Gemini:", e);
        return [];
    }
}


// --- Analysis Functions (existing) ---

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

const createPortfolioAnalysisPrompt = (portfolio: any[], balance: number, riskProfile: string, objective: string): string => {
  const totalHoldings = portfolio.reduce((acc, bond) => acc + bond.quantity * (bond.currentPrice || 0), 0);
  const totalPortfolio = totalHoldings + balance;
  const cashPercentage = totalPortfolio > 0 ? ((balance / totalPortfolio) * 100).toFixed(1) : '0.0';
  const topHolding = portfolio.length > 0 ? portfolio.sort((a,b) => (b.quantity * (b.currentPrice||0)) - (a.quantity * (a.currentPrice||0)))[0] : null;

  const holdingsSummary = portfolio.map(h => `- ${h.name}: ${h.quantity.toLocaleString()} units @ ₹${h.currentPrice?.toFixed(2)}`).join('\n');

  return `
    Analyze the following investment portfolio and provide recommendations.
    
    User Profile:
    - Risk Profile: ${riskProfile}
    - Primary Objective: ${objective}

    Current Portfolio:
    - Total Value: ₹${totalPortfolio.toLocaleString('en-IN', {maximumFractionDigits: 0})}
    - Cash Balance: ₹${balance.toLocaleString('en-IN')} (${cashPercentage}%)
    - Top Holding: ${topHolding ? topHolding.name : 'N/A'}
    - Holdings:
    ${holdingsSummary}

    Task:
    Provide a concise portfolio analysis based on a "Quantum Annealing" optimization model simulation. The analysis should be structured in markdown format with the following sections:
    1.  **Optimization Model:** Briefly state that the analysis uses a hybrid quantum-classical annealing model to balance risk, return, and the user's selected goal ('${objective.toUpperCase()}').
    2.  **Current Portfolio Assessment:** Provide a one-sentence summary of the current portfolio's state (e.g., diversification, cash position).
    3.  **Suggested Re-allocation Strategy:** Provide 2-3 actionable bullet points for re-allocation. For example, suggest increasing allocation in certain sectors, rebalancing away from over-concentration, or deploying cash. Tailor the suggestions to the user's risk profile and objective. For an 'esg' objective, suggest ESG-friendly sectors like Renewable Energy. For a 'yield' objective, suggest higher-coupon bonds. For an 'aggressive' profile, suggest deploying cash.
    4.  **Rationale:** A brief concluding sentence on why this strategy is beneficial.

    The tone should be professional and encouraging. Use markdown for formatting.
  `;
};

const createQuantumSimulationPrompt = (algorithm: string): string => {
    switch (algorithm) {
        case 'annealing':
            return `
            Simulate and describe the results of using a Quantum Annealer for a complex portfolio optimization problem.
            
            Problem: Maximize risk-adjusted returns for a portfolio of 1,500 corporate bonds with complex covariance constraints.

            Generate a response in markdown with these sections:
            - **Objective:** State the objective clearly.
            - **Result:** Describe the outcome. Mention the speed of convergence (e.g., in milliseconds) and compare it to classical methods (e.g., infeasible).
            - **Identified Opportunity:** Fabricate a specific, interesting insight the model found (e.g., allocating to undervalued bonds in a specific sector).
            - **Projected Alpha:** Provide a fictional projected alpha and risk reduction (e.g., +1.25% alpha, 15% VaR reduction).
            - **Conclusion:** Summarize the advantage of using Quantum Annealing.
            `;
        case 'vqe':
            return `
            Simulate and describe the results of using a Variational Quantum Eigensolver (VQE) for pricing a complex bond.

            Problem: Calculate the fair value of a complex, callable corporate bond with embedded options, which is difficult for classical Monte Carlo simulations.

            Generate a response in markdown with these sections:
            - **Objective:** State the objective clearly.
            - **Result:** Describe how VQE works for this problem (modeling payoff as a Hamiltonian). Provide a fictional calculated fair value, compare it to a classical model's value, and state a fictional time to converge on a simulated quantum processor.
            - **Analysis:** Explain why the quantum model is more precise and what this allows (e.g., arbitrage/hedging).
            `;
        case 'qmc':
            return `
            Simulate and describe the results of using Quantum Amplitude Estimation (QAE), a form of Quantum Monte Carlo, for risk analysis.
            
            Problem: Perform a market risk analysis (Value at Risk) on a large bond portfolio, which requires a quadratic speedup over classical Monte Carlo.

            Generate a response in markdown with these sections:
            - **Objective:** State the objective clearly.
            - **Result:** Describe the outcome. Provide a fictional 99% VaR estimate on a notional portfolio (e.g., -1.25 Crores on 100 Cr). State the quantum samples required vs. classical samples required for the same accuracy to highlight the speedup.
            - **Conclusion:** Explain the revolutionary improvement in efficiency this provides (e.g., near real-time risk assessment).
            `;
        default:
            return `Please select a simulation to begin.`;
    }
}

const createRiskValueScoreAnalysisPrompt = (bond: Bond): string => {
  return `
  Generate a brief, AI-powered risk and value analysis for the following corporate bond. The analysis should explain how a composite score is derived.

  Bond Details:
  - Rating: ${bond.creditRating}
  - Market Price: ₹${bond.currentPrice}
  - AI Fair Value: ₹${bond.aiFairValue}
  - Bid-Ask Spread: ${bond.bidAskSpread}
  - Composite Score: ${bond.riskValueScore}/100

  Task:
  Write a short analysis in markdown format, structured with the following three numbered sections. Each section should have a heading and a brief explanation.
  1.  **Credit Quality (50% Weighting):** Explain that the bond's strong credit rating (${bond.creditRating}) is the largest component and indicates low default risk.
  2.  **Valuation (30% Weighting):** Compare the market price to the AI fair value and state if it appears to be at a discount or premium, and explain this is a positive or negative factor.
  3.  **Liquidity (20% Weighting):** Explain that the relatively tight bid-ask spread suggests good liquidity, making it easier to trade without price impact.
  `;
};

const createRegulatoryDashboardSummaryPrompt = (): string => {
  return `
  Act as an AI market surveillance system for a financial regulator. Generate a concise "Market Supervisory Overview" summary for the QuantumBond exchange based on simulated real-time data.

  The report should be generated for the current date and time. It must be in markdown format and include these sections:
  
  1.  **Market Concentration:**
      - State the percentage of total daily volume accounted for by the top 5 most traded bonds (use a realistic number like 38%).
      - Name two major, realistic companies whose bonds are most active (e.g., HDFC Bank, Reliance Industries).
      - Conclude whether there is unusual concentration risk.

  2.  **Systemic Risk Indicators:**
      - State that overall market leverage is within acceptable parameters.
      - Report a fictional number of minor anomalous trading patterns flagged by the Bio-Inspired AIS in the last hour (e.g., 12 incidents), mentioning they were related to things like fat-finger errors and were blocked without market impact.
  
  3.  **Large Trade Monitoring:**
      - Report a fictional number of large block trades (e.g., 3 trades > ₹50 Crore) that were successfully settled via the Regulatory Gateway in the past 24 hours, mentioning all parties were KYC-compliant.
      - Mention one fictional example of a large trade that was flagged for manual review (e.g., price was 2% outside fair value range) but was approved.

  4.  **Conclusion:**
      - Provide a concluding sentence stating that the market is operating within expected parameters and that the AI systems are effective.
  `;
}

// --- Live API Functions ---

export const generateGeminiAnalysis = async (type: 'general' | 'bond' | 'liquidity', bond?: Bond): Promise<string> => {
  console.log(`Generating Gemini Analysis for: ${type}`);
  let prompt = '';
  let processHtml = true;

  switch (type) {
    case 'bond':
      if (bond) prompt = createBondSpecificAnalysisPrompt(bond);
      break;
    case 'general':
      prompt = createGeneralAnalysisPrompt();
      break;
    case 'liquidity':
      prompt = createLiquidityAnalysisPrompt();
      processHtml = false; // This prompt returns a simple string, not markdown
      break;
  }
  
  if (!prompt) return Promise.resolve(simpleMarkdownToHtml('Invalid analysis request.'));

  const result = await callGemini(prompt);
  
  // Special handling for liquidity score if there's an error
  if (type === 'liquidity' && result.includes('Error:')) {
      return "N/A";
  }

  return processHtml ? simpleMarkdownToHtml(result) : result;
};

export const generateBondDeepDiveAnalysis = async (bond: Bond): Promise<string> => {
  console.log("Generating Gemini Deep Dive Analysis...");
  const prompt = createDeepDiveAnalysisPrompt(bond);
  const result = await callGemini(prompt);
  return simpleMarkdownToHtml(result);
};

export const generateMarketNewsAnalysis = async (): Promise<string> => {
    console.log("Generating Gemini Market News Analysis...");
    const prompt = createMarketNewsAnalysisPrompt();
    const result = await callGemini(prompt);
    return simpleMarkdownToHtml(result);
};

export const generatePortfolioOptimizationAnalysis = async (portfolio: any[], balance: number, riskProfile: string, objective: string): Promise<string> => {
  console.log("Generating Gemini Portfolio Optimization Analysis...");
  const prompt = createPortfolioAnalysisPrompt(portfolio, balance, riskProfile, objective);
  const result = await callGemini(prompt);
  return simpleMarkdownToHtml(result);
};

export const generateQuantumSimulationAnalysis = async (algorithm: string): Promise<string> => {
    console.log(`Generating Gemini Quantum Simulation for: ${algorithm}`);
    const prompt = createQuantumSimulationPrompt(algorithm);
    if (prompt.startsWith('Please select')) return Promise.resolve(simpleMarkdownToHtml(prompt));
    
    const result = await callGemini(prompt);
    return simpleMarkdownToHtml(result);
};

export const generateRiskAndValueScoreAnalysis = async (bond: Bond): Promise<string> => {
    console.log(`Generating Gemini Risk & Value Score Analysis for: ${bond.isin}`);
    const prompt = createRiskValueScoreAnalysisPrompt(bond);
    const result = await callGemini(prompt);
    return simpleMarkdownToHtml(result);
};

export const generateRegulatoryDashboardSummary = async (): Promise<string> => {
    console.log(`Generating Gemini Regulatory Dashboard Summary`);
    const prompt = createRegulatoryDashboardSummaryPrompt();
    const result = await callGemini(prompt);
    return simpleMarkdownToHtml(result);
};
