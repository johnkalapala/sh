import { useState, useEffect, useCallback } from 'react';
import { Bond, SystemMetrics, TransactionEvent, AnalyticsLog, ServiceName } from '../types';
import { INITIAL_SYSTEM_METRICS } from '../constants';

const SERVICE_NAMES: ServiceName[] = ['UserIntf', 'DPI', 'APIGW', 'OrderMatch', 'TokenizSvc', 'Pricing', 'Settlement'];
const TRANSACTION_TYPES: TransactionEvent['type'][] = ['KYC', 'ORDER', 'MATCH', 'TOKENIZE', 'SETTLEMENT', 'PRICE_UPDATE'];

// A more realistic simulation for backend services
const simulateServiceMetric = (metric: any) => {
    const change = (Math.random() - 0.5) * (metric.value * 0.1); // Fluctuate by up to 10%
    const newValue = metric.value + change;
    
    // Simulate occasional status changes
    let status = 'Operational';
    if (Math.random() < 0.01) status = 'Degraded';
    if (Math.random() < 0.001) status = 'Down';

    return { ...metric, value: Math.max(0, newValue), status };
};

export const useBackendSimulator = (initialBonds: Bond[]) => {
    const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_SYSTEM_METRICS);
    const [transactions, setTransactions] = useState<TransactionEvent[]>([]);
    const [analyticsLogs, setAnalyticsLogs] = useState<AnalyticsLog[]>([]);
    const [liveBondData, setLiveBondData] = useState<Record<string, Bond>>(() => {
        const initialData: Record<string, Bond> = {};
        initialBonds.forEach(bond => {
            initialData[bond.id] = bond;
        });
        return initialData;
    });

    const addTransaction = useCallback((tx: Omit<TransactionEvent, 'id' | 'timestamp'>) => {
        setTransactions(prev => [
            {
                id: `tx_${Date.now()}_${Math.random()}`,
                timestamp: new Date().toISOString(),
                ...tx,
            },
            ...prev
        ].slice(0, 100)); // Keep last 100 transactions
    }, []);

    const addAnalyticsLog = useCallback((log: Omit<AnalyticsLog, 'id' | 'timestamp'>) => {
        setAnalyticsLogs(prev => [
             {
                id: `log_${Date.now()}_${Math.random()}`,
                timestamp: new Date().toISOString(),
                ...log,
            },
            ...prev
        ].slice(0, 100)); // Keep last 100 logs
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            // Update metrics
            setMetrics(prevMetrics => {
                const newMetrics: any = {};
                for (const key of SERVICE_NAMES) {
                    newMetrics[key] = simulateServiceMetric(prevMetrics[key]);
                }
                // Simulate total volume for settlement
                newMetrics.Settlement.value = newMetrics.Settlement.value + Math.random() * 10000;
                return newMetrics as SystemMetrics;
            });
            
            // Simulate a new transaction
            if (Math.random() < 0.7) { // 70% chance to add a new transaction each tick
                const type = TRANSACTION_TYPES[Math.floor(Math.random() * TRANSACTION_TYPES.length)];
                const randomBond = initialBonds[Math.floor(Math.random() * initialBonds.length)];
                addTransaction({
                    type,
                    status: Math.random() < 0.95 ? 'SUCCESS' : 'FAILED',
                    details: `[${randomBond.isin}] ${type} processed for ${randomBond.issuer}`
                });
            }

            // Simulate a new analytics log
            if (Math.random() < 0.5) {
                 const randomBond = initialBonds[Math.floor(Math.random() * initialBonds.length)];
                 const isCacheHit = Math.random() < 0.85; // 85% cache hit rate
                 addAnalyticsLog({
                     service: 'Pricing',
                     message: isCacheHit 
                        ? `[Cache HIT] Fair value retrieved for ${randomBond.isin}`
                        : `[Cache MISS] Recalculating fair value for ${randomBond.isin} from market data.`
                 });
            }
            
        }, 1500); // Main tick interval

        return () => clearInterval(interval);
    }, [initialBonds, addTransaction, addAnalyticsLog]);

    return { metrics, transactions, analyticsLogs, liveBondData };
};
