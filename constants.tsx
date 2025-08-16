import React from 'react';
import { Bond, CreditRating, PortfolioHolding, SystemMetrics } from './types';

// --- Data Generation based on User-Provided ISINs ---

const userIsinPrefixes = [
  'INE002Z08', 'INE003K0', 'INE003L07', 'INE004H0', 'INE005X08', 'INE006S0', 'INE008A08', 'INE008107', 'INE008108', 
  'INE00C30', 'INE00CC0', 'INE00CD0', 'INE00F10', 'INE00H80', 'INE00HUO', 'INE00JWO', 'INE00MB0', 'INEOONNO', 'INE00PB0', 
  'INE00PEO', 'INE00QV0', 'INE00S40', 'INE00SX0', 'INE00UD0', 'INE00VH0', 'INE00W10', 'INE00WKC', 'INE00WM', 'INE00XA0', 
  'INE00XK0', 'INE00XO0', 'INE00YHO', 'INE00ZD0', 'INE010Q0', 'INE010T07', 'INE011207', 'INE013A0', 'INE015Q0', 'INE016807', 
  'INE019107', 'INE01AP0', 'INE01BP0', 'INE01CB0', 'INE01CC0', 'INE01CY0', 'INE01E408', 'INE01E708', 'INE01EB0', 'INE01EU0', 
  'INE01GB0', 'INE01H10', 'INE01HK0', 'INE011507', 'INE01J408', 'INE01KC0', 'INE01KF0', 'INE01KX0', 'INE01M30', 'INE01MK0', 
  'INE01NJO', 'INE01SI07', 'INE01V20', 'INE01VM0', 'INE01WI0', 'INE01YLO', 'INE01ZK0', 'INE020B0', 'INE021T07', 'INE021Y0', 
  'INE022708', 'INE02300', 'INE024J07', 'INE025Y0', 'INE026B08', 'INE026K08', 'INE026Y0', 'INE027707', 'INE027E0', 'INE027Y0', 
  'INE028K08', 'INE028Y0', 'INE029608', 'INE029A0', 'INE029Y0', 'INE02AA0', 'INE02AD0', 'INE02BB0', 'INE02BD0', 'INE02BE0', 
  'INE02BM0', 'INE02C60', 'INE02DX0', 'INE02E10', 'INE02E308', 'INE02FM0', 'INE02HE0', 'INE02JD0', 'INE02KL0', 'INE02MUC', 
  'INE02PG0', 'INE02PL0', 'INE02QH0', 'INE02T808', 'INE02T108', 'INE02TS0', 'INE02UX0', 'INE02V408', 'INE02V508', 'INE02VL0', 
  'INE02VO0', 'INE02WRO', 'INE02Y10', 'INE030Y0', 'INE031Y0', 'INE032P0', 'INE032Y0', 'INE033308', 'INE033N0', 'INE033Y0', 
  'INE03490', 'INE034Y0', 'INE035Y0', 'INE036L08', 'INE036T0', 'INE036U0', 'INE036Y0', 'INE037008', 'INE037208', 'INE037Y0', 
  'INE038V0', 'INE038Y0', 'INE03DO0', 'INE03KA0', 'INE03L508', 'INE03PV0', 'INE03R108', 'INE03WNO', 'INE03XB0', 'INE040407', 
  'INE04200', 'INE042R0', 'INE042T0', 'INE042W0', 'INE043A0', 'INE043V0', 'INE044Y0', 'INE045107', 'INE045V0', 'INE047T0', 
  'INE048C0', 'INE048M0', 'INE049N0', 'INE04D30', 'INE04DK0', 'INE04E00', 'INE04IT08', 'INE04LN0', 'INE04PJ0', 'INE04SE0', 
  'INE04UP0', 'INE04VS0', 'INE04WFC', 'INE05090', 'INE050N0', 'INE050Q0', 'INE05130', 'INE052108', 'INE052808', 'INE053F0', 
  'INE053107', 'INE056Q0', 'INE059B0', 'INE059T07', 'INE05CL0', 'INE05F40', 'INE05FN0', 'INE05JK0', 'INE050C2', 'INE050F0', 
  'INE05UJ0', 'INE05VE0', 'INE05V107', 'INE05VX0', 'INE05XS0', 'INE062N0', 'INE062R0', 'INE065507', 'INE066108', 'INE067707', 
  'INE067H0', 'INE067L08', 'INE069R0', 'INE069T07', 'INE06BT0', 'INE06E50', 'INE06HB0', 'INE06HD0', 'INE06MQC', 'INE06N30', 
  'INE06NV0', 'INE06PM0', 'INE06WPC', 'INE06WUC', 'INE070707', 'INE071408', 'INE071508', 'INE071G0', 'INE07230', 'INE072608', 
  'INE072R0', 'INE073107', 'INE075B0', 'INE077W0', 'INE078208', 'INE079W0', 'INE07A408', 'INE07AK0', 'INE07G80', 'INE07GT0', 
  'INE07HK0', 'INE07HU0', 'INE07J607', 'INE07J608', 'INE07J807', 'INE070X0', 'INE07PQ0', 'INE07SR0', 'INE07V90', 'INE07WAC', 
  'INE080T0', 'INE081207', 'INE081Z0', 'INE082M0', 'INE082P0', 'INE082X08', 'INE084P0', 'INE085X08', 'INE085Z08', 'INE086E0', 
  'INE087107', 'INE087P0', 'INE089C0', 'INE089M0', 'INE08BB0', 'INE08D20', 'INE08D60', 'INE08E80', 'INE08FJ07', 'INE08GK0', 
  'INE08GP0', 'INE08KJ07', 'INE08S10', 'INE08UY0', 'INE08VD0', 'INE08XP0', 'INE090A0', 'INE090F0', 'INE090T0', 'INE090W0', 
  'INE091H0', 'INE091Y0', 'INE092T08', 'INE093J0', 'INE093JA', 'INE093JB', 'INE096D0', 'INE097P0', 'INE098S08', 'INE098T0', 
  'INE099J07', 'INE099T07', 'INE09AF0', 'INE09CH0', 'INE09CJ0', 'INE09ES0', 'INE09GT0', 'INE09GV0', 'INE09IK08', 'INE09K308', 
  'INE09LA0', 'INE09N80', 'INE09S30', 'INE09TK0', 'INE09Z208', 'INE0A240', 'INE0A300', 'INE0A3Z0', 'INEOAABO', 'INE0AB70', 
  'INEOACSO', 'INEOAFSO', 'INEOAKCO', 'INEOAKEO', 'INEOAKLO', 'INEOANAO', 'INEOANXO', 'INEOATQ0', 'INE0AY20', 'INEOBOGO', 
  'INEOBOO0', 'INE0B2A0', 'INEOB3K0', 'INE0B4P0', 'INE0B7Y0', 'INEOBA00', 'INEOBDEO', 'INEOBDJO', 'INEOBF30', 'INEOBNJO', 
  'INEOBNZO', 'INEOBPLO', 'INEOBQBC', 'INEOBUSO', 'INE0C4X0', 'INE0C8R0', 'INEOCDNC', 'INEOCHUC', 'INEOCJUO', 'INEOCJZO', 
  'INE0CK30', 'INEOCKLO', 'INEOCMW', 'INEOCNOC', 'INE0CR40', 'INEOCTFO', 'INE0CV50', 'INE0D0E0', 'INE0D3Z0', 'INE0D570', 
  'INE0D7Q0', 'INE0D9V0', 'INEODFGC', 'INEODFTO', 'INEODG30', 'INEODG90', 'INEODKFO', 'INEODL30', 'INE0DS10', 'INEODWXI', 
  'INEOEOXO', 'INE0E230', 'INE0E3PO', 'INE0E4Z0', 'INE0E6N0', 'INEOEBGC', 'INEOELRO', 'INEOESPO', 'INEOEUKO', 'INE0F5A0', 
  'INEOF8V0', 'INEOFCZO', 'INEOFDYO', 'INEOFFRO', 'INEOFJX0', 'INEOFKG0', 'INEOFNBO', 'INEOFPFO', 'INEOFSTO', 'INEOFU20', 
  'INEOFW6C', 'INEOFWP', 'INEOFY10', 'INE0GA40', 'INE0GB70', 'INEOGEFO', 'INE0GH90', 'INEOGMF', 'INEOGOLC', 'INEOGQLC', 
  'INEOGQN', 'INE0GS80', 'INE0GSZO', 'INE0GT80', 'INE0GTW', 'INE0GVF2', 'INE0GWG', 'INE0GYZO', 'INE0GZ80', 'INE0GZUC', 
  'INE0H7107', 'INEOH8N0', 'INE0H940', 'INE0H960', 'INEOHDDO', 'INEOHL40', 'INEOHLQO', 'INEOHOM', 'INE0HP70', 'INEOHRVC', 
  'INEOHWC', 'INEOHY70', 'INE010107', 'INE011P07', 'INE0I1Q07', 'INE017B07', 'INE017V07', 'INE019Z07', 'INEOIFR07', 
  'INEOIHDO', 'INEOIHV07', 'INE011508', 'INEOIR007', 'INEOISL07', 'INE0IX207', 'INE0IX908', 'INEOIYC07', 'INE0J9U0', 
  'INE0J9Z07', 'INEOJAHO', 'INEOJEFO', 'INEOJJ908', 'INEOJK807', 'INEOJKAO', 'INEOJLGO', 'INE0JR70', 'INEOJT707', 
  'INEOK0208', 'INE0K2Q0', 'INE0K4F0', 'INEOK8T0', 'INEOK960', 'INEOK9P0', 'INEOKANO', 'INEOKBVO', 'INEOKDHC', 
  'INEOKETO', 'INEOKGZO', 'INEOKJI07', 'INE0KM30', 'INEOKN40', 'INE0KQ40', 'INEOKQ80', 'INEOKVAO', 'INEOL0007', 
  'INEOL0J07', 'INEOL2T0', 'INEOL7707', 'INEOLBMO', 'INEOLEZO', 'INEOLLNO', 'INEOLLXO', 'INEOLP208', 'INEOLS00'
];

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

