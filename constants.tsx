import { Bond, CreditRating, PortfolioHolding, SystemMetrics } from './types';

// --- Data Generation for 25,000 Bonds ---

const issuers = [
    { name: 'Reliance Industries Ltd.', ratingPool: [CreditRating.AAA, CreditRating.AA_PLUS] },
    { name: 'HDFC Bank Ltd.', ratingPool: [CreditRating.AAA, CreditRating.AAA] },
    { name: 'Tata Steel Ltd.', ratingPool: [CreditRating.AA_PLUS, CreditRating.AA] },
    { name: 'Infosys Ltd.', ratingPool: [CreditRating.AAA] },
    { name: 'ICICI Bank Ltd.', ratingPool: [CreditRating.AAA, CreditRating.AA_PLUS] },
    { name: 'State Bank of India', ratingPool: [CreditRating.AAA, CreditRating.AA_PLUS] },
    { name: 'Larsen & Toubro Ltd.', ratingPool: [CreditRating.AAA, CreditRating.AA_PLUS] },
    { name: 'Power Finance Corporation', ratingPool: [CreditRating.AAA] },
    { name: 'NTPC Limited', ratingPool: [CreditRating.AAA] },
    { name: 'Rural Electrification Corp Ltd.', ratingPool: [CreditRating.AAA] },
    { name: 'Adani Ports & SEZ Ltd.', ratingPool: [CreditRating.AA_PLUS, CreditRating.AA] },
    { name: 'Bajaj Finance Ltd.', ratingPool: [CreditRating.AAA, CreditRating.AA_PLUS] },
    { name: 'M&M Financial Services Ltd.', ratingPool: [CreditRating.AA_PLUS, CreditRating.AA] },
    { name: 'GAIL (India) Ltd.', ratingPool: [CreditRating.AAA] },
    { name: 'Indian Railway Finance Corp', ratingPool: [CreditRating.AAA] },
    { name: 'National Highways Authority', ratingPool: [CreditRating.AAA] },
    { name: 'Vedanta Ltd.', ratingPool: [CreditRating.A_PLUS, CreditRating.A] },
    { name: 'Axis Bank Ltd.', ratingPool: [CreditRating.AAA, CreditRating.AA_PLUS] },
    { name: 'Bharti Airtel Ltd.', ratingPool: [CreditRating.AA, CreditRating.A_PLUS] },
    { name: 'Tata Motors Ltd.', ratingPool: [CreditRating.AA, CreditRating.A_PLUS] },
    { name: 'JSW Steel Ltd.', ratingPool: [CreditRating.AA, CreditRating.A_PLUS] },
    { name: 'Hindalco Industries Ltd.', ratingPool: [CreditRating.AA, CreditRating.A_PLUS] },
    { name: 'Grasim Industries Ltd.', ratingPool: [CreditRating.AA_PLUS, CreditRating.AA] },
    { name: 'Indian Oil Corporation Ltd.', ratingPool: [CreditRating.AAA] },
    { name: 'HCL Technologies Ltd.', ratingPool: [CreditRating.AAA, CreditRating.AA_PLUS] },
];

const ratingToScore = {
    [CreditRating.AAA]: 95,
    [CreditRating.AA_PLUS]: 90,
    [CreditRating.AA]: 85,
    [CreditRating.A_PLUS]: 80,
    [CreditRating.A]: 75,
    [CreditRating.BBB]: 65,
    [CreditRating.BB]: 50,
    [CreditRating.B]: 40,
    [CreditRating.C]: 30,
    [CreditRating.D]: 10,
};

const generatedBonds: Bond[] = [];
const isinSet = new Set<string>();
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const targetBondCount = 25000;

