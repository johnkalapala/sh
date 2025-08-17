import { useState, useEffect, useCallback, useReducer } from 'react';
import { Bond, SystemMetrics, TransactionEvent, AnalyticsLog, ServiceName, ScenarioType, User, PortfolioHolding, ToastMessage } from '../types';
import { INITIAL_SYSTEM_METRICS, INITIAL_USER_WALLET_BALANCE } from '../constants';
import { generateInitialBondMarket, getMarketPriceUpdates, generateGeminiAnalysis } from '../services/geminiService';
import { loadState, saveState, clearState } from '../utils/storage';

const SERVICE_NAMES: ServiceName[] = ['UserIntf', 'DPI', 'APIGW', 'OrderMatch', 'TokenizSvc', 'Pricing', 'HederaHashgraph', 'RegulatoryGateway', 'Kafka', 'AggregationSvc', 'OrderMatchShard1', 'OrderMatchShard2', 'OrderMatchShard3'];

const initialKycState = {
  status: 'unverified' as 'unverified' | 'pending' | 'verified',
  aadhaar: 'unverified' as 'unverified' | 'verified',
  pan: 'unverified' as 'unverified' | 'verified',
  bank: 'unverified' as 'unverified' | 'verified',
};

const initialUserState: User = { 
  isConnected: false, 
  walletAddress: '', 
  walletBalance: 0, 
  kyc: initialKycState,
  upiAutopay: { status: 'none', threshold: 50000, amount: 200000 }
};

type BackendState = {
    bonds: Bond[];
    user: User;
    userPortfolio: PortfolioHolding[];
    metrics: SystemMetrics;
    transactions: TransactionEvent[];
    analyticsLogs: AnalyticsLog[];
    topMovers: Bond[];
    totalVolume: number;
    activeScenario: ScenarioType;
    isCircuitBreakerTripped: boolean;
    isContingencyMode: boolean;
};

type Action =
  | { type: 'SET_BONDS'; payload: Bond[] }
  | { type: 'UPDATE_BOND_PRICES'; payload: any[] }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_PORTFOLIO'; payload: PortfolioHolding[] }
  | { type: 'ADD_TRANSACTION'; payload: TransactionEvent }
  | { type: 'UPDATE_TRANSACTION'; payload: { txId: string; status: TransactionEvent['status']; details: string, dltHash?: string } }
  | { type: 'ADD_ANALYTICS_LOG'; payload: AnalyticsLog }
  | { type: 'SET_METRICS'; payload: SystemMetrics }
  | { type: 'SET_SCENARIO'; payload: ScenarioType }
  | { type: 'SET_CIRCUIT_BREAKER'; payload: boolean }
  | { type: 'SET_INITIAL_STATE'; payload: { user: User; portfolio: PortfolioHolding[] } };


const reducer = (state: BackendState, action: Action): BackendState => {
    switch(action.type) {
        case 'SET_INITIAL_STATE':
            return { ...state, user: action.payload.user, userPortfolio: action.payload.portfolio };
        case 'SET_BONDS': {
            const bonds = action.payload;
            const topMovers = [...bonds].sort((a, b) => Math.abs(b.dayChange) - Math.abs(a.dayChange)).slice(0, 10);
            return { ...state, bonds, topMovers };
        }
        case 'UPDATE_BOND_PRICES': {
            const updates = action.payload;
            const bondsMap = new Map(state.bonds.map(b => [b.isin, b]));
            updates.forEach(update => {
                const bond = bondsMap.get(update.isin);
                if(bond) {
                    const oldPrice = bond.currentPrice;
                    const newPrice = update.newPrice;
                    bond.currentPrice = newPrice;
                    bond.volume = update.newVolume;
                    bond.bidAskSpread = update.newBidAskSpread;
                    bond.dayChange = ((newPrice - oldPrice) / oldPrice) * 100;
                }
            });
            const updatedBonds = Array.from(bondsMap.values());
            const topMovers = [...updatedBonds].sort((a, b) => Math.abs(b.dayChange) - Math.abs(a.dayChange)).slice(0, 10);
            return { ...state, bonds: updatedBonds, topMovers };
        }
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_PORTFOLIO':
            return { ...state, userPortfolio: action.payload };
        case 'ADD_TRANSACTION':{
             const newTransactions = [action.payload, ...state.transactions].slice(0, 200);
             const newVolume = newTransactions
                .filter(tx => tx.status === 'SUCCESS' && tx.type === 'SETTLEMENT')
                .reduce((sum, tx) => {
                    const match = tx.details.match(/(\d+\.\d{4})\s*units/);
                    const priceMatch = tx.details.match(/price\s*~\s*(\d+\.\d+)/);
                    if(match && priceMatch) {
                        return sum + (parseFloat(match[1]) * parseFloat(priceMatch[1]));
                    }
                    return sum;
                }, 0);
            return { ...state, transactions: newTransactions, totalVolume: newVolume };
        }
        case 'UPDATE_TRANSACTION': {
            const { txId, status, details, dltHash } = action.payload;
            return {
                ...state,
                transactions: state.transactions.map(t => t.id === txId ? { ...t, status, details, dltHash: dltHash || t.dltHash } : t)
            };
        }
        case 'ADD_ANALYTICS_LOG':
             return { ...state, analyticsLogs: [action.payload, ...state.analyticsLogs].slice(0, 100) };
        case 'SET_METRICS':
            return { ...state, metrics: action.payload };
        case 'SET_SCENARIO':
            return { ...state, activeScenario: action.payload, isContingencyMode: action.payload === 'CONTINGENCY' };
        case 'SET_CIRCUIT_BREAKER':
            return { ...state, isCircuitBreakerTripped: action.payload };
        default:
            return state;
    }
};


