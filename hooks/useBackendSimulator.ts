import { useState, useEffect, useCallback } from 'react';
import { Bond, SystemMetrics, TransactionEvent, AnalyticsLog, ServiceName, ScenarioType, User } from '../types';
import { INITIAL_SYSTEM_METRICS, INITIAL_USER_WALLET_BALANCE } from '../constants';

const SERVICE_NAMES: ServiceName[] = ['UserIntf', 'DPI', 'APIGW', 'OrderMatch', 'TokenizSvc', 'Pricing', 'HederaHashgraph', 'RegulatoryGateway'];

const useBackendSimulator = (initialBonds: Bond[], isUpiAutopayActive: boolean) => {
    const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_SYSTEM_METRICS);
    const [transactions, setTransactions] = useState<TransactionEvent[]>([]);
    const [analyticsLogs, setAnalyticsLogs] = useState<AnalyticsLog[]>([]);
    const [liveBondData, setLiveBondData] = useState<Record<string, Bond>>(() => 
        Object.fromEntries(initialBonds.map(bond => [bond.id, bond]))
    );
    const [topMovers, setTopMovers] = useState<Bond[]>([]);
    const [activeScenario, setActiveScenario] = useState<ScenarioType>('NORMAL');
    const [simulatedWalletBalance, setSimulatedWalletBalance] = useState(INITIAL_USER_WALLET_BALANCE);

    const isContingencyMode = activeScenario === 'CONTINGENCY';

    const generateDltHash = () => `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const updateTransactionStatus = useCallback((txId: string, status: TransactionEvent['status'], details: string) => {
        setTransactions(prev => prev.map(t => {
            if (t.id === txId) {
                return {
                    ...t,
                    status,
                    details,
                    dltHash: status === 'SUCCESS' && t.type === 'SETTLEMENT' ? generateDltHash() : t.dltHash,
                };
            }
            return t;
        }));
    }, []);
    
    const addAnalyticsLog = useCallback((log: Omit<AnalyticsLog, 'id' | 'timestamp'>) => {
        setAnalyticsLogs(prev => [
             {
                id: `log_${Date.now()}_${Math.random()}`,
                timestamp: new Date().toISOString(),
                ...log,
            },
            ...prev
        ].slice(0, 100));
    }, []);

    const addTransaction = useCallback((tx: Omit<TransactionEvent, 'id' | 'timestamp'>) => {
        const newTx: TransactionEvent = {
            id: `tx_${Date.now()}_${Math.random()}`,
            timestamp: new Date().toISOString(),
            ...tx,
        };
        setTransactions(prev => [newTx, ...prev].slice(0, 200));

        let settlementDelay = 1500;
        if (activeScenario === 'DLT_CONGESTION') settlementDelay = 8000 + Math.random() * 2000;
        if (activeScenario === 'API_GATEWAY_OVERLOAD') settlementDelay = 3000 + Math.random() * 1000;
        if (isContingencyMode) settlementDelay = 2500;

        if (newTx.type === 'KYC') {
            let kycDelay = metrics.DPI.status === 'Operational' ? 2000 + Math.random() * 1000 : 10000 + Math.random() * 5000;
             setTimeout(() => {
                const finalStatus: TransactionEvent['status'] = metrics.DPI.status === 'Operational' ? 'SUCCESS' : 'FAILED';
                const finalDetails = newTx.details.replace('submitted', finalStatus === 'SUCCESS' ? 'verified successfully' : 'failed due to DPI service error');
                updateTransactionStatus(newTx.id, finalStatus, finalDetails);
            }, kycDelay);
        }
        
        if (newTx.type === 'UPI_MANDATE') {
             let upiDelay = 3000 + Math.random() * 1000;
             setTimeout(() => {
                const finalStatus: TransactionEvent['status'] = Math.random() > 0.1 ? 'SUCCESS' : 'FAILED';
                const finalDetails = newTx.details.replace('request sent', finalStatus === 'SUCCESS' ? 'mandate successfully activated' : 'mandate authorization failed');
                updateTransactionStatus(newTx.id, finalStatus, finalDetails);
             }, upiDelay);
        }

        if (newTx.type === 'FUNDING') {
            setTimeout(() => {
                const finalStatus: TransactionEvent['status'] = Math.random() > 0.05 ? 'SUCCESS' : 'FAILED';
                const finalDetails = newTx.details.replace('initiated', finalStatus === 'SUCCESS' ? 'successful' : 'failed');
                updateTransactionStatus(newTx.id, finalStatus, finalDetails);
            }, 2500);
        }

        if (newTx.type === 'ORDER' || newTx.type === 'MATCH') {
            setTimeout(() => {
                const settlementTx: Omit<TransactionEvent, 'id' | 'timestamp'> = {
                    type: 'SETTLEMENT',
                    status: 'PENDING',
                    details: newTx.details.replace('order submitted', 'settlement pending'),
                };
                const finalSettlementTx: TransactionEvent = { ...settlementTx, id: `tx_${Date.now()}_${Math.random()}`, timestamp: new Date().toISOString() };
                setTransactions(prev => [finalSettlementTx, ...prev].slice(0, 200));

                setTimeout(() => {
                    const dltProvider = finalSettlementTx.details.includes('Block trade') ? 'Permissioned DLT (Corda)' : isContingencyMode ? 'Standard Clearing' : 'Hedera DLT';
                    const finalStatus: TransactionEvent['status'] = Math.random() < 0.95 ? 'SUCCESS' : 'FAILED';
                    const finalDetails = finalSettlementTx.details.replace('pending', finalStatus === 'SUCCESS' ? `settled via ${dltProvider}` : 'failed');
                    updateTransactionStatus(finalSettlementTx.id, finalStatus, finalDetails);

                    // Auto Top-up simulation
                    if (finalStatus === 'SUCCESS' && isUpiAutopayActive && simulatedWalletBalance < 50000) {
                        addAnalyticsLog({service: 'Swarm', message: `User wallet low. Triggering UPI Autopay.`});
                        addTransaction({
                            type: 'FUNDING',
                            status: 'PENDING',
                            details: `Automatic wallet funding of ₹200,000 initiated.`
                        });
                        setSimulatedWalletBalance(prev => prev + 200000);
                    }
                }, settlementDelay);
            }, 500);
        }
        return newTx;
    }, [activeScenario, isContingencyMode, updateTransactionStatus, metrics.DPI.status, isUpiAutopayActive, simulatedWalletBalance, addAnalyticsLog]);

    const updateSimulatedWalletBalance = useCallback((newBalance: number) => {
        setSimulatedWalletBalance(newBalance);
    }, []);

    const runScenario = (scenario: ScenarioType) => {
        setMetrics(INITIAL_SYSTEM_METRICS);
        setActiveScenario(scenario);
    };

    useEffect(() => {
        const sortedByChange = [...initialBonds].sort((a, b) => Math.abs(b.dayChange) - Math.abs(a.dayChange));
        setTopMovers(sortedByChange.slice(0, 10));
        
        const interval = setInterval(() => {
            const newMetrics: SystemMetrics = JSON.parse(JSON.stringify(metrics));
            let transactionChance = 0.5;

            switch(activeScenario) {
                case 'VOLATILITY_SPIKE':
                    transactionChance = 0.9;
                    newMetrics.OrderMatch.value = 7500 + Math.random() * 2000;
                    if (Math.random() < 0.3) addAnalyticsLog({ service: 'Swarm', message: 'Liquidity Swarm activated. Re-routing order flow.' });
                    setLiveBondData(prevData => {
                        const newData = { ...prevData };
                        for (let i = 0; i < 200; i++) {
                            const bond = initialBonds[Math.floor(Math.random() * initialBonds.length)];
                            const change = (Math.random() - 0.5) * 0.25;
                            const newPrice = Math.max(80, (newData[bond.id]?.currentPrice || bond.currentPrice) * (1 + change / 100));
                            if(newData[bond.id]) newData[bond.id] = { ...newData[bond.id], currentPrice: newPrice };
                        }
                        return newData;
                    });
                    break;
                case 'API_GATEWAY_OVERLOAD':
                    newMetrics.APIGW.status = Math.random() < 0.2 ? 'Down' : 'Degraded';
                    newMetrics.APIGW.value = 500 + Math.random() * 300;
                    newMetrics.UserIntf.value = 300 + Math.random() * 200;
                    newMetrics.APIGW.requestsBlocked = Math.floor(newMetrics.APIGW.value * (0.8 + Math.random() * 0.15));
                    if (Math.random() < 0.5) addAnalyticsLog({ service: 'AIS', message: `Anomalous traffic detected. Blocking ${Math.floor(Math.random()*20)+5} IPs.` });
                    break;
                case 'DLT_CONGESTION':
                    newMetrics.HederaHashgraph.status = 'Degraded';
                    newMetrics.HederaHashgraph.value = 8 + Math.random() * 4;
                    newMetrics.HederaHashgraph.pendingQueue = (newMetrics.HederaHashgraph.pendingQueue || 0) + Math.floor(Math.random() * 150);
                    break;
                case 'DPI_OUTAGE':
                    newMetrics.DPI.status = 'Down';
                    newMetrics.DPI.value = 10000 + Math.random() * 2000;
                    newMetrics.DPI.errorRate = 95 + Math.random() * 5;
                    if (Math.random() < 0.3) addTransaction({ type: 'KYC', status: 'FAILED', details: 'KYC verification failed: DPI service unreachable.' });
                    break;
                case 'CONTINGENCY':
                    newMetrics.Pricing.status = 'Down';
                    newMetrics.Pricing.value = 0; // 0% cache hit
                    newMetrics.OrderMatch.value = 800 + Math.random() * 200; // Slower standard engine
                    newMetrics.HederaHashgraph.status = 'Down';
                    newMetrics.HederaHashgraph.value = 2.5;
                    newMetrics.RegulatoryGateway.status = 'Degraded';
                    break;
                case 'NORMAL':
                     if (newMetrics.HederaHashgraph.pendingQueue && newMetrics.HederaHashgraph.pendingQueue > 0) {
                        newMetrics.HederaHashgraph.pendingQueue = Math.max(0, newMetrics.HederaHashgraph.pendingQueue - 500);
                     }
                    break;
            }

            SERVICE_NAMES.forEach(name => {
                if (newMetrics[name] && newMetrics[name].status === 'Operational' && activeScenario !== 'CONTINGENCY') {
                    newMetrics[name].value *= (1 + (Math.random() - 0.5) * 0.1);
                }
            });
            setMetrics(newMetrics);

            if (Math.random() < transactionChance) {
                addTransaction({
                    type: 'MATCH',
                    status: 'SUCCESS',
                    details: `[${initialBonds[Math.floor(Math.random() * initialBonds.length)].isin}] order matched`
                });
            }

            // Simulate a large institutional trade for the regulatory dashboard
            if (activeScenario !== 'CONTINGENCY' && Math.random() < 0.05) {
                const tradeValue = (Math.floor(Math.random() * 10) + 5) * 10000000; // 50-150 Cr
                 addTransaction({
                    type: 'MATCH',
                    status: 'SUCCESS',
                    details: `[${initialBonds[Math.floor(Math.random() * initialBonds.length)].isin}] Block trade matched (₹${(tradeValue / 10000000).toFixed(0)} Cr)`
                });
            }
            
        }, 1800);

        return () => clearInterval(interval);
    }, [initialBonds, addTransaction, addAnalyticsLog, activeScenario, metrics]);

    return { metrics, transactions, analyticsLogs, liveBondData, topMovers, runScenario, activeScenario, isContingencyMode, addTransaction, updateSimulatedWalletBalance };
};

export { useBackendSimulator };