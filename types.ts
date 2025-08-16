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
  isin: string;
  volume: number;
  bidAskSpread: number;
}

export interface PortfolioHolding {
  bondId: string;
  quantity: number;
  purchasePrice: number;
}

export type Page = 'dashboard' | 'marketplace' | 'portfolio' | 'bondDetail' | 'system-analytics';

export type ViewState = {
  page: Page;
  bondId?: string;
};

export interface User {
  isConnected: boolean;
  walletAddress: string;
  balance: number; // in INR
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// Types for Backend Simulation
export type ServiceName = 'UserIntf' | 'DPI' | 'APIGW' | 'OrderMatch' | 'TokenizSvc' | 'Pricing' | 'Settlement';

export interface SystemMetric {
  name: ServiceName;
  status: 'Operational' | 'Degraded' | 'Down';
  value: number;
  unit: string;
}

export type SystemMetrics = Record<ServiceName, SystemMetric>;

export interface TransactionEvent {
  id: string;
  timestamp: string;
  type: 'KYC' | 'ORDER' | 'MATCH' | 'TOKENIZE' | 'SETTLEMENT' | 'PRICE_UPDATE';
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  details: string;
}

export interface AnalyticsLog {
  id: string;
  timestamp: string;
  service: 'Pricing';
  message: string;
}
