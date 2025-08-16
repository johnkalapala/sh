
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ViewState, PortfolioHolding, Bond, User, ToastMessage, TransactionEvent } from './types';
import { INITIAL_USER_PORTFOLIO, BONDS, INITIAL_USER_BALANCE } from './constants';
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
import ContingencyBanner from './components/ContingencyBanner';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>({ page: 'dashboard' });
  const [user, setUser] = useState<User>({ isConnected: false, walletAddress: '', balance: 0, kycStatus: 'unverified' });
  const [userPortfolio, setUserPortfolio] = useState<PortfolioHolding[]>(INITIAL_USER_PORTFOLIO);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  const backendState = useBackendSimulator(BONDS);
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
      balance: INITIAL_USER_BALANCE,
      kycStatus: 'unverified',
    });
    addToast("Wallet connected successfully!");
  };
  
  const handleDisconnectWallet = () => {
    setUser({ isConnected: false, walletAddress: '', balance: 0, kycStatus: 'unverified' });
    addToast("Wallet disconnected.", "error");
  };

  const handleOpenKycModal = () => setIsKycModalOpen(true);
  const handleCloseKycModal = () => setIsKycModalOpen(false);

  const handleStartKyc = () => {
    setUser(prev => ({ ...prev, kycStatus: 'pending' }));
    backendState.addTransaction({
        type: 'KYC',
        status: 'PENDING',
        details: `KYC verification submitted for ${user.walletAddress}`
    });
    addToast("KYC verification process started.");
  };

  useEffect(() => {
    if (user.kycStatus === 'pending') {
      const kycTx = backendState.transactions.find(
        (tx: TransactionEvent) => tx.type === 'KYC' && tx.status !== 'PENDING'
      );
      if (kycTx) {
        if (kycTx.status === 'SUCCESS') {
          setUser(prev => ({ ...prev, kycStatus: 'verified' }));
          addToast("KYC Verification Successful!", 'success');
        } else {
          setUser(prev => ({ ...prev, kycStatus: 'unverified' }));
          addToast("KYC Verification Failed. Please try again.", 'error');
        }
      }
    }
  }, [backendState.transactions, user.kycStatus, addToast]);


  const handleTrade = useCallback((bond: Bond, quantity: number, tradeType: 'buy' | 'sell') => {
    if (user.kycStatus !== 'verified') {
        addToast("Please complete KYC verification before trading.", "error");
        return;
    }
    const tradeValue = bond.currentPrice * quantity;

    if (tradeType === 'buy' && user.balance < tradeValue) {
      addToast("Insufficient funds to complete this transaction.", "error");
      return;
    }
    
    backendState.addTransaction({
        type: 'ORDER',
        status: 'PENDING',
        details: `[${bond.isin}] ${tradeType.toUpperCase()} order for ${quantity.toFixed(4)} units submitted.`
    });


    setUser(prevUser => ({...prevUser, balance: prevUser.balance + (tradeType === 'sell' ? tradeValue : -tradeValue) }));

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
  }, [user.balance, user.kycStatus, addToast, backendState.addTransaction]);

  const bondsWithLiveData = useMemo(() => 
    BONDS.map(b => backendState.liveBondData[b.id] || b), 
  [backendState.liveBondData]);

  const renderPage = () => {
    const pageProps = { navigate, user, handleTrade, userPortfolio, addToast, backendState, isContingencyMode };

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
        return <SystemAnalytics backendState={backendState} />;
      case 'integrations':
        return <Integrations />;
      case 'hardware-acceleration':
        return <HardwareAcceleration />;
      default:
        return <Dashboard {...pageProps} topMovers={backendState.topMovers} />;
    }
  };

  if (!user.isConnected) {
    return <LoginModal onConnect={handleConnectWallet} />;
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
          {user.kycStatus !== 'verified' && (
              <KycBanner status={user.kycStatus} onStartKyc={handleOpenKycModal} />
          )}
          {isKycModalOpen && <KycModal onClose={handleCloseKycModal} onKycSubmit={handleStartKyc} />}
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;