export const useAdvancedBackend = () => {
    const [state, dispatch] = useReducer(reducer, {
        bonds: [],
        user: initialUserState,
        userPortfolio: [],
        metrics: INITIAL_SYSTEM_METRICS,
        transactions: [],
        analyticsLogs: [],
        topMovers: [],
        totalVolume: 0,
        activeScenario: 'NORMAL',
        isCircuitBreakerTripped: false,
        isContingencyMode: false,
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // --- Toast Handler ---
    const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [{ id, message, type }, ...prev].slice(0, 5));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);
    
    // --- Initial Load ---
    useEffect(() => {
        const initialize = async () => {
            const savedState = loadState();
            if (savedState) {
                dispatch({ type: 'SET_INITIAL_STATE', payload: savedState });
            }
            
            setIsLoading(true);
            try {
                const initialBonds = await generateInitialBondMarket();
                if(initialBonds && initialBonds.length > 0) {
                    dispatch({ type: 'SET_BONDS', payload: initialBonds });
                } else {
                    addToast("Failed to generate market data from AI. Please refresh.", "error");
                }
            } catch (error) {
                 addToast("Critical error fetching market data.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, [addToast]);
    
    // --- Live Market Data Feed ---
    useEffect(() => {
        if(state.bonds.length === 0 || state.isContingencyMode) return;
        const interval = setInterval(async () => {
            const updates = await getMarketPriceUpdates(state.bonds);
            if (updates && updates.length > 0) {
                dispatch({ type: 'UPDATE_BOND_PRICES', payload: updates });
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [state.bonds, state.isContingencyMode]);

    // --- Persist State ---
    useEffect(() => {
        if (state.user.isConnected) {
            saveState({ user: state.user, portfolio: state.userPortfolio });
        }
    }, [state.user, state.userPortfolio]);


    // --- User Actions ---
    const handleConnectWallet = () => {
        const randomAddress = `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        const newUserState: User = {
            isConnected: true,
            walletAddress: randomAddress,
            walletBalance: INITIAL_USER_WALLET_BALANCE,
            kyc: initialKycState,
            upiAutopay: { status: 'none', threshold: 50000, amount: 200000 }
        };
        dispatch({ type: 'SET_USER', payload: newUserState });

        if (state.bonds.length > 0) {
            const portfolioBondsSample = [...state.bonds].sort(() => 0.5 - Math.random()).slice(0, 3);
            const initialPortfolio: PortfolioHolding[] = portfolioBondsSample.map(bond => ({
                bondId: bond.id,
                quantity: Math.floor(Math.random() * 450 + 50) * 100,
                purchasePrice: parseFloat((bond.currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
            }));
            dispatch({ type: 'SET_PORTFOLIO', payload: initialPortfolio });
        } else {
            dispatch({ type: 'SET_PORTFOLIO', payload: [] });
        }
        addToast("Wallet connected successfully!");
    };
    
    const handleDisconnectWallet = () => {
        clearState();
        dispatch({ type: 'SET_USER', payload: initialUserState });
        dispatch({ type: 'SET_PORTFOLIO', payload: [] });
        addToast("Wallet disconnected.", "error");
    };

    // --- Transaction Simulation Logic ---
    const addTransaction = useCallback((tx: Omit<TransactionEvent, 'id' | 'timestamp'>) => {
        const newTx: TransactionEvent = {
            id: `tx_${Date.now()}_${Math.random()}`,
            timestamp: new Date().toISOString(),
            ...tx,
        };
        dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
        return newTx;
    }, []);

    const updateTransactionStatus = useCallback((txId: string, status: TransactionEvent['status'], details: string) => {
        const dltHash = status === 'SUCCESS' && details.includes('settled') ? `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined;
        dispatch({ type: 'UPDATE_TRANSACTION', payload: { txId, status, details, dltHash } });
    }, []);

    useEffect(() => {
        // Process pending transactions
        state.transactions.forEach(tx => {
            if (tx.status === 'PENDING') {
                switch(tx.type) {
                    case 'ORDER':
                         setTimeout(() => {
                            const matchDetails = tx.details.replace('submitted', `matched at price ~ ${state.bonds.find(b => tx.details.includes(b.isin))?.currentPrice.toFixed(2)}`);
                            const settlementTx = addTransaction({ type: 'SETTLEMENT', status: 'PENDING', details: matchDetails });
                            
                            let settlementDelay = state.isContingencyMode ? 2500 : 1500;
                            if (state.activeScenario === 'DLT_CONGESTION') settlementDelay = 8000;
                            
                            setTimeout(() => {
                                const finalStatus: TransactionEvent['status'] = Math.random() < 0.95 ? 'SUCCESS' : 'FAILED';
                                const dltProvider = state.isContingencyMode ? 'Standard Clearing' : 'Hedera DLT';
                                const finalDetails = settlementTx.details.replace('matched', finalStatus === 'SUCCESS' ? `settled via ${dltProvider}` : 'failed');
                                updateTransactionStatus(settlementTx.id, finalStatus, finalDetails);
                            }, settlementDelay);
                         }, 500);
                         break;
                    case 'KYC':
                         setTimeout(() => {
                            const finalStatus: TransactionEvent['status'] = state.metrics.DPI.status === 'Operational' ? 'SUCCESS' : 'FAILED';
                            const finalDetails = tx.details.replace('submitted', finalStatus === 'SUCCESS' ? 'verified' : 'failed');
                            updateTransactionStatus(tx.id, finalStatus, finalDetails);
                             if(finalStatus === 'SUCCESS') {
                                dispatch({ type: 'SET_USER', payload: { ...state.user, kyc: { status: 'verified', aadhaar: 'verified', pan: 'verified', bank: 'verified' } } });
                                addToast("KYC Verification Successful!", 'success');
                            } else {
                                dispatch({ type: 'SET_USER', payload: { ...state.user, kyc: initialKycState } });
                                addToast("KYC Verification Failed.", 'error');
                            }
                         }, state.metrics.DPI.status === 'Operational' ? 2000 : 10000);
                         break;
                     case 'UPI_MANDATE':
                        setTimeout(() => {
                            const finalStatus: TransactionEvent['status'] = Math.random() > 0.1 ? 'SUCCESS' : 'FAILED';
                            const finalDetails = tx.details.replace('sent', finalStatus === 'SUCCESS' ? 'activated' : 'failed');
                            updateTransactionStatus(tx.id, finalStatus, finalDetails);
                            if(finalStatus === 'SUCCESS') {
                                dispatch({ type: 'SET_USER', payload: { ...state.user, upiAutopay: {...state.user.upiAutopay, status: 'active'} } });
                                addToast("UPI Auto Top-up Mandate Active!", 'success');
                            } else {
                                dispatch({ type: 'SET_USER', payload: { ...state.user, upiAutopay: {...state.user.upiAutopay, status: 'none'} } });
                                addToast("UPI Mandate setup failed.", 'error');
                            }
                        }, 3000);
                        break;
                     case 'FUNDING':
                        setTimeout(() => {
                            const finalStatus: TransactionEvent['status'] = Math.random() > 0.05 ? 'SUCCESS' : 'FAILED';
                            const finalDetails = tx.details.replace('initiated', finalStatus === 'SUCCESS' ? 'successful' : 'failed');
                            updateTransactionStatus(tx.id, finalStatus, finalDetails);
                             if(finalStatus === 'SUCCESS' && !tx.details.includes('[PROCESSED]')) {
                                const amountMatch = tx.details.match(/₹([\d,]+)/);
                                if (amountMatch) {
                                    const amount = parseInt(amountMatch[1].replace(/,/g, ''), 10);
                                    dispatch({ type: 'SET_USER', payload: { ...state.user, walletBalance: state.user.walletBalance + amount } });
                                    addToast(`Wallet funded with ₹${amount.toLocaleString()}.`, 'success');
                                }
                                tx.details += ' [PROCESSED]';
                            }
                        }, 2500);
                        break;
                }
            }
        });
    }, [state.transactions, state.bonds, state.activeScenario, state.isContingencyMode, state.metrics.DPI.status, addTransaction, updateTransactionStatus, addToast, state.user]);


    // --- Trade and KYC/UPI Handlers ---
    const handleTrade = useCallback((bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => {
        if (state.isCircuitBreakerTripped) {
            addToast("Trading is temporarily halted due to extreme market volatility.", "error");
            return;
        }
        if (state.user.kyc.status !== 'verified') {
            addToast("Please complete KYC verification before trading.", "error");
            return;
        }
        const tradeValue = bond.currentPrice * quantity;

        if (tradeType === 'buy' && state.user.walletBalance < tradeValue) {
            addToast("Insufficient funds.", "error");
            return;
        }
        
        addTransaction({ type: 'ORDER', status: 'PENDING', details: `[${bond.isin}] ${tradeType.toUpperCase()} order for ${quantity.toFixed(4)} units submitted.` });

        dispatch({ type: 'SET_USER', payload: { ...state.user, walletBalance: state.user.walletBalance + (tradeType === 'sell' ? tradeValue : -tradeValue) } });
        
        const newPortfolio = [...state.userPortfolio];
        const holdingIndex = newPortfolio.findIndex(h => h.bondId === bond.id);
        if (holdingIndex > -1) {
            const holding = newPortfolio[holdingIndex];
            if (tradeType === 'buy') {
                const newTotalValue = (holding.purchasePrice * holding.quantity) + tradeValue;
                holding.quantity += quantity;
                holding.purchasePrice = newTotalValue / holding.quantity;
            } else {
                holding.quantity -= quantity;
                if (holding.quantity <= 0.0001) newPortfolio.splice(holdingIndex, 1);
            }
        } else if (tradeType === 'buy') {
            newPortfolio.push({ bondId: bond.id, quantity: quantity, purchasePrice: bond.currentPrice });
        }
        dispatch({ type: 'SET_PORTFOLIO', payload: newPortfolio });
        addToast(`${tradeType.toUpperCase()} order for ${bond.name.split(' ')[0]} submitted!`);
    }, [state.user, state.userPortfolio, state.isCircuitBreakerTripped, addTransaction, addToast]);

    const handleSubmitKyc = () => {
        dispatch({ type: 'SET_USER', payload: { ...state.user, kyc: { ...state.user.kyc, status: 'pending' }} });
        addTransaction({ type: 'KYC', status: 'PENDING', details: `Full KYC verification submitted.` });
        addToast("KYC verification process started.");
    };

    const handleStartUpiMandate = () => {
        dispatch({ type: 'SET_USER', payload: {...state.user, upiAutopay: {...state.user.upiAutopay, status: 'pending'} } });
        addTransaction({ type: 'UPI_MANDATE', status: 'PENDING', details: `UPI Autopay mandate request sent.` });
        addToast("UPI Auto Top-up mandate request sent.");
    };

    const handleAddFunds = (amount: number) => {
        addTransaction({ type: 'FUNDING', status: 'PENDING', details: `Wallet funding of ₹${amount.toLocaleString()} initiated.` });
        addToast(`Funding request for ₹${amount.toLocaleString()} submitted.`);
    };
    
    // This is the simulation part from the old hook, adapted to the new state management
    const runScenario = (scenario: ScenarioType) => dispatch({ type: 'SET_SCENARIO', payload: scenario });

    // Return everything needed by the UI
    return {
        backendState: state,
        isLoading,
        toasts,
        addToast,
        handleConnectWallet,
        handleDisconnectWallet,
        handleTrade,
        handleSubmitKyc,
        handleStartUpiMandate,
        handleAddFunds,
    };
};
