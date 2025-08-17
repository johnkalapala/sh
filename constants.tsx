
import { SystemMetrics } from './types';

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
  // Scalability services
  Kafka: { name: 'Kafka', status: 'Operational', value: 25000, unit: 'msg/s' },
  AggregationSvc: { name: 'AggregationSvc', status: 'Operational', value: 100, unit: 'ms' },
  OrderMatchShard1: { name: 'OrderMatchShard1', status: 'Operational', value: 0, unit: 'ops/s', p99Latency: 5 },
  OrderMatchShard2: { name: 'OrderMatchShard2', status: 'Operational', value: 0, unit: 'ops/s', p99Latency: 5 },
  OrderMatchShard3: { name: 'OrderMatchShard3', status: 'Operational', value: 0, unit: 'ops/s', p99Latency: 5 },
};
