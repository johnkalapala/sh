import { Bond } from '../types';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// This is a mock implementation. In a real app, the API key would be
// securely managed and not exposed in the frontend.
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_API_DELAY = 1500;

const createGeneralAnalysisPrompt = (): string => {
  return `
  Provide a concise market analysis for the Indian corporate bond market today. Cover the following points:
  1.  **Overall Market Sentiment:** (e.g., Bullish, Bearish, Neutral) and the primary reasons.
  2.  **Key Economic Drivers:** Analyze the impact of recent RBI announcements, inflation data, and global economic trends (like US Fed rates).
  3.  **Sector Spotlight:** Highlight the performance and outlook for two key sectors (e.g., Banking, Infrastructure, Renewables).
  4.  **Yield Curve Analysis:** Briefly describe the current state of the yield curve (e.g., steepening, flattening) and its implications.
  5.  **Outlook & Strategy:** Provide a brief outlook for the next quarter and a suggested strategy for a moderate-risk investor.

  Format the response in clear, well-structured markdown.
  `;
};

const createEntropyAnalysisPrompt = (): string => {
  return `
  Based on information theory and market dynamics, provide a "Market Health (Entropy) Score" for the Indian corporate bond market.
  - The score should be between 0 (highly predictable, potentially stagnant) and 100 (highly chaotic, unpredictable).
  - A healthy, liquid market typically has a score between 60 and 85.
  - Provide the score and a brief one-sentence explanation of what it means in the context of market predictability and liquidity.
  
  Example format: **72/100 (Stable Liquidity)** - The market shows healthy trading activity and balanced predictability, indicating stable conditions.
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
  - AI-Powered Fair Value Estimate: ₹${bond.aiFairValue}

  Based on this data, please provide:
  1.  **Credit Quality Assessment:** A brief analysis of the issuer's creditworthiness and the significance of its ${bond.creditRating} rating.
  2.  **Valuation Analysis:** Compare the current market price to the AI fair value. Is it potentially overvalued, undervalued, or fairly priced? Explain why.
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


const mockGeneralAnalysisResponse = `
### Indian Corporate Bond Market Analysis

**1. Overall Market Sentiment: Cautiously Optimistic**
The market is currently exhibiting a cautiously optimistic sentiment. While underlying economic fundamentals remain strong, participants are watchful of global macroeconomic cues and domestic inflation data.

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
The bond is currently trading at **₹${bond.currentPrice}**, while our AI-powered model estimates its fair value at **₹${bond.aiFairValue}**. This suggests the bond may be **slightly undervalued** in the current market. The modest discount could be attributed to general market liquidity conditions rather than issuer-specific concerns, presenting a potential entry point for investors.

**3. Risk Profile:**
*   **Interest Rate Risk:** As with any fixed-income instrument, if the RBI were to raise interest rates, the price of this bond would likely decrease.
*   **Liquidity Risk:** While issued by a major corporation, this specific bond may have lower trading volumes compared to government securities, which could make it harder to sell instantly without a price concession.

**4. Investment Thesis Summary:**
For a retail investor with a moderate risk appetite, this bond presents a compelling case. It offers a relatively high coupon from a top-rated issuer and appears to be trading at a slight discount to its fair value. It is a solid choice for investors seeking stable income with low default risk.
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

const mockEntropyResponse = `**72/100 (Stable Liquidity)** - The market shows healthy trading activity and balanced predictability, indicating stable conditions.`;

// Mock function to simulate a Gemini API call
export const generateGeminiAnalysis = (type: 'general' | 'bond' | 'entropy', bond?: Bond): Promise<string> => {
  console.log(`Generating Gemini Analysis for: ${type}`);
  return new Promise(resolve => {
    setTimeout(() => {
      if (type === 'bond' && bond) {
        resolve(mockBondSpecificAnalysisResponse(bond));
      } else if (type === 'general') {
        resolve(mockGeneralAnalysisResponse);
      } else if (type === 'entropy') {
        resolve(mockEntropyResponse);
      }
    }, MOCK_API_DELAY);
  });
};

export const generateBondDeepDiveAnalysis = (bond: Bond): Promise<string> => {
  console.log("Generating Gemini Deep Dive Analysis...");
  return new Promise(resolve => {
      setTimeout(() => {
          resolve(mockDeepDiveAnalysisResponse(bond));
      }, MOCK_API_DELAY + 500); // make it slightly slower
  });
};