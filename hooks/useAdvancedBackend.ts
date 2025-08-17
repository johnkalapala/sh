
import { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { Bond, SystemMetrics, TransactionEvent, AnalyticsLog, ServiceName, ScenarioType, User, PortfolioHolding, ToastMessage } from '../types';
import { INITIAL_SYSTEM_METRICS, INITIAL_USER_WALLET_BALANCE } from '../constants';
import backendApiService from '../services/backendApiService';
import { loadState, saveState, clearState } from '../utils/storage';
import { parseBondData } from '../utils/parser';

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
    isPriceSimulationEnabled: boolean;
};

type Action =
  | { type: 'SET_BONDS'; payload: { bonds: Bond[], totalItems: number } }
  | { type: 'UPDATE_BOND_PRICES'; payload: { bondIds: string[], newPrices: number[] } }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_PORTFOLIO'; payload: PortfolioHolding[] }
  | { type: 'ADD_TRANSACTION'; payload: TransactionEvent }
  | { type: 'UPDATE_TRANSACTION'; payload: { txId: string; status: TransactionEvent['status']; details: string, dltHash?: string } }
  | { type: 'ADD_ANALYTICS_LOG'; payload: AnalyticsLog }
  | { type: 'SET_METRICS'; payload: SystemMetrics }
  | { type: 'SET_SCENARIO'; payload: ScenarioType }
  | { type: 'SET_CIRCUIT_BREAKER'; payload: boolean }
  | { type: 'SET_INITIAL_STATE'; payload: { user: User; portfolio: PortfolioHolding[] } }
  | { type: 'RESET_MARKET_DATA' }
  | { type: 'TOGGLE_PRICE_SIMULATION' };


