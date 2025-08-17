export enum CreditRating {
  AAA = 'AAA',
  AA_PLUS = 'AA+',
  AA = 'AA',
  A_PLUS = 'A+',
  A = 'A',
  BBB = 'BBB',
  BB = 'BB',
  B = 'B',
  C = 'C',
  D = 'D',
}

export interface Bond {
  id: string;
  name: string;
  issuer: string;
  coupon: number;
  maturityDate: string;
  creditRating: CreditRating;
  currentPrice: number;
  aiFairValue: number;
  standardFairValue: number;
  isin: string;
  volume: number;
  bidAskSpread: number;
  dayChange: number;
  // New fields for enhanced analysis
  riskValueScore: number; // 1-100, higher is better (less risk, better value)
  prePlatformVolume: number;
  prePlatformInvestors: number;
}

export interface PortfolioHolding {
  bondId: string;
  quantity: number;
  purchasePrice: number;
}

export type Page = 'dashboard' | 'marketplace' | 'portfolio' | 'bondDetail' | 'system-analytics' | 'integrations' | 'hardware-acceleration';

export type ViewState = {
  page: Page;
  bondId?: string;
};

export interface User {
  isConnected: boolean;
  walletAddress: string;
  walletBalance: number; // in INR
  kycStatus: 'unverified' | 'pending' | 'verified';
  upiAutopay: {
    status: 'none' | 'pending' | 'active';
    threshold: number;
    amount: number;
  };
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// Types for Backend Simulation
export type ServiceName = 
  'UserIntf' | 'DPI' | 'APIGW' | 
  'OrderMatch' | 'TokenizSvc' | 'Pricing' | 
  'HederaHashgraph' | 'RegulatoryGateway' |
  // New services for scalability simulation
  'Kafka' | 'AggregationSvc' | 
  'OrderMatchShard1' | 'OrderMatchShard2' | 'OrderMatchShard3';


export type ScenarioType = 'NORMAL' | 'VOLATILITY_SPIKE' | 'API_GATEWAY_OVERLOAD' | 'DLT_CONGESTION' | 'DPI_OUTAGE' | 'CONTINGENCY' | 'SCALE_TEST';

export interface SystemMetric {
  name: ServiceName;
  status: 'Operational' | 'Degraded' | 'Down' | 'Active';
  value: number;
  unit: string;
  // Optional scenario-specific data
  errorRate?: number; // For DPI outage
  requestsBlocked?: number; // for API GW overload
  pendingQueue?: number; // for DLT congestion
  bufferSize?: number; // for Kafka
}

export type SystemMetrics = Record<ServiceName, SystemMetric>;

export interface TransactionEvent {
  id: string;
  timestamp: string;
  type: 'KYC' | 'ORDER' | 'MATCH' | 'TOKENIZE' | 'SETTLEMENT' | 'PRICE_UPDATE' | 'UPI_MANDATE' | 'FUNDING';
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  details: string;
  dltHash?: string;
}

export interface AnalyticsLog {
  id: string;
  timestamp: string;
  service: 'Pricing' | 'AIS' | 'Swarm' | 'AggregationSvc';
  message: string;
}