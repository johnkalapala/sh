import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ViewState, PortfolioHolding, Bond, User, ToastMessage, TransactionEvent } from './types';
import { INITIAL_USER_WALLET_BALANCE } from './constants';
import { useBackendSimulator } from './hooks/useBackendSimulator';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Portfolio from './components/Portfolio';
import BondDetail from './components/BondDetail';
import SystemAnalytics from './components/analytics/SystemAnalytics';
import Integrations from './components/Integrations';
import HardwareAcceleration from './components/HardwareAcceleration';
import LoginModal from './components/LoginModal';
import Header from './components/Header';
import Toast from './components/Toast';
import KycBanner from './components/KycBanner';
import KycModal from './components/KycModal';
import UpiBanner from './components/UpiBanner';
import UpiMandateModal from './components/UpiMandateModal';
import ContingencyBanner from './components/ContingencyBanner';
import AddFundsModal from './components/AddFundsModal';
import Spinner from './components/shared/Spinner';
import ProfileSettings from './components/ProfileSettings';

const initialKycState = {
  status: 'unverified' as 'unverified' | 'pending' | 'verified',
  aadhaar: 'unverified' as 'unverified' | 'verified',
  pan: 'unverified' as 'unverified' | 'verified',
  bank: 'unverified' as 'unverified' | 'verified',
};