const padIsin = (prefix: string): string => {
    let result = prefix.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (result.length > 12) {
      result = result.substring(0, 12);
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while (result.length < 12) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};


const generatedBonds: Bond[] = [];
const isinSet = new Set<string>();

userIsinPrefixes.forEach(prefix => {
    const fullIsin = padIsin(prefix);
    if (isinSet.has(fullIsin)) return; // Avoid duplicates
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
        volume: Math.floor(Math.random() * 190000000) + 10000000,
        bidAskSpread: parseFloat((Math.random() * 0.2 + 0.05).toFixed(3)),
    });
});


export const BONDS: Bond[] = generatedBonds;

const portfolioBondsSample = [...generatedBonds].sort(() => 0.5 - Math.random()).slice(0, 8);

export const INITIAL_USER_PORTFOLIO: PortfolioHolding[] = portfolioBondsSample.map(bond => ({
    bondId: bond.id,
    quantity: Math.floor(Math.random() * 450 + 50) * 100, // 5,000 to 50,000
    purchasePrice: parseFloat((bond.currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)) 
}));

export const INITIAL_USER_BALANCE = 1000000; // 10 Lakh INR

export const INITIAL_SYSTEM_METRICS: SystemMetrics = {
  UserIntf: { name: 'UserIntf', status: 'Operational', value: 50, unit: 'ms' },
  DPI: { name: 'DPI', status: 'Operational', value: 150, unit: 'ms' },
  APIGW: { name: 'APIGW', status: 'Operational', value: 25, unit: 'req/s' },
  OrderMatch: { name: 'OrderMatch', status: 'Operational', value: 1500, unit: 'ops/s' },
  TokenizSvc: { name: 'TokenizSvc', status: 'Operational', value: 99.98, unit: '%' },
  Pricing: { name: 'Pricing', status: 'Operational', value: 95, unit: '%' }, // cache hit rate
  Settlement: { name: 'Settlement', status: 'Operational', value: 10, unit: 's' },
};
