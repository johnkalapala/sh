import { Bond, PortfolioHolding } from '../types';

// --- MOCK BACKEND API SERVICE ---
// This service simulates a backend that has loaded a large dataset into memory
// and can perform efficient pagination, searching, and filtering on it.

let allBonds: Bond[] = [];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockApi = {
  // Initialize the service with the full dataset
  initializeData(bonds: Bond[]) {
    allBonds = bonds.map(b => ({...b, dayChange: (Math.random() - 0.5) * 0.5 }));
  },

  // Get a paginated, filtered, and searched list of bonds
  getBonds(params: { page: number; limit: number; search?: string; filters?: any }) {
    const { page, limit, search, filters } = params;
    let filteredBonds = [...allBonds];

    // Apply search
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      filteredBonds = filteredBonds.filter(bond =>
        bond.name.toLowerCase().includes(lowercasedSearch) ||
        bond.issuer.toLowerCase().includes(lowercasedSearch) ||
        bond.isin.toLowerCase().includes(lowercasedSearch)
      );
    }

    // Apply filters
    if (filters) {
       if (filters.ratings && filters.ratings.length > 0) {
          filteredBonds = filteredBonds.filter(bond => filters.ratings.includes(bond.creditRating));
        }
        if (filters.couponRange) {
          filteredBonds = filteredBonds.filter(bond => bond.coupon >= filters.couponRange[0] && bond.coupon <= filters.couponRange[1]);
        }
        if (filters.maturityRange) {
           filteredBonds = filteredBonds.filter(bond => {
                const maturityYear = new Date(bond.maturityDate).getFullYear();
                return maturityYear >= filters.maturityRange[0] && maturityYear <= filters.maturityRange[1];
            });
        }
    }

    const totalItems = filteredBonds.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      bonds: filteredBonds.slice(startIndex, endIndex),
      totalPages,
      totalItems,
    };
  },
  
  getBondById(id: string): Bond | undefined {
    return allBonds.find(b => b.id === id);
  },
  
  getTotalVolume(): number {
    return allBonds.reduce((acc, bond) => acc + bond.volume, 0);
  },

  getTopMovers(count: number): Bond[] {
    return [...allBonds].sort((a, b) => Math.abs(b.dayChange) - Math.abs(a.dayChange)).slice(0, count);
  },

  getInitialPortfolio(count: number): PortfolioHolding[] {
     if (allBonds.length === 0) return [];
      const portfolioBondsSample = [...allBonds].sort(() => 0.5 - Math.random()).slice(0, count);
      return portfolioBondsSample.map(bond => ({
          bondId: bond.id,
          quantity: Math.floor(Math.random() * 450 + 50) * 10,
          purchasePrice: parseFloat((bond.currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
      }));
  },

  // Simulates the POST /api/kyc endpoint
  async submitKyc(address: string) {
    await delay(1500);
    console.log(`Mock KYC submitted for ${address}`);
    return { status: 'verified', address };
  },

  // Simulates POST /api/trade/buy and sell endpoints
  async submitTrade(bond: Bond, quantity: number, tradeType: 'buy' | 'sell') {
    await delay(1200);
    const tradeValue = bond.currentPrice * quantity;
    const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    console.log(`Mock trade submitted: ${tradeType} ${quantity} of ${bond.isin}`);
    return {
      txHash,
      trade: {
        buyer: tradeType === 'buy' ? 'user_address' : 'market_maker',
        seller: tradeType === 'sell' ? 'user_address' : 'market_maker',
        amount: quantity,
        price: tradeValue,
        timestamp: new Date().toISOString(),
      },
    };
  },

  // Simulates GET /api/market-news
  async getMarketNews() {
    await delay(800);
    return `
      <h3>Market Sentiment: Cautiously Optimistic</h3>
      <p>The Indian corporate bond market shows signs of stability, with yields on AAA-rated bonds remaining steady. The RBI's recent commentary on inflation has calmed investor nerves.</p>
      <ul>
        <li><strong>Banking Sector:</strong> Bonds from major private banks are seeing high demand after positive quarterly results.</li>
        <li><strong>Infrastructure:</strong> Government focus on infrastructure spending is boosting sentiment for bonds in this sector.</li>
      </ul>
    `;
  },
  
   async getLiquidityScore() {
      await delay(300);
      return "78/100 (Healthy Liquidity)";
  },

  async getPortfolioAnalysis() {
    await delay(1500);
    return `
        <h3>Portfolio Assessment</h3>
        <p>Your portfolio is well-diversified across several key sectors, with a healthy allocation to highly-rated corporate bonds.</p>
        <strong>Suggested Strategy:</strong>
        <ul>
            <li>Consider increasing exposure to the infrastructure sector to capitalize on government initiatives.</li>
            <li>Deploy some of your cash balance to capture current yield opportunities in the 5-7 year maturity range.</li>
        </ul>
    `;
  },
  
  async getRiskAndValueScoreAnalysis() {
      await delay(900);
      return `
        <ol>
            <li><strong>Credit Quality (50%):</strong> The bond's strong credit rating indicates low default risk.</li>
            <li><strong>Valuation (30%):</strong> The current market price is trading at a slight discount to its fair value, representing a good entry point.</li>
            <li><strong>Liquidity (20%):</strong> A tight bid-ask spread suggests good liquidity, making it easy to trade.</li>
        </ol>
      `;
  },

  async getRegulatorySummary() {
      await delay(1000);
      return `
        <h3>Market Supervisory Overview</h3>
        <p>The market is operating within expected parameters. Systemic risk indicators are stable.</p>
        <ul>
            <li><strong>Concentration Risk:</strong> The top 5 most traded bonds account for 35% of total volume. No unusual concentration detected.</li>
            <li><strong>Anomalous Activity:</strong> 8 minor anomalous trading patterns were flagged and blocked by the system in the last hour.</li>
        </ul>
      `;
  },
  
   async getQuantumSimulation(algorithm: string) {
       await delay(2000);
       return `
        <h3>Simulation Complete: ${algorithm}</h3>
        <p>The simulation successfully identified an optimized parameter set, projecting a potential 1.5% increase in efficiency for the selected financial model.</p>
       `;
   }
};

export default mockApi;