const reducer = (state: BackendState, action: Action): BackendState => {
    switch(action.type) {
        case 'SET_INITIAL_STATE':
            return { ...state, user: action.payload.user, userPortfolio: action.payload.portfolio };
        case 'SET_BONDS': {
            const { bonds, totalItems } = action.payload;
            // Only update top movers and volume if there's data
            const topMovers = totalItems > 0 ? backendApiService.getTopMovers(5) : [];
            const totalVolume = totalItems > 0 ? backendApiService.getTotalVolume() : 0;
            return { ...state, bonds, topMovers, totalVolume };
        }
        case 'UPDATE_BOND_PRICES': {
            const priceMap = new Map(action.payload.bondIds.map((id, index) => [id, action.payload.newPrices[index]]));
            const updatedBonds = state.bonds.map(bond => 
                priceMap.has(bond.id) ? { ...bond, currentPrice: priceMap.get(bond.id)! } : bond
            );
            return { ...state, bonds: updatedBonds };
        }
        case 'RESET_MARKET_DATA':
            return { ...state, bonds: [], topMovers: [], totalVolume: 0 };
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_PORTFOLIO':
            return { ...state, userPortfolio: action.payload };
        case 'ADD_TRANSACTION':{
             const newTransactions = [action.payload, ...state.transactions].slice(0, 200);
            return { ...state, transactions: newTransactions };
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
        case 'TOGGLE_PRICE_SIMULATION':
            return { ...state, isPriceSimulationEnabled: !state.isPriceSimulationEnabled };
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
        isPriceSimulationEnabled: false,
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [isCustomDataLoaded, setIsCustomDataLoaded] = useState(false);
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const itemsPerPage = 12;

    const priceSimulationInterval = useRef<number | null>(null);
    const backendStateRef = useRef(state);
    backendStateRef.current = state;

    // --- Price Simulation ---
    useEffect(() => {
        if (state.isPriceSimulationEnabled && state.bonds.length > 0) {
            priceSimulationInterval.current = window.setInterval(() => {
                const currentBonds = backendStateRef.current.bonds;
                if (currentBonds.length === 0) return;

                const visibleBondIds = currentBonds.map(b => b.id);
                const newPrices = currentBonds.map(b => {
                    const jitter = (Math.random() - 0.5) * (b.currentPrice * 0.0005);
                    return parseFloat((b.currentPrice + jitter).toFixed(2));
                });
                dispatch({ type: 'UPDATE_BOND_PRICES', payload: { bondIds: visibleBondIds, newPrices } });
            }, 1500);
        } else {
            if (priceSimulationInterval.current) {
                clearInterval(priceSimulationInterval.current);
            }
        }
        return () => {
            if (priceSimulationInterval.current) {
                clearInterval(priceSimulationInterval.current);
            }
        };
    }, [state.isPriceSimulationEnabled, state.bonds.length > 0]);
    

    // --- Toast Handler ---
    const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [{ id, message, type }, ...prev].slice(0, 5));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);
    
    // --- Data Fetching and Pagination ---
    const fetchPaginatedBonds = useCallback(() => {
        const { bonds, totalPages, totalItems } = backendApiService.getBonds({
            page: pagination.currentPage,
            limit: itemsPerPage,
            search: searchQuery,
            filters,
        });
        dispatch({ type: 'SET_BONDS', payload: { bonds, totalItems } });
        setPagination(p => ({ ...p, totalPages, totalItems }));
    }, [pagination.currentPage, searchQuery, filters]);

    useEffect(() => {
        // This effect now runs whenever the underlying data changes, or pagination/filters are updated
        if (!isLoading) {
            fetchPaginatedBonds();
        }
    }, [fetchPaginatedBonds, isLoading]);
    
    // Reset page to 1 when search or filters change
    useEffect(() => {
        setPagination(p => ({ ...p, currentPage: 1 }));
    }, [searchQuery, filters]);
    
    // --- Initial Load ---
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('./bonds.json');
                if (!response.ok) throw new Error("Sample data not found");
                const sampleBonds = await response.json();
                backendApiService.initializeData(sampleBonds);
                
                const savedState = loadState();
                if (savedState) {
                    dispatch({ type: 'SET_INITIAL_STATE', payload: savedState });
                } else {
                    const initialPortfolio = backendApiService.getInitialPortfolio(3);
                    dispatch({ type: 'SET_PORTFOLIO', payload: initialPortfolio });
                }
                
            } catch (error) {
                console.error("Failed to load initial sample data", error);
                addToast("Could not load sample market data.", "error");
            } finally {
                setIsLoading(false); // This will trigger the fetchPaginatedBonds effect
            }
        };
        loadInitialData();
    }, [addToast]);
    
    // --- Persist State ---
    useEffect(() => {
        if (state.user.isConnected) {
            saveState({ user: state.user, portfolio: state.userPortfolio });
        }
    }, [state.user, state.userPortfolio]);

    const loadBondsFromFile = async (file: File) => {
        setUploadProgress(0);
        try {
            const parsedBonds = await parseBondData(file, (progress) => setUploadProgress(progress));
            dispatch({ type: 'RESET_MARKET_DATA' }); // Clear old data
            backendApiService.initializeData(parsedBonds);
            
            // Critical Step: Reset search/filters and pagination to trigger a re-fetch of the new data
            setSearchQuery(''); 
            setFilters({});
            // This will trigger the fetchPaginatedBonds effect to load the first page of new data
            setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 }); 

            setIsCustomDataLoaded(true);
            addToast(`Successfully loaded ${parsedBonds.length} bonds.`, 'success');
        } catch (error) {
            addToast(String(error), 'error');
            throw error;
        } finally {
            setUploadProgress(0);
        }
    };


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
        
        addToast("Wallet connected successfully!");
    };
    
    const handleDisconnectWallet = () => {
        clearState();
        dispatch({ type: 'SET_USER', payload: initialUserState });
        dispatch({ type: 'SET_PORTFOLIO', payload: [] });
        addToast("Wallet disconnected.", "error");
    };

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

    // --- Trade and KYC/UPI Handlers ---
    const handleTrade = useCallback(async (bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => {
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
        
        const orderTx = addTransaction({ type: 'ORDER', status: 'PENDING', details: `[${bond.isin}] ${tradeType.toUpperCase()} order for ${quantity.toFixed(4)} units submitted.` });

        try {
            const result = await backendApiService.submitTrade(bond, quantity, tradeType);
            updateTransactionStatus(orderTx.id, 'SUCCESS', `Order for ${quantity.toFixed(4)} units of ${bond.isin} confirmed.`);
            const settlementTx = addTransaction({ type: 'SETTLEMENT', status: 'PENDING', dltHash: result.txHash, details: `Settlement pending for trade on ${bond.isin}.`});
            
            setTimeout(() => {
                updateTransactionStatus(settlementTx.id, 'SUCCESS', `Trade for ${quantity.toFixed(4)} units of ${bond.isin} settled on Polygon.`);
            }, 2000);

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
            addToast(`${tradeType.toUpperCase()} order for ${bond.name.split(' ')[0]} successful!`);

        } catch (error) {
            addToast(`Trade failed: ${String(error)}`, 'error');
            updateTransactionStatus(orderTx.id, 'FAILED', `Order for ${bond.isin} failed to execute.`);
        }

    }, [state.user, state.userPortfolio, state.isCircuitBreakerTripped, addTransaction, updateTransactionStatus, addToast]);

    const handleSubmitKyc = async () => {
        dispatch({ type: 'SET_USER', payload: { ...state.user, kyc: { ...state.user.kyc, status: 'pending' }} });
        const kycTx = addTransaction({ type: 'KYC', status: 'PENDING', details: `Full KYC verification submitted.` });
        
        try {
            await backendApiService.submitKyc(state.user.walletAddress);
            updateTransactionStatus(kycTx.id, 'SUCCESS', `KYC for ${state.user.walletAddress} verified.`);
            dispatch({ type: 'SET_USER', payload: { ...state.user, kyc: { status: 'verified', aadhaar: 'verified', pan: 'verified', bank: 'verified' } } });
            addToast("KYC Verification Successful!", 'success');
        } catch (error) {
            updateTransactionStatus(kycTx.id, 'FAILED', `KYC verification failed.`);
            dispatch({ type: 'SET_USER', payload: { ...state.user, kyc: initialKycState } });
            addToast("KYC Verification Failed.", 'error');
        }
    };

    const handleStartUpiMandate = () => {
        dispatch({ type: 'SET_USER', payload: {...state.user, upiAutopay: {...state.user.upiAutopay, status: 'pending'} } });
        addTransaction({ type: 'UPI_MANDATE', status: 'PENDING', details: `UPI Autopay mandate request sent.` });
        addToast("UPI Auto Top-up mandate request sent.");
        
        setTimeout(() => {
             const finalStatus: TransactionEvent['status'] = Math.random() > 0.1 ? 'SUCCESS' : 'FAILED';
              if(finalStatus === 'SUCCESS') {
                dispatch({ type: 'SET_USER', payload: { ...state.user, upiAutopay: {...state.user.upiAutopay, status: 'active'} } });
                addToast("UPI Auto Top-up Mandate Active!", 'success');
            } else {
                dispatch({ type: 'SET_USER', payload: { ...state.user, upiAutopay: {...state.user.upiAutopay, status: 'none'} } });
                addToast("UPI Mandate setup failed.", 'error');
            }
        }, 3000);
    };

    const handleAddFunds = (amount: number) => {
        addTransaction({ type: 'FUNDING', status: 'PENDING', details: `Wallet funding of ₹${amount.toLocaleString()} initiated.` });
        addToast(`Funding request for ₹${amount.toLocaleString()} submitted.`);
        
        setTimeout(() => {
            dispatch({ type: 'SET_USER', payload: { ...state.user, walletBalance: state.user.walletBalance + amount } });
            addToast(`Wallet funded with ₹${amount.toLocaleString()}.`, 'success');
        }, 2500);
    };
    
    const runScenario = (scenario: ScenarioType) => {
        dispatch({ type: 'SET_SCENARIO', payload: scenario });
    }

    // Return everything needed by the UI
    return {
        backendState: {
            ...state,
            togglePriceSimulation: () => dispatch({ type: 'TOGGLE_PRICE_SIMULATION' }),
            runScenario
        },
        isLoading,
        toasts,
        addToast,
        handleConnectWallet,
        handleDisconnectWallet,
        handleTrade,
        handleSubmitKyc,
        handleStartUpiMandate,
        handleAddFunds,
        isCustomDataLoaded,
        isUploaderOpen,
        uploadProgress,
        openUploader: () => setIsUploaderOpen(true),
        closeUploader: () => setIsUploaderOpen(false),
        loadBondsFromFile,
        searchBonds: setSearchQuery,
        setBondFilters: setFilters,
        pagination,
        setPagination
    };
};