const App: React.FC = () => {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>({ page: 'dashboard' });
  const [user, setUser] = useState<User>({ 
    isConnected: false, 
    walletAddress: '', 
    walletBalance: 0, 
    kyc: initialKycState,
    upiAutopay: { status: 'none', threshold: 50000, amount: 200000 }
  });
  const [userPortfolio, setUserPortfolio] = useState<PortfolioHolding[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);

  // Fetch bond data on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/bonds.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Bond[] = await response.json();
        setBonds(data);

        // Dynamically generate an initial portfolio after data is loaded
        const portfolioBondsSample = [...data].sort(() => 0.5 - Math.random()).slice(0, 3);
        const initialPortfolio: PortfolioHolding[] = portfolioBondsSample.map(bond => ({
          bondId: bond.id,
          quantity: Math.floor(Math.random() * 450 + 50) * 100,
          purchasePrice: parseFloat((bond.currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2))
        }));
        setUserPortfolio(initialPortfolio);
        
      } catch (error) {
        console.error("Failed to fetch bond data:", error);
        addToast("Failed to load market data.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const backendState = useBackendSimulator(bonds, user.upiAutopay.status === 'active');
  const { activeScenario, isContingencyMode } = backendState;

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [{ id, message, type }, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (activeScenario === 'VOLATILITY_SPIKE') {
        addToast('[Swarm Intelligence] Adapting to volatility.', 'success');
    } else if (activeScenario === 'API_GATEWAY_OVERLOAD') {
        addToast('[AIS] Anomalous traffic detected. Hardening gateway.', 'error');
    }
  }, [activeScenario, addToast]);

  const navigate = useCallback((view: ViewState) => {
    setCurrentView(view);
  }, []);

  const handleConnectWallet = () => {
    const randomAddress = `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setUser({
      isConnected: true,
      walletAddress: randomAddress,
      walletBalance: INITIAL_USER_WALLET_BALANCE,
      kyc: initialKycState,
      upiAutopay: { status: 'none', threshold: 50000, amount: 200000 }
    });
    addToast("Wallet connected successfully!");
  };
  
  const handleDisconnectWallet = () => {
    setUser({ isConnected: false, walletAddress: '', walletBalance: 0, kyc: initialKycState, upiAutopay: { status: 'none', threshold: 50000, amount: 200000 } });
    addToast("Wallet disconnected.", "error");
  };

  const handleOpenKycModal = () => setIsKycModalOpen(true);
  const handleCloseKycModal = () => setIsKycModalOpen(false);
  const handleOpenUpiModal = () => setIsUpiModalOpen(true);
  const handleCloseUpiModal = () => setIsUpiModalOpen(false);
  const handleOpenAddFundsModal = () => setIsAddFundsModalOpen(true);
  const handleCloseAddFundsModal = () => setIsAddFundsModalOpen(false);

  const handleSubmitKyc = () => {
    setUser(prev => ({ ...prev, kyc: { ...prev.kyc, status: 'pending' }}));
    backendState.addTransaction({
        type: 'KYC',
        status: 'PENDING',
        details: `Full KYC verification submitted for ${user.walletAddress}`
    });
    addToast("Full KYC verification process started.");
  };

  const handleStartUpiMandate = () => {
      setUser(prev => ({...prev, upiAutopay: {...prev.upiAutopay, status: 'pending'} }));
       backendState.addTransaction({
        type: 'UPI_MANDATE',
        status: 'PENDING',
        details: `UPI Autopay mandate request sent for ₹${user.upiAutopay.amount.toLocaleString()}.`
    });
    addToast("UPI Auto Top-up mandate request sent.");
  };

   const handleAddFunds = (amount: number) => {
      backendState.addTransaction({
        type: 'FUNDING',
        status: 'PENDING',
        details: `Wallet funding of ₹${amount.toLocaleString()} initiated.`
    });
    addToast(`Funding request for ₹${amount.toLocaleString()} submitted.`);
  };


  useEffect(() => {
    // Process KYC Transactions
    const kycTx = backendState.transactions.find(
      (tx: TransactionEvent) => tx.type === 'KYC' && tx.status !== 'PENDING' && user.kyc.status === 'pending'
    );
    if (kycTx) {
      if (kycTx.status === 'SUCCESS') {
        setUser(prev => ({ ...prev, kyc: { status: 'verified', aadhaar: 'verified', pan: 'verified', bank: 'verified' } }));
        addToast("KYC Verification Successful!", 'success');
      } else {
        setUser(prev => ({ ...prev, kyc: initialKycState }));
        addToast("KYC Verification Failed. Please try again.", 'error');
      }
    }
    
    // Process UPI Mandate Transactions
    const upiTx = backendState.transactions.find(
        (tx: TransactionEvent) => tx.type === 'UPI_MANDATE' && tx.status !== 'PENDING' && user.upiAutopay.status === 'pending'
    );
     if (upiTx) {
        if (upiTx.status === 'SUCCESS') {
            setUser(prev => ({ ...prev, upiAutopay: {...prev.upiAutopay, status: 'active'} }));
            addToast("UPI Auto Top-up Mandate Active!", 'success');
        } else {
            setUser(prev => ({ ...prev, upiAutopay: {...prev.upiAutopay, status: 'none'} }));
            addToast("UPI Mandate setup failed. Please try again.", 'error');
        }
    }

    // Process FUNDING Transactions
    const pendingFundingTxs = backendState.transactions.filter(
      (tx: TransactionEvent) => tx.type === 'FUNDING' && tx.status === 'SUCCESS' && !tx.details.includes('[PROCESSED]')
    );
    if (pendingFundingTxs.length > 0) {
        let newBalance = user.walletBalance;
        pendingFundingTxs.forEach(tx => {
            const amountMatch = tx.details.match(/₹([\d,]+)/);
            if (amountMatch) {
                const amount = parseInt(amountMatch[1].replace(/,/g, ''), 10);
                newBalance += amount;
            }
            tx.details += ' [PROCESSED]'; // Mark as processed to avoid re-adding
        });
        setUser(prev => ({...prev, walletBalance: newBalance}));
        addToast(`Wallet funded successfully.`, 'success');
    }

  }, [backendState.transactions, user.kyc.status, user.upiAutopay.status, addToast, user.walletBalance]);


  const handleTrade = useCallback((bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => {
    // In a production app, ALL of this logic would be executed on a secure backend server.
    if (user.kyc.status !== 'verified') {
        addToast("Please complete KYC verification before trading.", "error");
        return;
    }
    
    const tradeValue = bond.currentPrice * quantity;

    if (tradeType === 'buy' && user.walletBalance < tradeValue) {
      addToast("Insufficient funds in wallet to complete this transaction.", "error");
      handleOpenAddFundsModal();
      return;
    }
    
    backendState.addTransaction({
        type: 'ORDER',
        status: 'PENDING',
        details: `[${bond.isin}] ${tradeType.toUpperCase()} order for ${quantity.toFixed(4)} units submitted.`
    });

    setUser(prevUser => {
        const newWalletBalance = prevUser.walletBalance + (tradeType === 'sell' ? tradeValue : -tradeValue);
        backendState.updateSimulatedWalletBalance(newWalletBalance); // Inform simulator of balance change
        return {...prevUser, walletBalance: newWalletBalance };
    });

    setUserPortfolio(prevPortfolio => {
      const newPortfolio = [...prevPortfolio];
      const holdingIndex = newPortfolio.findIndex(h => h.bondId === bond.id);

      if (holdingIndex > -1) {
        const existingHolding = newPortfolio[holdingIndex];
        if (tradeType === 'buy') {
          const newTotalQuantity = existingHolding.quantity + quantity;
          const newTotalValue = (existingHolding.purchasePrice * existingHolding.quantity) + tradeValue;
          existingHolding.purchasePrice = newTotalValue / newTotalQuantity;
          existingHolding.quantity = newTotalQuantity;
        } else {
          existingHolding.quantity -= quantity;
          if (existingHolding.quantity <= 0) {
            newPortfolio.splice(holdingIndex, 1);
          }
        }
      } else if (tradeType === 'buy') {
        newPortfolio.push({
          bondId: bond.id,
          quantity: quantity,
          purchasePrice: bond.currentPrice,
        });
      }
      return newPortfolio;
    });

    addToast(`${tradeType.toUpperCase()} order for ${bond.name.split(' ')[0]} submitted!`);
  }, [user.walletBalance, user.kyc.status, addToast, backendState]);

  const bondsWithLiveData = useMemo(() => 
    bonds.map(b => backendState.liveBondData[b.id] || b), 
  [backendState.liveBondData, bonds]);

  const showUpiBanner = user.kyc.status === 'verified' && user.upiAutopay.status !== 'active' && user.walletBalance < user.upiAutopay.threshold;

  const renderPage = () => {
    const pageProps = { navigate, user, handleTrade, userPortfolio, addToast, backendState, isContingencyMode, onOpenAddFunds: handleOpenAddFundsModal, bonds };

    switch (currentView.page) {
      case 'dashboard':
        return <Dashboard {...pageProps} topMovers={backendState.topMovers} />;
      case 'marketplace':
        return <Marketplace {...pageProps} bonds={bondsWithLiveData} />;
      case 'portfolio':
        return <Portfolio {...pageProps} />;
      case 'bondDetail':
        return currentView.bondId ? <BondDetail bondId={currentView.bondId} {...pageProps} /> : <Marketplace {...pageProps} bonds={bondsWithLiveData} />;
      case 'system-analytics':
        return <SystemAnalytics backendState={backendState} bonds={bonds} />;
      case 'integrations':
        return <Integrations />;
      case 'hardware-acceleration':
        return <HardwareAcceleration />;
      case 'profile-settings':
        return <ProfileSettings user={user} onOpenUpiModal={handleOpenUpiModal} onOpenAddFundsModal={handleOpenAddFundsModal} />;
      default:
        return <Dashboard {...pageProps} topMovers={backendState.topMovers} />;
    }
  };

  if (!user.isConnected) {
    return <LoginModal onConnect={handleConnectWallet} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg font-sans flex">
      <Toast toasts={toasts} />
      <Sidebar currentPage={currentView.page} navigate={navigate} />
      <div className="flex-1 flex flex-col">
        <Header 
          currentPage={currentView.page} 
          user={user}
          onDisconnect={handleDisconnectWallet}
          activeScenario={backendState.activeScenario}
          isContingencyMode={isContingencyMode}
        />
        {isContingencyMode && <ContingencyBanner />}
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
          {user.kyc.status !== 'verified' && (
              <KycBanner status={user.kyc.status} onStartKyc={handleOpenKycModal} />
          )}
          {showUpiBanner && (
              <UpiBanner status={user.upiAutopay.status} onStartUpi={handleOpenUpiModal} />
          )}
          {isKycModalOpen && <KycModal onClose={handleCloseKycModal} onKycSubmit={handleSubmitKyc} />}
          {isUpiModalOpen && <UpiMandateModal onClose={handleCloseUpiModal} onUpiSubmit={handleStartUpiMandate} />}
          {isAddFundsModalOpen && <AddFundsModal onClose={handleCloseAddFundsModal} onAddFunds={handleAddFunds} />}
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;