while (generatedBonds.length < targetBondCount) {
    let fullIsin = 'INE';
    for (let j = 0; j < 9; j++) {
        fullIsin += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (isinSet.has(fullIsin)) continue;
    isinSet.add(fullIsin);
    
    const issuerInfo = issuers[Math.floor(Math.random() * issuers.length)];
    const coupon = parseFloat((Math.random() * 3.5 + 6.5).toFixed(2)); // 6.50 to 10.00
    const year = Math.floor(Math.random() * 15) + 2026; // 2026 to 2040
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const maturityDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const rating = issuerInfo.ratingPool[Math.floor(Math.random() * issuerInfo.ratingPool.length)];

    const priceVariation = (coupon - 7.5) + (2030 - year) * 0.2; // Simple logic for price
    const currentPrice = parseFloat((100 + priceVariation + (Math.random() - 0.5) * 2).toFixed(2));
    const aiFairValue = parseFloat((currentPrice + (Math.random() - 0.5) * 1.5).toFixed(2));
    const standardFairValue = parseFloat((currentPrice + (Math.random() - 0.5) * 0.4).toFixed(2));
    const dayChange = parseFloat(((Math.random() - 0.5) * 0.5).toFixed(3));
    const bidAskSpread = parseFloat((Math.random() * 0.2 + 0.05).toFixed(3));
    
    // Calculate Risk & Value Score
    const creditComponent = ratingToScore[rating] * 0.5; // 50% weight
    const valueComponent = Math.max(0, 100 - Math.abs(currentPrice - aiFairValue) * 20) * 0.3; // 30% weight
    const liquidityComponent = Math.max(0, 100 - bidAskSpread * 200) * 0.2; // 20% weight
    const riskValueScore = Math.round(creditComponent + valueComponent + liquidityComponent + (Math.random() - 0.5) * 5);

    generatedBonds.push({
        id: fullIsin,
        isin: fullIsin,
        name: `${issuerInfo.name} ${coupon}% ${year}`,
        issuer: issuerInfo.name,
        coupon: coupon,
        maturityDate: maturityDate,
        creditRating: rating,
        currentPrice: currentPrice,
        aiFairValue: aiFairValue,
        standardFairValue: standardFairValue,
        volume: Math.floor(Math.random() * 190000000) + 10000000,
        bidAskSpread: bidAskSpread,
        dayChange: dayChange,
        riskValueScore: Math.min(100, Math.max(0, riskValueScore)),
        prePlatformVolume: Math.floor(Math.random() * 4000000) + 1000000, // 10-50 Lakhs
        prePlatformInvestors: Math.floor(Math.random() * 400) + 100, // 100-500
    });
}


export const BONDS: Bond[] = generatedBonds;

const portfolioBondsSample = [...generatedBonds].sort(() => 0.5 - Math.random()).slice(0, 8);

export const INITIAL_USER_PORTFOLIO: PortfolioHolding[] = portfolioBondsSample.map(bond => ({
    bondId: bond.id,
    quantity: Math.floor(Math.random() * 450 + 50) * 100, // 5,000 to 50,000
    purchasePrice: parseFloat((bond.currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)) 
}));

export const INITIAL_USER_WALLET_BALANCE = 1000000; // 10 Lakh INR

export const INITIAL_SYSTEM_METRICS: SystemMetrics = {
  UserIntf: { name: 'UserIntf', status: 'Operational', value: 50, unit: 'ms' },
  DPI: { name: 'DPI', status: 'Operational', value: 150, unit: 'ms' },
  APIGW: { name: 'APIGW', status: 'Operational', value: 25, unit: 'req/s' },
  OrderMatch: { name: 'OrderMatch', status: 'Operational', value: 1500, unit: 'ops/s' },
  TokenizSvc: { name: 'TokenizSvc', status: 'Operational', value: 99.98, unit: '%' },
  Pricing: { name: 'Pricing', status: 'Operational', value: 95, unit: '%' }, // cache hit rate
  HederaHashgraph: { name: 'HederaHashgraph', status: 'Operational', value: 1.5, unit: 's' },
  RegulatoryGateway: { name: 'RegulatoryGateway', status: 'Operational', value: 5, unit: 'tx/min' },
};